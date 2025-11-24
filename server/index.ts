import express from 'express';
import cors from 'cors';
import dotenv from 'dotenv';
import axios from 'axios';
import { initModels, RiskData, Department, Position, Employee, Achievement, SyncLog, Role, UserRole, sequelize } from './models';
import Target from './models/Target';
import { Op, QueryTypes } from 'sequelize';
import { 
  syncDepartmentsFromExternal, 
  syncPositionsFromExternal, 
  syncEmployeesFromExternal,
  testExternalApiConnection 
} from './services/externalApiService';

dotenv.config();

const app = express();
const PORT = process.env.PORT || 3001;

// Middleware
app.use(cors());
app.use(express.json({ limit: '50mb' })); // Increase payload limit for large data sync
app.use(express.urlencoded({ limit: '50mb', extended: true }));

// Initialize database and models
async function initializeDatabase() {
  try {
    await initModels();
    console.log('✅ Database and models initialized successfully');
  } catch (error) {
    console.error('❌ Database initialization failed:', error);
    process.exit(1);
  }
}

// Dashboard endpoints
app.get('/api/dashboard', async (req, res) => {
  try {
    const totalRecords = await RiskData.count();
    const sumResult = await RiskData.sum('value');
    const stats: any = await RiskData.findAll({
      attributes: [
        [sequelize.fn('AVG', sequelize.col('value')), 'avgValue'],
        [sequelize.fn('MAX', sequelize.col('value')), 'maxValue'],
        [sequelize.fn('MIN', sequelize.col('value')), 'minValue'],
      ],
      raw: true,
    });

    res.json({
      success: true,
      data: {
        totalRecords,
        totalValue: sumResult || 0,
        averageValue: stats[0]?.avgValue || 0,
        maxValue: stats[0]?.maxValue || 0,
        minValue: stats[0]?.minValue || 0,
      },
    });
  } catch (error) {
    console.error('Error fetching dashboard data:', error);
    res.status(500).json({
      success: false,
      error: 'Failed to fetch dashboard data',
    });
  }
});

app.get('/api/dashboard/charts/:type', async (req, res) => {
  const { type } = req.params;
  
  try {
    let data;
    
    switch (type) {
      case 'monthly':
        // Group by month for last 6 months
        data = await RiskData.findAll({
          attributes: [
            [sequelize.fn('FORMAT', sequelize.col('created_at'), 'MMM yyyy'), 'name'],
            [sequelize.fn('SUM', sequelize.col('value')), 'value'],
          ],
          where: {
            createdAt: {
              [Op.gte]: sequelize.literal('DATEADD(month, -6, GETDATE())'),
            },
          },
          group: [sequelize.fn('FORMAT', sequelize.col('created_at'), 'MMM yyyy')],
          raw: true,
        });
        break;
        
      case 'category':
        // Group by category
        data = await RiskData.findAll({
          attributes: [
            'category',
            [sequelize.fn('COUNT', sequelize.col('id')), 'value'],
          ],
          group: ['category'],
          raw: true,
        });
        break;
        
      case 'weekly':
        // Weekly trends
        data = await RiskData.findAll({
          attributes: [
            [sequelize.fn('DATEPART', sequelize.literal('week'), sequelize.col('created_at')), 'week'],
            [sequelize.fn('SUM', sequelize.col('value')), 'value'],
          ],
          group: [sequelize.fn('DATEPART', sequelize.literal('week'), sequelize.col('created_at'))],
          limit: 10,
          raw: true,
        });
        break;
        
      default:
        // Get recent records
        data = await RiskData.findAll({
          limit: 10,
          order: [['createdAt', 'DESC']],
        });
    }
    
    res.json({
      success: true,
      data: data,
    });
  } catch (error) {
    console.error('Error fetching chart data:', error);
    res.status(500).json({
      success: false,
      error: 'Failed to fetch chart data',
    });
  }
});

// Admin endpoints
app.get('/api/admin/data', async (req, res) => {
  try {
    const data = await RiskData.findAll({
      order: [['createdAt', 'DESC']],
    });
    
    res.json({
      success: true,
      data: data,
    });
  } catch (error) {
    console.error('Error fetching data:', error);
    res.status(500).json({
      success: false,
      error: 'Failed to fetch data',
    });
  }
});

app.post('/api/admin/data', async (req, res) => {
  const { name, value, category } = req.body;
  
  try {
    const newRecord = await RiskData.create({
      name,
      value,
      category,
    });
    
    res.json({
      success: true,
      data: newRecord,
      message: 'Data created successfully',
    });
  } catch (error) {
    console.error('Error creating data:', error);
    res.status(500).json({
      success: false,
      error: 'Failed to create data',
    });
  }
});

app.put('/api/admin/data/:id', async (req, res) => {
  const { id } = req.params;
  const { name, value, category } = req.body;
  
  try {
    const record = await RiskData.findByPk(id);
    
    if (!record) {
      return res.status(404).json({
        success: false,
        error: 'Record not found',
      });
    }
    
    await record.update({
      name,
      value,
      category,
    });
    
    res.json({
      success: true,
      data: record,
      message: 'Data updated successfully',
    });
  } catch (error) {
    console.error('Error updating data:', error);
    res.status(500).json({
      success: false,
      error: 'Failed to update data',
    });
  }
});

app.delete('/api/admin/data/:id', async (req, res) => {
  const { id } = req.params;
  
  try {
    const record = await RiskData.findByPk(id);
    
    if (!record) {
      return res.status(404).json({
        success: false,
        error: 'Record not found',
      });
    }
    
    await record.destroy();
    
    res.json({
      success: true,
      message: 'Data deleted successfully',
    });
  } catch (error) {
    console.error('Error deleting data:', error);
    res.status(500).json({
      success: false,
      error: 'Failed to delete data',
    });
  }
});

// Master Data Endpoints

// Departments
app.get('/api/departments', async (req, res) => {
  try {
    const departments = await Department.findAll({
      order: [['departmentID', 'ASC']],
    });
    
    res.json({
      success: true,
      data: departments,
    });
  } catch (error) {
    console.error('Error fetching departments:', error);
    res.status(500).json({
      success: false,
      error: 'Failed to fetch departments',
    });
  }
});

// New endpoint: Sync departments from external API (secure - no credentials exposed)
app.post('/api/departments/sync', async (req, res) => {
  try {
    console.log('🔄 Syncing departments from external API...');
    
    // Fetch data from external API (authentication handled in backend)
    const result = await syncDepartmentsFromExternal();
    
    if (!result.success || !result.data) {
      return res.status(500).json({
        success: false,
        message: result.message || 'Failed to fetch departments from external API',
      });
    }

    const departments = Array.isArray(result.data) ? result.data : [];
    
    if (departments.length === 0) {
      return res.json({
        success: true,
        message: 'No departments to sync',
        count: 0,
      });
    }

    // Bulk upsert departments
    let syncCount = 0;
    for (const dept of departments) {
      await Department.upsert({
        departmentID: dept.departmentID || dept.department_id,
        deskripsi: dept.deskripsi,
        induk: dept.induk,
        isDepartment: dept.isDepartment || dept.is_department || 'N',
      });
      syncCount++;
    }

    console.log(`✅ Synced ${syncCount} departments`);
    res.json({
      success: true,
      message: `Successfully synced ${syncCount} departments`,
      count: syncCount,
    });
  } catch (error: any) {
    console.error('Error syncing departments:', error);
    res.status(500).json({
      success: false,
      message: error.message || 'Failed to sync departments',
    });
  }
});

