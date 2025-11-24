import { Model, DataTypes } from 'sequelize';
import sequelize from '../config/database';
import { Employee } from './Employee';

export class Achievement extends Model {
  declare id: string;
  declare topic: string;
  declare type: number; // 1=Pelatihan (LH), 2=Sertifikat (CERT)
  declare validUntil: Date | null;
  declare value: number;
  declare organizer: string;
  declare employeeId: string;
  declare dateStart: Date;
  declare dateEnd: Date;
  declare inputByName: string | null;
  declare inputById: string | null;
  declare createdAt: Date;
  
  // Association
  declare employee?: Employee;
}

Achievement.init(
  {
    id: {
      type: DataTypes.BIGINT,
      primaryKey: true,
      autoIncrement: true,
      field: 'achievement_id',
    },
    topic: {
      type: DataTypes.STRING,
      allowNull: true,
      field: 'achievement_topic',
    },
    type: {
      type: DataTypes.SMALLINT,
      allowNull: true,
      field: 'achievement_type',
      validate: {
        isIn: [[1, 2]], // 1=Pelatihan (LH), 2=Sertifikat (CERT)
      },
    },
    validUntil: {
      type: DataTypes.DATEONLY,
      allowNull: true,
      field: 'achievement_valid_until',
    },
    value: {
      type: DataTypes.INTEGER,
      allowNull: true,
      field: 'achievement_value',
    },
    organizer: {
      type: DataTypes.STRING,
      allowNull: true,
      field: 'achievement_organizer',
    },
    employeeId: {
      type: DataTypes.CHAR(36),
      allowNull: true,
      field: 'achievement_employee',
      references: {
        model: 'employees',
        key: 'id', // Actual column name in employees table
      },
    },
    dateStart: {
      type: DataTypes.DATEONLY,
      allowNull: true,
      field: 'achievement_date_start',
    },
    dateEnd: {
      type: DataTypes.DATEONLY,
      allowNull: true,
      field: 'achievement_date_end',
    },
    inputByName: {
      type: DataTypes.STRING,
      allowNull: true,
      field: 'achievement_input_by_name',
    },
    inputById: {
      type: DataTypes.CHAR(36),
      allowNull: true,
      field: 'achievement_input_by_id',
    },
  },
  {
    sequelize,
    tableName: 'achievements',
    timestamps: true,
    createdAt: 'achievement_created_at',
    updatedAt: false, // No updated_at column in this table
  }
);

export default Achievement;
