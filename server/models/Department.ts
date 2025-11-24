import { Model, DataTypes } from 'sequelize';
import sequelize from '../config/database';

export class Department extends Model {
  declare departmentID: string;
  declare deskripsi: string;
  declare induk: string | null;
  declare isDepartment: string;
}

Department.init(
  {
    departmentID: {
      type: DataTypes.STRING(10),
      primaryKey: true,
      field: 'department_id',
    },
    deskripsi: {
      type: DataTypes.STRING(255),
      allowNull: false,
      field: 'deskripsi',
    },
    induk: {
      type: DataTypes.STRING(10),
      allowNull: true,
      field: 'induk',
    },
    isDepartment: {
      type: DataTypes.STRING(1),
      allowNull: false,
      defaultValue: 'N',
      field: 'is_department',
    },
  },
  {
    sequelize,
    tableName: 'departments',
    timestamps: false,
  }
);

export default Department;
