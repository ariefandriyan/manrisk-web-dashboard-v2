import { Model, DataTypes } from 'sequelize';
import sequelize from '../config/database';

export class SyncLog extends Model {
  declare id: number;
  declare syncType: 'all' | 'departments' | 'positions' | 'employees';
  declare status: 'success' | 'failed' | 'partial';
  declare syncedBy: string;
  declare sourceIp: string | null;
  declare departmentsCount: number | null;
  declare positionsCount: number | null;
  declare employeesCount: number | null;
  declare errorMessage: string | null;
  declare syncedAt: Date;
}

SyncLog.init(
  {
    id: {
      type: DataTypes.INTEGER,
      primaryKey: true,
      autoIncrement: true,
      field: 'id',
    },
    syncType: {
      type: DataTypes.STRING(20),
      allowNull: false,
      field: 'sync_type',
    },
    status: {
      type: DataTypes.STRING(20),
      allowNull: false,
      field: 'status',
    },
    syncedBy: {
      type: DataTypes.STRING(255),
      allowNull: false,
      field: 'synced_by',
    },
    sourceIp: {
      type: DataTypes.STRING(45),
      allowNull: true,
      field: 'source_ip',
    },
    departmentsCount: {
      type: DataTypes.INTEGER,
      allowNull: true,
      field: 'departments_count',
    },
    positionsCount: {
      type: DataTypes.INTEGER,
      allowNull: true,
      field: 'positions_count',
    },
    employeesCount: {
      type: DataTypes.INTEGER,
      allowNull: true,
      field: 'employees_count',
    },
    errorMessage: {
      type: DataTypes.TEXT,
      allowNull: true,
      field: 'error_message',
    },
    syncedAt: {
      type: DataTypes.DATE,
      allowNull: false,
      defaultValue: DataTypes.NOW,
      field: 'synced_at',
    },
  },
  {
    sequelize,
    tableName: 'sync_logs',
    timestamps: false,
  }
);

export default SyncLog;
