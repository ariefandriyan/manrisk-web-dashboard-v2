import { Router, Request, Response } from 'express';
import { Achievement, Employee } from '../models';

const router = Router();

/**
 * GET /api/achievements
 * Get all achievements with filtering and employee data
 */
router.get('/', async (req: Request, res: Response) => {
  try {
    // Get all achievements with employee data
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

/**
 * GET /api/achievements/:id
 * Get single achievement by ID
 */
router.get('/:id', async (req: Request, res: Response) => {
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

/**
 * POST /api/achievements
 * Create new achievement
 */
router.post('/', async (req: Request, res: Response) => {
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

/**
 * POST /api/achievements/import
 * Import bulk achievements from Excel
 */
router.post('/import', async (req: Request, res: Response) => {
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

/**
 * PUT /api/achievements/:id
 * Update achievement by ID
 */
router.put('/:id', async (req: Request, res: Response) => {
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

/**
 * DELETE /api/achievements/:id
 * Delete achievement by ID
 */
router.delete('/:id', async (req: Request, res: Response) => {
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

export default router;
