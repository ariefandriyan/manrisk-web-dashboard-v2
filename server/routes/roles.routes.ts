import { Router, Request, Response } from 'express';
import { Role, UserRole } from '../models';

const router = Router();

// Get all roles
router.get('/', async (req: Request, res: Response) => {
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
router.post('/', async (req: Request, res: Response) => {
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
router.put('/:id', async (req: Request, res: Response) => {
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
router.delete('/:id', async (req: Request, res: Response) => {
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

export default router;
