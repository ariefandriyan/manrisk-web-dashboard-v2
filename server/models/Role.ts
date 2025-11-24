import { Model, DataTypes } from 'sequelize';
import sequelize from '../config/database';

export class Role extends Model {
  declare id: number;
  declare roleName: string;
  declare permissions: string;
  declare description: string | null;
  declare createdAt: Date;
  declare updatedAt: Date;
}

Role.init(
  {
    id: {
      type: DataTypes.INTEGER,
      primaryKey: true,
      autoIncrement: true,
      field: 'id',
    },
    roleName: {
      type: DataTypes.STRING(100),
      allowNull: false,
      unique: true,
      field: 'role_name',
    },
    permissions: {
      type: DataTypes.TEXT,
      allowNull: false,
      field: 'permissions',
      comment: 'JSON array of permission strings',
    },
    description: {
      type: DataTypes.STRING(500),
      allowNull: true,
      field: 'description',
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
    tableName: 'roles',
    timestamps: true,
  }
);

export default Role;