// Positions
app.get('/api/positions', async (req, res) => {
  try {
    // Use raw query to join with departments table
    const [positions] = await sequelize.query(`
      SELECT 
        p.*,
        d.deskripsi as departmentDeskripsi
      FROM positions p
      LEFT JOIN departments d ON p.department = d.department_id
      ORDER BY p.jabatan_id ASC
    `);
    
    res.json({
      success: true,
      data: positions,
    });
  } catch (error) {
    console.error('Error fetching positions:', error);
    res.status(500).json({
      success: false,
      error: 'Failed to fetch positions',
    });
  }
});

app.post('/api/positions/sync', async (req, res) => {
  try {
    console.log('🔄 Syncing positions from external API...');
    
    const result = await syncPositionsFromExternal();
    
    if (!result.success || !result.data) {
      return res.status(500).json({
        success: false,
        message: result.message || 'Failed to fetch positions from external API',
      });
    }

    const positions = Array.isArray(result.data) ? result.data : [];
    
    if (positions.length === 0) {
      return res.json({
        success: true,
        message: 'No positions to sync',
        count: 0,
      });
    }

    // Get all existing department IDs for validation
    const existingDepartments = await Department.findAll({
      attributes: ['departmentID'],
    });
    const validDepartmentIDs = new Set(existingDepartments.map(d => d.departmentID));

    let syncCount = 0;
    let skippedCount = 0;
    for (const pos of positions) {
      const departmentValue = pos.department ? String(pos.department) : null;
      
      // Validate department exists, otherwise set to null
      const validDepartment = departmentValue && validDepartmentIDs.has(departmentValue) 
        ? departmentValue 
        : null;
      
      if (departmentValue && !validDepartment) {
        console.log(`⚠️  Position ${pos.jabatanID || pos.jabatan_id} has invalid department ${departmentValue}, setting to NULL`);
      }
      
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
      syncCount++;
    }

    console.log(`✅ Synced ${syncCount} positions`);
    res.json({
      success: true,
      message: `Successfully synced ${syncCount} positions`,
      count: syncCount,
    });
  } catch (error: any) {
    console.error('Error syncing positions:', error);
    res.status(500).json({
      success: false,
      message: error.message || 'Failed to sync positions',
    });
  }
});

// Employees
app.get('/api/employees', async (req, res) => {
  try {
    // Use raw query to join with departments and positions tables
    const [employees] = await sequelize.query(`
      SELECT 
        e.*,
        d.deskripsi as departmentDeskripsi,
        p.deskripsi as jabatanDeskripsi
      FROM employees e
      LEFT JOIN departments d ON e.department = d.department_id
      LEFT JOIN positions p ON e.jabatan = p.jabatan_id
      ORDER BY e.name ASC
    `);
    
    res.json({
      success: true,
      data: employees,
    });
  } catch (error) {
    console.error('Error fetching employees:', error);
    res.status(500).json({
      success: false,
      error: 'Failed to fetch employees',
    });
  }
});

app.post('/api/employees/sync', async (req, res) => {
  try {
    console.log('🔄 Syncing employees from external API...');
    
    const result = await syncEmployeesFromExternal();
    
    if (!result.success || !result.data) {
      return res.status(500).json({
        success: false,
        message: result.message || 'Failed to fetch employees from external API',
      });
    }

    const employees = Array.isArray(result.data) ? result.data : [];
    
    if (employees.length === 0) {
      return res.json({
        success: true,
        message: 'No employees to sync',
        count: 0,
      });
    }

    // Get all valid department IDs and position IDs for validation
    const existingDepartments = await Department.findAll({
      attributes: ['departmentID'],
    });
    const validDepartmentIDs = new Set(existingDepartments.map(d => d.departmentID));
    
    const existingPositions = await Position.findAll({
      attributes: ['jabatanID'],
    });
    const validPositionIDs = new Set(existingPositions.map(p => p.jabatanID));

    let syncCount = 0;
    for (const emp of employees) {
      // Validate department and position references
      const departmentValue = emp.department ? String(emp.department) : null;
      const jabatanValue = emp.jabatan ? Number(emp.jabatan) : null;
      
      const validDepartment = departmentValue && validDepartmentIDs.has(departmentValue) 
        ? departmentValue 
        : null;
      const validJabatan = jabatanValue && validPositionIDs.has(jabatanValue) 
        ? jabatanValue 
        : null;
      
      if (departmentValue && !validDepartment) {
        console.log(`⚠️  Employee ${emp.id} has invalid department ${departmentValue}, setting to NULL`);
      }
      if (jabatanValue && !validJabatan) {
        console.log(`⚠️  Employee ${emp.id} has invalid jabatan ${jabatanValue}, setting to NULL`);
      }
      
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
      });
      syncCount++;
    }

    console.log(`✅ Synced ${syncCount} employees`);
    res.json({
      success: true,
      message: `Successfully synced ${syncCount} employees`,
      count: syncCount,
    });
  } catch (error: any) {
    console.error('Error syncing employees:', error);
    res.status(500).json({
      success: false,
      message: error.message || 'Failed to sync employees',
    });
  }
});

