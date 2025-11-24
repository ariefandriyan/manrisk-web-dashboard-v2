import { Router } from 'express';
import { Department } from '../models';
import { syncDepartmentsFromExternal } from '../services/externalApiService';

const router = Router();

// Get all departments
router.get('/', async (req, res) => {
  try {
    const departments = await Department.findAll({
      order: [['deskripsi', 'ASC']],
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

// Sync departments from external API
router.post('/sync', async (req, res) => {
  try {
    console.log('🔄 Syncing departments from external API...');
    
    const result = await syncDepartmentsFromExternal();
    
    if (!result.success) {
      return res.status(500).json({
        success: false,
        message: result.message || 'Failed to sync departments',
      });
    }

    const departments = result.data || [];
    
    if (departments.length === 0) {
      return res.json({
        success: true,
        message: 'No departments to sync',
        count: 0,
      });
    }

    let syncCount = 0;
    for (const dept of departments) {
      await Department.upsert({
        departmentID: dept.department_id || dept.departmentID,
        deskripsi: dept.deskripsi,
        induk: dept.induk,
        isDepartment: dept.is_department !== undefined ? dept.is_department : dept.isDepartment,
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

export default router;
