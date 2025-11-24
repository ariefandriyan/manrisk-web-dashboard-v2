import express, { Request, Response } from 'express';
import { Op } from 'sequelize';
import { Department } from '../models';
import Target from '../models/Target';

const router = express.Router();

// Get all targets
router.get('/', async (req: Request, res: Response) => {
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
router.get('/:id', async (req: Request, res: Response) => {
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
router.post('/', async (req: Request, res: Response) => {
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
router.put('/:id', async (req: Request, res: Response) => {
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
router.delete('/:id', async (req: Request, res: Response) => {
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

export default router;