// Test external API connection
app.post('/api/test-external-api', async (req, res) => {
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
app.post('/api/sync-all', async (req, res) => {
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
app.get('/api/last-sync', async (req, res) => {
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
app.get('/api/sync-logs', async (req, res) => {
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

// Health check
app.get('/api/health', (req, res) => {
  res.json({ 
    status: 'OK', 
    timestamp: new Date(),
    database: sequelize.config.database,
  });
});

// ===== RBAC ENDPOINTS =====

// Login endpoint
app.post('/api/login', async (req, res) => {
  try {
    const { username, password } = req.body;

    if (!username || !password) {
      return res.status(400).json({
        success: false,
        message: 'Username dan password wajib diisi',
      });
    }

    // Call external authentication API
    const AUTH_BASE_URL = process.env.EXTERNAL_API_BASE_URL || '';
    const authUrl = `${AUTH_BASE_URL}/User/SecureAuth`;

    console.log('🔐 Login attempt:', { username, authUrl });

    if (!AUTH_BASE_URL) {
      console.error('❌ EXTERNAL_API_BASE_URL is not set in environment variables');
      return res.status(500).json({
        success: false,
        message: 'Konfigurasi API eksternal belum diatur',
      });
    }

    const authResponse = await axios.post(authUrl, {
      userName: username,
      password: password,
    });
    console.log('🔐 Auth response received',authResponse);
    if (authResponse.data && authResponse.data.token) {
      const token = authResponse.data.token;

      // Find employee by username (can be email, name, or userName)
      const employee = await Employee.findOne({
        where: {
          [Op.or]: [
            { email: username },
            { name: username },
            { userName: username },
          ],
        },
      });

      if (!employee) {
        return res.status(404).json({
          success: false,
          message: 'User tidak ditemukan dalam sistem. Hubungi administrator.',
        });
      }

      // Get user roles and permissions
      const userRoles = await UserRole.findAll({
        where: { employeeId: employee.id },
      });

      // Manually fetch roles to avoid alias issues
      const rolesData = await Promise.all(
        userRoles.map(async (ur: any) => {
          const role = await Role.findByPk(ur.roleId, {
            attributes: ['id', 'roleName', 'permissions'],
          });
          return role;
        })
      );

      // Combine all permissions from all roles
      const allPermissions = new Set<string>();
      const roleNames: string[] = [];
      rolesData.forEach((role: any) => {
        if (role && role.permissions) {
          roleNames.push(role.roleName);
          const permissions = JSON.parse(role.permissions);
          permissions.forEach((perm: string) => allPermissions.add(perm));
        }
      });

      res.json({
        success: true,
        token: token,
        user: {
          id: employee.id,
          name: employee.name,
          email: employee.email,
          department: employee.department,
          jabatan: employee.jabatan,
        },
        roles: roleNames,
        permissions: Array.from(allPermissions),
      });
    } else {
      res.status(401).json({
        success: false,
        message: 'Username atau password salah',
      });
    }
  } catch (error: any) {
    console.error('Login error:', error);
    
    if (error.response?.status === 401) {
      res.status(401).json({
        success: false,
        message: 'Username atau password salah',
      });
    } else {
      res.status(500).json({
        success: false,
        message: error.message || 'Terjadi kesalahan saat login',
      });
    }
  }
});

// Get all roles
app.get('/api/roles', async (req, res) => {
  try {
    const roles = await Role.findAll({
      order: [['roleName', 'ASC']],
    });

    // Parse permissions JSON for each role
    const rolesWithParsedPermissions = roles.map(role => ({
      id: role.id,
      roleName: role.roleName,
      permissions: JSON.parse(role.permissions),
      description: role.description,
      createdAt: role.createdAt,
      updatedAt: role.updatedAt,
    }));

    res.json({
      success: true,
      data: rolesWithParsedPermissions,
    });
  } catch (error: any) {
    console.error('Error fetching roles:', error);
    res.status(500).json({
      success: false,
      message: error.message || 'Failed to fetch roles',
    });
  }
});

// Create a new role
app.post('/api/roles', async (req, res) => {
  try {
    const { roleName, permissions, description } = req.body;

    if (!roleName || !permissions) {
      return res.status(400).json({
        success: false,
        message: 'Role name and permissions are required',
      });
    }

    const role = await Role.create({
      roleName,
      permissions: JSON.stringify(permissions),
      description: description || null,
    });

    res.json({
      success: true,
      data: {
        ...role.toJSON(),
        permissions: JSON.parse(role.permissions),
      },
    });
  } catch (error: any) {
    console.error('Error creating role:', error);
    res.status(500).json({
      success: false,
      message: error.message || 'Failed to create role',
    });
  }
});

// Update a role
app.put('/api/roles/:id', async (req, res) => {
  try {
    const { id } = req.params;
    const { roleName, permissions, description } = req.body;

    const role = await Role.findByPk(id);
    if (!role) {
      return res.status(404).json({
        success: false,
        message: 'Role not found',
      });
    }

    if (roleName) role.roleName = roleName;
    if (permissions) role.permissions = JSON.stringify(permissions);
    if (description !== undefined) role.description = description;

    await role.save();

    res.json({
      success: true,
      data: {
        ...role.toJSON(),
        permissions: JSON.parse(role.permissions),
      },
    });
  } catch (error: any) {
    console.error('Error updating role:', error);
    res.status(500).json({
      success: false,
      message: error.message || 'Failed to update role',
    });
  }
});

// Delete a role
app.delete('/api/roles/:id', async (req, res) => {
  try {
    const { id } = req.params;

    // Check if role has any user assignments
    const userRoleCount = await UserRole.count({ where: { roleId: id } });
    if (userRoleCount > 0) {
      return res.status(400).json({
        success: false,
        message: `Cannot delete role. It is assigned to ${userRoleCount} user(s). Please remove user assignments first.`,
      });
    }

    const role = await Role.findByPk(id);
    if (!role) {
      return res.status(404).json({
        success: false,
        message: 'Role not found',
      });
    }

    await role.destroy();

    res.json({
      success: true,
      message: 'Role deleted successfully',
    });
  } catch (error: any) {
    console.error('Error deleting role:', error);
    res.status(500).json({
      success: false,
      message: error.message || 'Failed to delete role',
    });
  }
});

// Get user-role assignments
app.get('/api/user-roles', async (req, res) => {
  try {
    const { roleId, employeeId } = req.query;
    const where: any = {};

    if (roleId) where.roleId = roleId;
    if (employeeId) where.employeeId = employeeId;

    const userRoles = await UserRole.findAll({
      where,
      order: [['createdAt', 'DESC']],
    });

    // Manually fetch related data
    const userRolesWithDetails = await Promise.all(
      userRoles.map(async (ur) => {
        const urData: any = ur.toJSON();
        
        // Fetch employee
        const employee = await Employee.findByPk(urData.employeeId, {
          attributes: ['id', 'name', 'email', 'jabatan', 'department'],
        });
        
        // Fetch role
        const role = await Role.findByPk(urData.roleId, {
          attributes: ['id', 'roleName', 'permissions', 'description'],
        });

        return {
          ...urData,
          Employee: employee ? employee.toJSON() : null,
          Role: role ? {
            ...role.toJSON(),
            permissions: JSON.parse(role.permissions),
          } : null,
        };
      })
    );

    res.json({
      success: true,
      data: userRolesWithDetails,
    });
  } catch (error: any) {
    console.error('Error fetching user-roles:', error);
    res.status(500).json({
      success: false,
      message: error.message || 'Failed to fetch user-role assignments',
    });
  }
});

// Assign role to user
app.post('/api/user-roles', async (req, res) => {
  try {
    const { employeeId, roleId } = req.body;

    if (!employeeId || !roleId) {
      return res.status(400).json({
        success: false,
        message: 'Employee ID and Role ID are required',
      });
    }

    // Check if employee exists
    const employee = await Employee.findByPk(employeeId);
    if (!employee) {
      return res.status(404).json({
        success: false,
        message: 'Employee not found',
      });
    }

    // Check if role exists
    const role = await Role.findByPk(roleId);
    if (!role) {
      return res.status(404).json({
        success: false,
        message: 'Role not found',
      });
    }

    // Check if assignment already exists
    const existingAssignment = await UserRole.findOne({
      where: { employeeId, roleId },
    });

    if (existingAssignment) {
      return res.status(400).json({
        success: false,
        message: 'This role is already assigned to the user',
      });
    }

    const userRole = await UserRole.create({ employeeId, roleId });

    res.json({
      success: true,
      data: userRole,
    });
  } catch (error: any) {
    console.error('Error assigning role:', error);
    res.status(500).json({
      success: false,
      message: error.message || 'Failed to assign role',
    });
  }
});

// Remove role assignment
app.delete('/api/user-roles/:id', async (req, res) => {
  try {
    const { id } = req.params;

    const userRole = await UserRole.findByPk(id);
    if (!userRole) {
      return res.status(404).json({
        success: false,
        message: 'User-role assignment not found',
      });
    }

    await userRole.destroy();

    res.json({
      success: true,
      message: 'Role assignment removed successfully',
    });
  } catch (error: any) {
    console.error('Error removing role assignment:', error);
    res.status(500).json({
      success: false,
      message: error.message || 'Failed to remove role assignment',
    });
  }
});

// Update user-role assignment
app.put('/api/user-roles/:id', async (req, res) => {
  try {
    const { id } = req.params;
    const { employeeId, roleId } = req.body;

    // Validate required fields
    if (!employeeId || !roleId) {
      return res.status(400).json({
        success: false,
        message: 'Employee ID and Role ID are required',
      });
    }

    // Check if user-role exists
    const userRole = await UserRole.findByPk(id);
    if (!userRole) {
      return res.status(404).json({
        success: false,
        message: 'User-role assignment not found',
      });
    }

    // Validate employee exists
    const employee = await Employee.findByPk(employeeId);
    if (!employee) {
      return res.status(404).json({
        success: false,
        message: 'Employee not found',
      });
    }

    // Validate role exists
    const role = await Role.findByPk(roleId);
    if (!role) {
      return res.status(404).json({
        success: false,
        message: 'Role not found',
      });
    }

    // Check for duplicate assignment (excluding current record)
    const duplicate = await UserRole.findOne({
      where: {
        employeeId,
        roleId,
        id: { [Op.ne]: id }, // Exclude current record
      },
    });

    if (duplicate) {
      return res.status(400).json({
        success: false,
        message: 'This employee already has this role assigned',
      });
    }

    // Update the user-role
    await userRole.update({
      employeeId,
      roleId,
    });

    // Manually fetch updated record with details
    const updatedUserRole: any = userRole.toJSON();
    const employeeData = await Employee.findByPk(employeeId, {
      attributes: ['id', 'name', 'email'],
    });
    const roleData = await Role.findByPk(roleId, {
      attributes: ['id', 'roleName', 'description'],
    });

    res.json({
      success: true,
      message: 'Role assignment updated successfully',
      data: {
        ...updatedUserRole,
        Employee: employeeData ? employeeData.toJSON() : null,
        Role: roleData ? roleData.toJSON() : null,
      },
    });
  } catch (error: any) {
    console.error('Error updating role assignment:', error);
    res.status(500).json({
      success: false,
      message: error.message || 'Failed to update role assignment',
    });
  }
});

// ==========================================
// ACHIEVEMENTS ROUTES
// ==========================================

// Get all achievements
app.get('/api/achievements', async (req, res) => {
  try {
    
    // Test simple query first
    const achievements = await Achievement.findAll({
      include: [
        {
          model: Employee,
          as: 'employee',
          attributes: ['id', 'name', 'email', 'jabatan', 'department'],
          required: false, // LEFT JOIN
        },
      ],
    });
    res.json({
      success: true,
      data: achievements,
    });
  } catch (error: any) {
    console.error('❌ Error fetching achievements:');
    console.error('❌ Error name:', error.name);
    console.error('❌ Error message:', error.message);
    console.error('❌ Error stack:', error.stack);
    console.error('❌ Full error:', JSON.stringify(error, null, 2));
    
    res.status(500).json({
      success: false,
      message: error.message || 'Failed to fetch achievements',
      error: {
        name: error.name,
        message: error.message,
        ...(process.env.NODE_ENV === 'development' && { stack: error.stack })
      }
    });
  }
});

// Get achievement by ID
app.get('/api/achievements/:id', async (req, res) => {
  try {
    const { id } = req.params;
    const achievement = await Achievement.findByPk(id, {
      include: [
        {
          model: Employee,
          as: 'employee',
          attributes: ['id', 'name', 'email', 'jabatan', 'department'],
        },
      ],
    });

    if (!achievement) {
      return res.status(404).json({
        success: false,
        message: 'Achievement not found',
      });
    }

    res.json({
      success: true,
      data: achievement,
    });
  } catch (error: any) {
    console.error('Error fetching achievement:', error);
    res.status(500).json({
      success: false,
      message: error.message || 'Failed to fetch achievement',
    });
  }
});

// Create new achievement
app.post('/api/achievements', async (req, res) => {
  try {
    const {
      topic,
      type,
      validUntil,
      value,
      organizer,
      employeeId,
      dateStart,
      dateEnd,
    } = req.body;

    // Validation
    if (!topic || !type || !value || !organizer || !employeeId || !dateStart || !dateEnd) {
      return res.status(400).json({
        success: false,
        message: 'Missing required fields',
      });
    }

    if (![1, 2].includes(type)) {
      return res.status(400).json({
        success: false,
        message: 'Type must be 1 (Pelatihan) or 2 (Sertifikat)',
      });
    }

    // Check if employee exists
    const employee = await Employee.findByPk(employeeId);
    if (!employee) {
      return res.status(404).json({
        success: false,
        message: 'Employee not found',
      });
    }

    const achievement = await Achievement.create({
      topic,
      type,
      validUntil: validUntil || null,
      value,
      organizer,
      employeeId,
      dateStart,
      dateEnd,
    });

    // Fetch created achievement with employee data
    const createdAchievement = await Achievement.findByPk(achievement.id, {
      include: [
        {
          model: Employee,
          as: 'employee',
          attributes: ['id', 'name', 'email', 'jabatan', 'department'],
        },
      ],
    });

    res.status(201).json({
      success: true,
      message: 'Achievement created successfully',
      data: createdAchievement,
    });
  } catch (error: any) {
    console.error('Error creating achievement:', error);
    res.status(500).json({
      success: false,
      message: error.message || 'Failed to create achievement',
    });
  }
});

// Import achievements from Excel
app.post('/api/achievements/import', async (req, res) => {
  try {
    const { data } = req.body;

    if (!data || !Array.isArray(data) || data.length === 0) {
      return res.status(400).json({
        success: false,
        message: 'No data provided for import',
      });
    }

    const results = {
      success: 0,
      failed: 0,
      errors: [] as string[],
    };

    // Process each row
    for (let i = 0; i < data.length; i++) {
      try {
        const row = data[i];

        // Validate employee exists
        const employee = await Employee.findByPk(row.employeeId);
        if (!employee) {
          results.failed++;
          results.errors.push(`Row ${i + 1}: Employee not found`);
          continue;
        }

        // Create achievement
        await Achievement.create({
          topic: row.topic,
          type: row.type,
          value: row.value,
          organizer: row.organizer,
          employeeId: row.employeeId,
          dateStart: row.dateStart,
          dateEnd: row.dateEnd,
          validUntil: row.validUntil || null,
        });

        results.success++;
      } catch (error: any) {
        results.failed++;
        results.errors.push(`Row ${i + 1}: ${error.message}`);
      }
    }

    res.json({
      success: true,
      message: `Import completed. Success: ${results.success}, Failed: ${results.failed}`,
      data: results,
    });
  } catch (error: any) {
    console.error('Error importing achievements:', error);
    res.status(500).json({
      success: false,
      message: error.message || 'Failed to import achievements',
    });
  }
});

// Update achievement
app.put('/api/achievements/:id', async (req, res) => {
  try {
    const { id } = req.params;
    const {
      topic,
      type,
      validUntil,
      value,
      organizer,
      employeeId,
      dateStart,
      dateEnd,
    } = req.body;

    const achievement = await Achievement.findByPk(id);
    if (!achievement) {
      return res.status(404).json({
        success: false,
        message: 'Achievement not found',
      });
    }

    // Validation
    if (type && ![1, 2].includes(type)) {
      return res.status(400).json({
        success: false,
        message: 'Type must be 1 (Pelatihan) or 2 (Sertifikat)',
      });
    }

    // Check if employee exists if employeeId is being updated
    if (employeeId && employeeId !== achievement.employeeId) {
      const employee = await Employee.findByPk(employeeId);
      if (!employee) {
        return res.status(404).json({
          success: false,
          message: 'Employee not found',
        });
      }
    }

    await achievement.update({
      topic: topic || achievement.topic,
      type: type || achievement.type,
      validUntil: validUntil !== undefined ? validUntil : achievement.validUntil,
      value: value !== undefined ? value : achievement.value,
      organizer: organizer || achievement.organizer,
      employeeId: employeeId || achievement.employeeId,
      dateStart: dateStart || achievement.dateStart,
      dateEnd: dateEnd || achievement.dateEnd,
    });

    // Fetch updated achievement with employee data
    const updatedAchievement = await Achievement.findByPk(id, {
      include: [
        {
          model: Employee,
          as: 'employee',
          attributes: ['id', 'name', 'email', 'jabatan', 'department'],
        },
      ],
    });

    res.json({
      success: true,
      message: 'Achievement updated successfully',
      data: updatedAchievement,
    });
  } catch (error: any) {
    console.error('Error updating achievement:', error);
    res.status(500).json({
      success: false,
      message: error.message || 'Failed to update achievement',
    });
  }
});

// Delete achievement
app.delete('/api/achievements/:id', async (req, res) => {
  try {
    const { id } = req.params;

    const achievement = await Achievement.findByPk(id);
    if (!achievement) {
      return res.status(404).json({
        success: false,
        message: 'Achievement not found',
      });
    }

    await achievement.destroy();

    res.json({
      success: true,
      message: 'Achievement deleted successfully',
    });
  } catch (error: any) {
    console.error('Error deleting achievement:', error);
    res.status(500).json({
      success: false,
      message: error.message || 'Failed to delete achievement',
    });
  }
});

// ============ DASHBOARD ENDPOINTS ============
// Get dashboard statistics for Kapabilitas Risiko
app.get('/api/dashboard/kapabilitas-risiko', async (req, res) => {
  try {
    const { year } = req.query;
    const selectedYear = year ? parseInt(year as string) : new Date().getFullYear();

    // Get achievements for the year (type 1 = Learning Hours, type 2 = Certification)
    const achievements = await Achievement.findAll({
      where: {
        dateStart: {
          [Op.gte]: new Date(`${selectedYear}-01-01`),
          [Op.lte]: new Date(`${selectedYear}-12-31`),
        },
      },
      include: [
        {
          model: Employee,
          as: 'employee',
          attributes: ['id', 'name', 'department'],
          required: true,
        },
      ],
    });

    // Get targets for the year
    const targets = await Target.findAll({
      where: { year: selectedYear },
      include: [
        {
          model: Department,
          as: 'department',
          attributes: ['departmentID', 'deskripsi'],
        },
      ],
    });

    // Calculate statistics
    const learningHours = achievements
      .filter((a) => a.type === 1)
      .reduce((sum, a) => sum + (a.value || 0), 0);

    const certifications = achievements.filter((a) => a.type === 2).length;

    // Group by department
    const deptStats: Record<string, any> = {};
    
    achievements.forEach((ach) => {
      const deptId = ach.employee?.department;
      if (!deptId) return;

      if (!deptStats[deptId]) {
        deptStats[deptId] = {
          departmentId: deptId,
          learningHours: 0,
          certifications: 0,
          employees: new Set(),
        };
      }

      if (ach.type === 1) {
        deptStats[deptId].learningHours += ach.value || 0;
      } else if (ach.type === 2) {
        deptStats[deptId].certifications += 1;
      }
      deptStats[deptId].employees.add(ach.employeeId);
    });

    // Add department names and targets
    const departmentData = Object.values(deptStats).map((dept: any) => {
      const target = targets.find((t) => t.departmentId === dept.departmentId);
      const deptInfo = target?.department;

      return {
        departmentId: dept.departmentId,
        departmentName: deptInfo?.deskripsi || dept.departmentId,
        learningHours: dept.learningHours,
        learningHoursTarget: target?.learningHoursTarget || 0,
        certifications: dept.certifications,
        certificationsTarget: target?.certificationTarget || 0,
        employeeCount: dept.employees.size,
        learningHoursProgress: target?.learningHoursTarget
          ? Math.round((dept.learningHours / target.learningHoursTarget) * 100)
          : 0,
        certificationsProgress: target?.certificationTarget
          ? Math.round((dept.certifications / target.certificationTarget) * 100)
          : 0,
      };
    });

    // Calculate total targets
    const totalLearningHoursTarget = targets.reduce(
      (sum, t) => sum + (t.learningHoursTarget || 0),
      0
    );
    const totalCertificationsTarget = targets.reduce(
      (sum, t) => sum + (t.certificationTarget || 0),
      0
    );

    // Employee-level achievements
    const employeeStats: Record<string, any> = {};
    
    achievements.forEach((ach) => {
      const empId = ach.employeeId;
      if (!empId) return;

      if (!employeeStats[empId]) {
        employeeStats[empId] = {
          employeeId: empId,
          employeeName: ach.employee?.name || empId,
          department: ach.employee?.department || '',
          learningHours: 0,
          certifications: 0,
        };
      }

      if (ach.type === 1) {
        employeeStats[empId].learningHours += ach.value || 0;
      } else if (ach.type === 2) {
        employeeStats[empId].certifications += 1;
      }
    });

    const employeeData = Object.values(employeeStats)
      .sort((a: any, b: any) => b.learningHours - a.learningHours)
      .slice(0, 20); // Top 20 employees

    res.json({
      success: true,
      data: {
        year: selectedYear,
        summary: {
          totalLearningHours: learningHours,
          totalLearningHoursTarget,
          learningHoursProgress: totalLearningHoursTarget
            ? Math.round((learningHours / totalLearningHoursTarget) * 100)
            : 0,
          totalCertifications: certifications,
          totalCertificationsTarget,
          certificationsProgress: totalCertificationsTarget
            ? Math.round((certifications / totalCertificationsTarget) * 100)
            : 0,
          totalEmployees: Object.keys(employeeStats).length,
          totalDepartments: Object.keys(deptStats).length,
        },
        departmentData: departmentData.sort((a, b) =>
          a.departmentName.localeCompare(b.departmentName)
        ),
        employeeData,
      },
    });
  } catch (error: any) {
    console.error('Error fetching dashboard data:', error);
    res.status(500).json({
      success: false,
      message: error.message || 'Failed to fetch dashboard data',
    });
  }
});

// ============ NEW COMPREHENSIVE DASHBOARD API ============
// Dashboard Kapabilitas Risiko V2 - Using Raw SQL from dashboard.md
app.get('/api/dashboard/kapabilitas-risiko-v2', async (req, res) => {
  try {
    const { year, department, type } = req.query;
    const selectedYear = year ? parseInt(year as string) : new Date().getFullYear();
    
    // Build WHERE clause for filtering
    let deptFilter = department && department !== 'all' ? `AND department = '${department}'` : '';
    let typeFilter = type && type !== 'all' ? `AND achievement_type = ${type}` : '';

    // ========== Widget 1: Overview Pencapaian vs Target ==========
    const overviewQuery = `
      SELECT 
        achievement_type,
        CASE 
          WHEN achievement_type = 1 THEN 'Learning Hours'
          WHEN achievement_type = 2 THEN 'Sertifikasi'
        END AS jenis_pencapaian,
        COUNT(*) AS total_pencapaian,
        SUM(CASE WHEN achievement_type = 1 THEN achievement_value ELSE 0 END) AS total_learning_hours,
        SUM(CASE WHEN achievement_type = 2 THEN 1 ELSE 0 END) AS total_sertifikasi,
        AVG(CASE WHEN achievement_type = 1 THEN learning_hours_target ELSE certification_target END) AS target_tahunan,
        ROUND(
          CASE WHEN achievement_type = 1 THEN
            SUM(achievement_value) * 100.0 / NULLIF(AVG(learning_hours_target), 0)
          ELSE
            COUNT(*) * 100.0 / NULLIF(AVG(certification_target), 0)
          END, 2
        ) AS persentase_pencapaian
      FROM v_achievements
      WHERE YEAR(achievement_created_at) = ${selectedYear} ${deptFilter} ${typeFilter}
      GROUP BY achievement_type;
    `;

    // ========== Widget 2: Trend Pencapaian Bulanan ==========
    const trendQuery = `
      SELECT 
        FORMAT(achievement_created_at, 'yyyy-MM') AS bulan_tahun,
        achievement_type,
        COUNT(*) AS jumlah_pencapaian,
        SUM(achievement_value) AS total_nilai,
        AVG(CASE WHEN achievement_type = 1 THEN learning_hours_target ELSE certification_target END) AS target_bulanan
      FROM v_achievements
      WHERE achievement_created_at >= DATEADD(MONTH, -12, GETDATE()) ${deptFilter} ${typeFilter}
      GROUP BY FORMAT(achievement_created_at, 'yyyy-MM'), achievement_type
      ORDER BY bulan_tahun;
    `;

    // ========== Widget 3: Top Performers by Department ==========
    const topPerformersQuery = `
      SELECT TOP 20
        department,
        nama_pegawai,
        email,
        jabatan,
        COUNT(*) AS total_pencapaian,
        SUM(CASE WHEN achievement_type = 1 THEN achievement_value ELSE 0 END) AS total_learning_hours,
        SUM(CASE WHEN achievement_type = 2 THEN 1 ELSE 0 END) AS total_sertifikasi
      FROM v_achievements
      WHERE YEAR(achievement_created_at) = ${selectedYear} ${deptFilter} ${typeFilter}
      GROUP BY department, nama_pegawai, email, jabatan
      ORDER BY total_pencapaian DESC;
    `;

    // ========== Widget 4: Distribusi Jenis Pencapaian ==========
    const distribusiQuery = `
      SELECT 
        department,
        achievement_type,
        CASE 
          WHEN achievement_type = 1 THEN 'Learning Hours'
          WHEN achievement_type = 2 THEN 'Sertifikasi'
        END AS jenis_pencapaian,
        COUNT(*) AS jumlah,
        COUNT(*) * 100.0 / SUM(COUNT(*)) OVER (PARTITION BY department) AS persentase
      FROM v_achievements
      WHERE YEAR(achievement_created_at) = ${selectedYear} ${deptFilter} ${typeFilter}
      GROUP BY department, achievement_type
      ORDER BY department, achievement_type;
    `;

    // ========== Widget 5: Sertifikasi Mendekati Kadaluarsa ==========
    const kadaluarsaQuery = `
      SELECT 
        achievement_topic,
        nama_pegawai,
        department,
        jabatan,
        email,
        achievement_valid_until,
        DATEDIFF(DAY, GETDATE(), achievement_valid_until) AS hari_menuju_kadaluarsa
      FROM v_achievements
      WHERE achievement_type = 2
        AND achievement_valid_until BETWEEN GETDATE() AND DATEADD(MONTH, 3, GETDATE())
        ${deptFilter}
      ORDER BY achievement_valid_until ASC;
    `;

    // ========== Widget 6: Efektivitas Program Learning ==========
    const programQuery = `
      SELECT TOP 20
        achievement_topic,
        achievement_organizer,
        COUNT(DISTINCT achievement_employee) AS jumlah_peserta,
        AVG(achievement_value) AS rata_rata_jam_learning,
        MIN(achievement_value) AS jam_terendah,
        MAX(achievement_value) AS jam_tertinggi,
        DATEDIFF(DAY, achievement_date_start, achievement_date_end) AS durasi_hari
      FROM v_achievements
      WHERE achievement_type = 1 AND YEAR(achievement_created_at) = ${selectedYear} ${deptFilter}
      GROUP BY achievement_topic, achievement_organizer, 
               DATEDIFF(DAY, achievement_date_start, achievement_date_end)
      ORDER BY rata_rata_jam_learning DESC;
    `;

    // ========== Widget 7: Seasonal Pattern Analysis ==========
    const seasonalQuery = `
      SELECT 
        DATEPART(MONTH, achievement_created_at) AS bulan,
        DATENAME(MONTH, achievement_created_at) AS nama_bulan,
        achievement_type,
        COUNT(*) AS jumlah_pencapaian,
        AVG(COUNT(*)) OVER (PARTITION BY achievement_type) AS rata_rata_bulanan
      FROM v_achievements
      WHERE YEAR(achievement_created_at) = ${selectedYear} ${deptFilter} ${typeFilter}
      GROUP BY DATEPART(MONTH, achievement_created_at), 
               DATENAME(MONTH, achievement_created_at), 
               achievement_type
      ORDER BY bulan, achievement_type;
    `;

    // ========== Widget 8: Department Performance Dashboard ==========
    const deptPerformanceQuery = `
      SELECT 
        department,
        COUNT(*) AS total_pencapaian,
        SUM(CASE WHEN achievement_type = 1 THEN achievement_value ELSE 0 END) AS total_learning_hours,
        SUM(CASE WHEN achievement_type = 2 THEN 1 ELSE 0 END) AS total_sertifikasi,
        COUNT(DISTINCT achievement_employee) AS jumlah_pegawai_aktif,
        ROUND(
          SUM(CASE WHEN achievement_type = 1 THEN achievement_value ELSE 0 END) * 100.0 / 
          NULLIF(AVG(learning_hours_target), 0), 2
        ) AS persentase_target_learning,
        ROUND(
          SUM(CASE WHEN achievement_type = 2 THEN 1 ELSE 0 END) * 100.0 / 
          NULLIF(AVG(certification_target), 0), 2
        ) AS persentase_target_sertifikasi
      FROM v_achievements
      WHERE YEAR(achievement_created_at) = ${selectedYear} ${typeFilter}
      GROUP BY department
      ORDER BY total_pencapaian DESC;
    `;

    // ========== Widget 9: Achievement Velocity ==========
    const velocityQuery = `
      SELECT TOP 20
        nama_pegawai,
        department,
        COUNT(*) AS total_pencapaian,
        DATEDIFF(DAY, MIN(achievement_created_at), MAX(achievement_created_at)) AS rentang_hari_aktif,
        ROUND(
          COUNT(*) * 1.0 / NULLIF(DATEDIFF(DAY, MIN(achievement_created_at), MAX(achievement_created_at)), 0), 
          2
        ) AS pencapaian_per_hari,
        ROUND(
          SUM(CASE WHEN achievement_type = 1 THEN achievement_value ELSE 0 END) * 1.0 / 
          NULLIF(DATEDIFF(MONTH, MIN(achievement_created_at), MAX(achievement_created_at)), 0), 
          2
        ) AS learning_hours_per_bulan
      FROM v_achievements
      WHERE YEAR(achievement_created_at) = ${selectedYear} ${deptFilter}
      GROUP BY nama_pegawai, department
      HAVING COUNT(*) >= 3
      ORDER BY pencapaian_per_hari DESC;
    `;

    // ========== Widget 10: Organizer Effectiveness ==========
    const organizerQuery = `
      SELECT TOP 15
        achievement_organizer,
        COUNT(*) AS total_program,
        COUNT(DISTINCT achievement_topic) AS variasi_topik,
        COUNT(DISTINCT achievement_employee) AS total_peserta_unik,
        AVG(achievement_value) AS rata_rata_nilai,
        AVG(DATEDIFF(DAY, achievement_date_start, achievement_date_end)) AS rata_rata_durasi_hari
      FROM v_achievements
      WHERE achievement_organizer IS NOT NULL AND YEAR(achievement_created_at) = ${selectedYear} ${deptFilter}
      GROUP BY achievement_organizer
      HAVING COUNT(*) >= 2
      ORDER BY total_peserta_unik DESC;
    `;

    // Execute all queries
    const [
      overviewResult,
      trendResult,
      topPerformersResult,
      distribusiResult,
      kadaluarsaResult,
      programResult,
      seasonalResult,
      deptPerformanceResult,
      velocityResult,
      organizerResult
    ] = await Promise.all([
      sequelize.query(overviewQuery, { type: QueryTypes.SELECT }),
      sequelize.query(trendQuery, { type: QueryTypes.SELECT }),
      sequelize.query(topPerformersQuery, { type: QueryTypes.SELECT }),
      sequelize.query(distribusiQuery, { type: QueryTypes.SELECT }),
      sequelize.query(kadaluarsaQuery, { type: QueryTypes.SELECT }),
      sequelize.query(programQuery, { type: QueryTypes.SELECT }),
      sequelize.query(seasonalQuery, { type: QueryTypes.SELECT }),
      sequelize.query(deptPerformanceQuery, { type: QueryTypes.SELECT }),
      sequelize.query(velocityQuery, { type: QueryTypes.SELECT }),
      sequelize.query(organizerQuery, { type: QueryTypes.SELECT })
    ]);

    // Process Widget 1: Overview
    const lhOverview: any = overviewResult.find((r: any) => r.achievement_type === 1) || {};
    const certOverview: any = overviewResult.find((r: any) => r.achievement_type === 2) || {};

    const overview = {
      learningHours: {
        total: Math.round(lhOverview.total_learning_hours || 0),
        target: Math.round(lhOverview.target_tahunan || 0),
        percentage: Math.round(lhOverview.persentase_pencapaian || 0),
      },
      certifications: {
        total: certOverview.total_sertifikasi || 0,
        target: Math.round(certOverview.target_tahunan || 0),
        percentage: Math.round(certOverview.persentase_pencapaian || 0),
      },
    };

    // Process Widget 2: Trend Bulanan
    const trendByMonth: Record<string, any> = {};
    trendResult.forEach((row: any) => {
      if (!trendByMonth[row.bulan_tahun]) {
        trendByMonth[row.bulan_tahun] = {
          bulan: row.bulan_tahun,
          learningHoursAktual: 0,
          learningHoursTarget: 0,
          sertifikasiAktual: 0,
          sertifikasiTarget: 0,
        };
      }
      
      if (row.achievement_type === 1) {
        trendByMonth[row.bulan_tahun].learningHoursAktual = Math.round(row.total_nilai || 0);
        trendByMonth[row.bulan_tahun].learningHoursTarget = Math.round(row.target_bulanan || 0);
      } else if (row.achievement_type === 2) {
        trendByMonth[row.bulan_tahun].sertifikasiAktual = row.jumlah_pencapaian || 0;
        trendByMonth[row.bulan_tahun].sertifikasiTarget = Math.round(row.target_bulanan || 0);
      }
    });

    const trendBulanan = Object.values(trendByMonth);

    // Process Widget 3: Top Performers
    const topPerformers = topPerformersResult.map((row: any) => ({
      nama: row.nama_pegawai,
      department: row.department,
      jabatan: row.jabatan || 'N/A',
      totalLH: row.total_learning_hours || 0,
      totalCert: row.total_sertifikasi || 0,
      totalPencapaian: row.total_pencapaian || 0,
    }));

    // Process Widget 4: Distribusi Jenis
    const distribusiByDept: Record<string, any> = {};
    distribusiResult.forEach((row: any) => {
      if (!distribusiByDept[row.department]) {
        distribusiByDept[row.department] = {
          department: row.department,
          learningHours: 0,
          sertifikasi: 0,
        };
      }
      
      if (row.achievement_type === 1) {
        distribusiByDept[row.department].learningHours = row.jumlah || 0;
      } else if (row.achievement_type === 2) {
        distribusiByDept[row.department].sertifikasi = row.jumlah || 0;
      }
    });

    const distribusiJenis = Object.values(distribusiByDept);

    // Process Widget 5: Sertifikasi Kadaluarsa
    const sertifikasiKadaluarsa = kadaluarsaResult.map((row: any) => ({
      topic: row.achievement_topic || 'N/A',
      nama: row.nama_pegawai || 'N/A',
      department: row.department || 'N/A',
      jabatan: row.jabatan || 'N/A',
      validUntil: row.achievement_valid_until,
      hariMenjelang: row.hari_menuju_kadaluarsa || 0,
    }));

    // Process Widget 6: Efektivitas Program
    const efektivitasProgram = programResult.map((row: any) => ({
      topic: row.achievement_topic || 'Unknown',
      organizer: row.achievement_organizer || 'Unknown',
      peserta: row.jumlah_peserta || 0,
      rataJam: parseFloat((row.rata_rata_jam_learning || 0).toFixed(1)),
      durasi: row.durasi_hari > 0 ? row.durasi_hari : 1,
    }));

    // Process Widget 7: Seasonal Pattern
    const monthNames = ['', 'Jan', 'Feb', 'Mar', 'Apr', 'Mei', 'Jun', 'Jul', 'Agu', 'Sep', 'Okt', 'Nov', 'Des'];
    const seasonalByMonth: Record<number, any> = {};
    
    seasonalResult.forEach((row: any) => {
      const month = row.bulan;
      if (!seasonalByMonth[month]) {
        seasonalByMonth[month] = { lh: 0, cert: 0 };
      }
      
      if (row.achievement_type === 1) {
        seasonalByMonth[month].lh = row.jumlah_pencapaian || 0;
      } else if (row.achievement_type === 2) {
        seasonalByMonth[month].cert = row.jumlah_pencapaian || 0;
      }
    });

    const polaMusimanLH = monthNames.slice(1).map((name, idx) => ({
      bulan: name,
      jumlah: seasonalByMonth[idx + 1]?.lh || 0,
    }));

    const polaMusimanCert = monthNames.slice(1).map((name, idx) => ({
      bulan: name,
      jumlah: seasonalByMonth[idx + 1]?.cert || 0,
    }));

    // Process Widget 8: Department Performance
    const departmentPerformance = deptPerformanceResult.map((row: any) => ({
      department: row.department,
      totalLH: Math.round(row.total_learning_hours || 0),
      totalCert: row.total_sertifikasi || 0,
      pegawaiAktif: row.jumlah_pegawai_aktif || 0,
      persenLH: Math.min(100, Math.round(row.persentase_target_learning || 0)),
      persenCert: Math.min(100, Math.round(row.persentase_target_sertifikasi || 0)),
    }));

    // Process Widget 9: Achievement Velocity
    const achievementVelocity = velocityResult.map((row: any) => ({
      nama: row.nama_pegawai,
      department: row.department,
      totalPencapaian: row.total_pencapaian || 0,
      pencapaianPerHari: parseFloat((row.pencapaian_per_hari || 0).toFixed(2)),
      lhPerBulan: parseFloat((row.learning_hours_per_bulan || 0).toFixed(2)),
    }));

    // Process Widget 10: Organizer Effectiveness
    const organizerEffectiveness = organizerResult.map((row: any) => ({
      organizer: row.achievement_organizer || 'Unknown',
      totalProgram: row.total_program || 0,
      variasiTopik: row.variasi_topik || 0,
      pesertaUnik: row.total_peserta_unik || 0,
      rataNilai: parseFloat((row.rata_rata_nilai || 0).toFixed(1)),
    }));

    // Send comprehensive response
    res.json({
      success: true,
      data: {
        overview,
        trendBulanan,
        topPerformers,
        distribusiJenis,
        sertifikasiKadaluarsa,
        efektivitasProgram,
        polaMusimanLH,
        polaMusimanCert,
        departmentPerformance,
        achievementVelocity,
        organizerEffectiveness,
      },
    });

  } catch (error: any) {
    console.error('Error fetching comprehensive dashboard data:', error);
    res.json({
      success: false,
      message: error.message || 'Failed to fetch dashboard data',
    });
  }
});

// ============ TARGETS ENDPOINTS ============
// Get all targets
app.get('/api/targets', async (req, res) => {
  try {
    const targets = await Target.findAll({
      include: [
        {
          model: Department,
          as: 'department',
          attributes: ['departmentID', 'deskripsi', 'induk', 'isDepartment'],
        },
      ],
      order: [['year', 'DESC'], ['departmentId', 'ASC']],
    });

    res.json({
      success: true,
      data: targets,
    });
  } catch (error: any) {
    console.error('Error fetching targets:', error);
    res.status(500).json({
      success: false,
      message: error.message || 'Failed to fetch targets',
    });
  }
});

// Get target by ID
app.get('/api/targets/:id', async (req, res) => {
  try {
    const target = await Target.findByPk(req.params.id, {
      include: [
        {
          model: Department,
          as: 'department',
          attributes: ['departmentID', 'deskripsi', 'induk', 'isDepartment'],
        },
      ],
    });

    if (!target) {
      return res.status(404).json({
        success: false,
        message: 'Target not found',
      });
    }

    res.json({
      success: true,
      data: target,
    });
  } catch (error: any) {
    console.error('Error fetching target:', error);
    res.status(500).json({
      success: false,
      message: error.message || 'Failed to fetch target',
    });
  }
});

// Create new target
app.post('/api/targets', async (req, res) => {
  try {
    const { departmentId, year, certificationTarget, learningHoursTarget } = req.body;

    // Check if target already exists for this department and year
    const existingTarget = await Target.findOne({
      where: {
        departmentId,
        year,
      },
    });

    if (existingTarget) {
      return res.status(400).json({
        success: false,
        message: 'Target untuk departemen dan tahun ini sudah ada',
      });
    }

    const target = await Target.create({
      departmentId,
      year,
      certificationTarget,
      learningHoursTarget,
    });

    const createdTarget = await Target.findByPk(target.id, {
      include: [
        {
          model: Department,
          as: 'department',
          attributes: ['departmentID', 'deskripsi', 'induk', 'isDepartment'],
        },
      ],
    });

    res.status(201).json({
      success: true,
      data: createdTarget,
      message: 'Target berhasil ditambahkan',
    });
  } catch (error: any) {
    console.error('Error creating target:', error);
    res.status(500).json({
      success: false,
      message: error.message || 'Failed to create target',
    });
  }
});

// Update target
app.put('/api/targets/:id', async (req, res) => {
  try {
    const { departmentId, year, certificationTarget, learningHoursTarget } = req.body;
    const target = await Target.findByPk(req.params.id);

    if (!target) {
      return res.status(404).json({
        success: false,
        message: 'Target not found',
      });
    }

    // Check if changing to department/year combination that already exists
    if (departmentId !== target.departmentId || year !== target.year) {
      const existingTarget = await Target.findOne({
        where: {
          departmentId,
          year,
          id: { [Op.ne]: req.params.id },
        },
      });

      if (existingTarget) {
        return res.status(400).json({
          success: false,
          message: 'Target untuk departemen dan tahun ini sudah ada',
        });
      }
    }

    await target.update({
      departmentId,
      year,
      certificationTarget,
      learningHoursTarget,
    });

    const updatedTarget = await Target.findByPk(target.id, {
      include: [
        {
          model: Department,
          as: 'department',
          attributes: ['departmentID', 'deskripsi', 'induk', 'isDepartment'],
        },
      ],
    });

    res.json({
      success: true,
      data: updatedTarget,
      message: 'Target berhasil diupdate',
    });
  } catch (error: any) {
    console.error('Error updating target:', error);
    res.status(500).json({
      success: false,
      message: error.message || 'Failed to update target',
    });
  }
});

// Delete target
app.delete('/api/targets/:id', async (req, res) => {
  try {
    const target = await Target.findByPk(req.params.id);

    if (!target) {
      return res.status(404).json({
        success: false,
        message: 'Target not found',
      });
    }

    await target.destroy();

    res.json({
      success: true,
      message: 'Target berhasil dihapus',
    });
  } catch (error: any) {
    console.error('Error deleting target:', error);
    res.status(500).json({
      success: false,
      message: error.message || 'Failed to delete target',
    });
  }
});

// Start server
initializeDatabase().then(() => {
  app.listen(PORT, () => {
    console.log(`🚀 Server running on http://localhost:${PORT}`);
    console.log(`📊 API available at http://localhost:${PORT}/api`);
  });
});

export default app;
