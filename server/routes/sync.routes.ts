import express, { Request, Response } from 'express';
import { Department, Position, Employee, SyncLog } from '../models';
import {
  syncDepartmentsFromExternal,
  syncPositionsFromExternal,
  syncEmployeesFromExternal,
  testExternalApiConnection,
} from '../services/externalApiService';

const router = express.Router();

// Test external API connection
router.post('/test-external-api', async (req: Request, res: Response) => {
  try {
    console.log('🔌 Testing external API connection...');
    const result = await testExternalApiConnection();

    res.json(result);
  } catch (error: any) {
    res.status(500).json({
      success: false,
      message: error.message || 'Failed to test API connection',
    });
  }
});

// Sync all data endpoint (Departments -> Positions -> Employees in sequence)
router.post('/sync-all', async (req: Request, res: Response) => {
  const { syncedBy } = req.body;
  const sourceIp = req.ip || req.connection.remoteAddress || 'unknown';

  let departmentsCount = 0;
  let positionsCount = 0;
  let employeesCount = 0;
  let status: 'success' | 'failed' | 'partial' = 'success';
  let errorMessage = '';

  try {
    console.log('🔄 Starting full data synchronization...');
    console.log(`👤 Synced by: ${syncedBy || 'System'}`);
    console.log(`🌐 Source IP: ${sourceIp}`);

    // Step 1: Sync Departments
    console.log('📁 Step 1/3: Syncing departments...');
    const deptResult = await syncDepartmentsFromExternal();
    if (deptResult.success && deptResult.data) {
      const departments = Array.isArray(deptResult.data) ? deptResult.data : [];
      for (const dept of departments) {
        await Department.upsert({
          departmentID: dept.departmentID || dept.department_id,
          deskripsi: dept.deskripsi,
          induk: dept.induk,
          isDepartment: dept.isDepartment || dept.is_department || 'N',
        });
        departmentsCount++;
      }
      console.log(`✅ Synced ${departmentsCount} departments`);
    } else {
      throw new Error(deptResult.message || 'Failed to sync departments');
    }

    // Step 2: Sync Positions
    console.log('💼 Step 2/3: Syncing positions...');
    const posResult = await syncPositionsFromExternal();
    if (posResult.success && posResult.data) {
      const positions = Array.isArray(posResult.data) ? posResult.data : [];

      // Get valid department IDs for validation
      const existingDepartments = await Department.findAll({
        attributes: ['departmentID'],
      });
      const validDepartmentIDs = new Set(existingDepartments.map(d => d.departmentID));

      for (const pos of positions) {
        const departmentValue = pos.department ? String(pos.department) : null;
        const validDepartment = departmentValue && validDepartmentIDs.has(departmentValue)
          ? departmentValue
          : null;

        await Position.upsert({
          jabatanID: pos.jabatanID || pos.jabatan_id,
          deskripsi: pos.deskripsi,
          department: validDepartment,
          jabatanParentID: pos.jabatanParentID || pos.jabatan_parent_id,
          isMitra: pos.isMitra || pos.is_mitra || false,
          isOfficer: pos.isOfficer || pos.is_officer || false,
          isManager: pos.isManager || pos.is_manager || false,
          isVp: pos.isVp || pos.is_vp || false,
          isDirector: pos.isDirector || pos.is_director || false,
          isCommissioner: pos.isCommissioner || pos.is_commissioner || false,
          isSecretary: pos.isSecretary || pos.is_secretary || false,
          isDriver: pos.isDriver || pos.is_driver || false,
          isSecurity: pos.isSecurity || pos.is_security || false,
          isIntern: pos.isIntern || pos.is_intern || false,
          del: pos.del || false,
        });
        positionsCount++;
      }
      console.log(`✅ Synced ${positionsCount} positions`);
    } else {
      status = 'partial';
      errorMessage += 'Failed to sync positions. ';
      console.log('⚠️ Positions sync failed, continuing...');
    }

    // Step 3: Sync Employees
    console.log('👥 Step 3/3: Syncing employees...');
    const empResult = await syncEmployeesFromExternal();
    if (empResult.success && empResult.data) {
      const employees = Array.isArray(empResult.data) ? empResult.data : [];

      // Get valid department and position IDs
      const existingDepartments = await Department.findAll({
        attributes: ['departmentID'],
      });
      const validDepartmentIDs = new Set(existingDepartments.map(d => d.departmentID));

      const existingPositions = await Position.findAll({
        attributes: ['jabatanID'],
      });
      const validPositionIDs = new Set(existingPositions.map(p => p.jabatanID));

      for (const emp of employees) {
        // Skip if this employee already exists as super admin (protect super admin from being overwritten)
        const existingEmployee = await Employee.findByPk(emp.id);
        if (existingEmployee && existingEmployee.isSuperAdmin) {
          console.log(`⚠️  Skipping super admin user: ${existingEmployee.name} (${existingEmployee.email})`);
          continue;
        }

        const departmentValue = emp.department ? String(emp.department) : null;
        const jabatanValue = emp.jabatan ? Number(emp.jabatan) : null;

        const validDepartment = departmentValue && validDepartmentIDs.has(departmentValue)
          ? departmentValue
          : null;
        const validJabatan = jabatanValue && validPositionIDs.has(jabatanValue)
          ? jabatanValue
          : null;

        await Employee.upsert({
          id: emp.id,
          name: emp.name,
          email: emp.email,
          userName: emp.userName || emp.user_name,
          nip: emp.nip,
          department: validDepartment,
          jabatan: validJabatan,
          passwordHash: emp.passwordHash || emp.password_hash,
          gcg: emp.gcg || false,
          gcgAdmin: emp.gcgAdmin || emp.gcg_admin || false,
          codeOfConduct: emp.codeOfConduct || emp.code_of_conduct || false,
          conflictOfInterest: emp.conflictOfInterest || emp.conflict_of_interest || false,
          codeOfConductDt: emp.codeOfConductDt || emp.code_of_conduct_dt,
          conflictOfInterestDt: emp.conflictOfInterestDt || emp.conflict_of_interest_dt,
          isTkjp: emp.isTkjp || emp.is_tkjp || false,
          normalizedUserName: emp.normalizedUserName || emp.normalized_user_name,
          normalizedEmail: emp.normalizedEmail || emp.normalized_email,
          emailConfirmed: emp.emailConfirmed || emp.email_confirmed || false,
          securityStamp: emp.securityStamp || emp.security_stamp,
          concurrencyStamp: emp.concurrencyStamp || emp.concurrency_stamp,
          phoneNumber: emp.phoneNumber || emp.phone_number,
          phoneNumberConfirmed: emp.phoneNumberConfirmed || emp.phone_number_confirmed || false,
          twoFactorEnabled: emp.twoFactorEnabled || emp.two_factor_enabled || false,
          lockoutEnd: emp.lockoutEnd || emp.lockout_end,
          lockoutEnabled: emp.lockoutEnabled !== undefined ? emp.lockoutEnabled : (emp.lockout_enabled !== undefined ? emp.lockout_enabled : true),
          accessFailedCount: emp.accessFailedCount || emp.access_failed_count || 0,
          isSuperAdmin: false, // Ensure synced users are not marked as super admin
        });
        employeesCount++;
      }
      console.log(`✅ Synced ${employeesCount} employees`);
    } else {
      status = 'partial';
      errorMessage += 'Failed to sync employees. ';
      console.log('⚠️ Employees sync failed');
    }

    // Log the sync operation
    await SyncLog.create({
      syncType: 'all',
      status,
      syncedBy: syncedBy || 'System',
      sourceIp,
      departmentsCount,
      positionsCount,
      employeesCount,
      errorMessage: errorMessage || null,
    });

    console.log('✅ Full synchronization completed successfully!');
    res.json({
      success: true,
      message: 'Data synchronized successfully',
      data: {
        departmentsCount,
        positionsCount,
        employeesCount,
        status,
      },
    });
  } catch (error: any) {
    console.error('❌ Sync all error:', error);

    // Log the failed sync
    await SyncLog.create({
      syncType: 'all',
      status: 'failed',
      syncedBy: syncedBy || 'System',
      sourceIp,
      departmentsCount,
      positionsCount,
      employeesCount,
      errorMessage: error.message || 'Unknown error',
    });

    res.status(500).json({
      success: false,
      message: error.message || 'Failed to sync data',
      data: {
        departmentsCount,
        positionsCount,
        employeesCount,
      },
    });
  }
});

