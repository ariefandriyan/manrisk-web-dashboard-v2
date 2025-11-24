import { Router } from 'express';
import { Employee, Department, Position, sequelize } from '../models';
import { syncEmployeesFromExternal } from '../services/externalApiService';

const router = Router();

// Get all employees
router.get('/', async (req, res) => {
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

// Sync employees from external API
router.post('/sync', async (req, res) => {
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

export default router;
