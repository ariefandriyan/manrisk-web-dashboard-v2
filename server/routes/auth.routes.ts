import { Router } from 'express';
import axios from 'axios';
import { Employee, Role, UserRole } from '../models';
import { Op } from 'sequelize';

const router = Router();

// Login endpoint
router.post('/login', async (req, res) => {
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
    
    console.log('🔐 Auth response received', authResponse);
    
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

export default router;