// Get last sync info (for master data pages)
router.get('/last-sync', async (req: Request, res: Response) => {
  try {
    const { type } = req.query;

    const whereClause = type ? { syncType: type } : {};

    const lastSync = await SyncLog.findOne({
      where: whereClause,
      order: [['syncedAt', 'DESC']],
    });

    res.json({
      success: true,
      data: lastSync,
    });
  } catch (error: any) {
    console.error('Error fetching last sync:', error);
    res.status(500).json({
      success: false,
      message: error.message || 'Failed to fetch last sync info',
    });
  }
});

// Get sync logs
router.get('/sync-logs', async (req: Request, res: Response) => {
  try {
    const { page = 1, pageSize = 10 } = req.query;
    const offset = (Number(page) - 1) * Number(pageSize);

    const { rows: logs, count: total } = await SyncLog.findAndCountAll({
      order: [['syncedAt', 'DESC']],
      limit: Number(pageSize),
      offset,
    });

    res.json({
      success: true,
      data: logs,
      pagination: {
        total,
        page: Number(page),
        pageSize: Number(pageSize),
        totalPages: Math.ceil(total / Number(pageSize)),
      },
    });
  } catch (error: any) {
    console.error('Error fetching sync logs:', error);
    res.status(500).json({
      success: false,
      message: error.message || 'Failed to fetch sync logs',
    });
  }
});

export default router;
