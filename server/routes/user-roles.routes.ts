import { Router, Request, Response } from 'express';
import { UserRole, Employee, Role } from '../models';
import { Op } from 'sequelize';

const router = Router();

// Get user-role assignments
router.get('/', async (req: Request, res: Response) => {
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
router.post('/', async (req: Request, res: Response) => {
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

// Update user-role assignment
router.put('/:id', async (req: Request, res: Response) => {
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

// Remove role assignment
router.delete('/:id', async (req: Request, res: Response) => {
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

export default router;
