import sequelize from '../config/database';
import { RiskData } from './RiskData';
import { Department } from './Department';
import { Position } from './Position';
import { Employee } from './Employee';
import { Achievement } from './Achievement';
import { SyncLog } from './SyncLog';
import { Role } from './Role';
import { UserRole } from './UserRole';

// Define associations
// Many-to-many: Employee <-> Role through UserRole
Employee.belongsToMany(Role, { 
  through: UserRole, 
  foreignKey: 'employeeId',
  as: 'roles'
});
Role.belongsToMany(Employee, { 
  through: UserRole, 
  foreignKey: 'roleId',
  as: 'employees'
});

// One-to-many: UserRole belongs to Employee and Role
UserRole.belongsTo(Employee, { foreignKey: 'employeeId', as: 'Employee' });
UserRole.belongsTo(Role, { foreignKey: 'roleId', as: 'Role' });
Employee.hasMany(UserRole, { foreignKey: 'employeeId' });
Role.hasMany(UserRole, { foreignKey: 'roleId' });

// One-to-many: Employee has many Achievements
Employee.hasMany(Achievement, { 
  foreignKey: 'employeeId', 
  sourceKey: 'id', // Refers to Employee.id (which maps to employee_id)
  as: 'achievements' 
});
Achievement.belongsTo(Employee, { 
  foreignKey: 'employeeId',
  targetKey: 'id', // Refers to Employee.id (which maps to employee_id)
  as: 'employee' 
});

// Export all models
export { RiskData, Department, Position, Employee, Achievement, SyncLog, Role, UserRole };

// Export sequelize instance
export { sequelize };

// Initialize all models
export const initModels = async () => {
  try {
    await sequelize.authenticate();
    console.log('✅ Database connection established successfully');
    
    // Sync models (in development only)
    if (process.env.NODE_ENV === 'development') {
      // Use { alter: true } to update tables without dropping them
      // Use { force: true } to drop and recreate tables (DANGER: data loss!)
      await sequelize.sync({ alter: false });
      console.log('✅ Models synchronized with database');
    }
    
    return true;
  } catch (error) {
    console.error('❌ Unable to connect to the database:', error);
    throw error;
  }
};

export default {
  sequelize,
  RiskData,
  initModels,
};
