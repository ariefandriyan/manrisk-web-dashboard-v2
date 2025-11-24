import { Model, DataTypes } from 'sequelize';
import sequelize from '../config/database';

export class UserRole extends Model {
  declare id: number;
  declare employeeId: string;
  declare roleId: number;
  declare createdAt: Date;
  declare updatedAt: Date;
}

UserRole.init(
  {
    id: {
      type: DataTypes.INTEGER,
      primaryKey: true,
      autoIncrement: true,
      field: 'id',
    },
    employeeId: {
      type: DataTypes.UUID,
      allowNull: false,
      field: 'employee_id',
      references: {
        model: 'employees',
        key: 'id',
      },
    },
    roleId: {
      type: DataTypes.INTEGER,
      allowNull: false,
      field: 'role_id',
      references: {
        model: 'roles',
        key: 'id',
      },
    },
    createdAt: {
      type: DataTypes.DATE,
      allowNull: false,
      defaultValue: DataTypes.NOW,
      field: 'created_at',
    },
    updatedAt: {
      type: DataTypes.DATE,
      allowNull: false,
      defaultValue: DataTypes.NOW,
      field: 'updated_at',
    },
  },
  {
    sequelize,
    tableName: 'user_roles',
    timestamps: true,
  }
);

export default UserRole;
