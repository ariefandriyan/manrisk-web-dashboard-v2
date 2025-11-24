import { Model, DataTypes } from 'sequelize';
import sequelize from '../config/database';

export class Employee extends Model {
  declare id: string;
  declare email: string | null;
  declare userName: string | null;
  declare name: string;
  declare department: string | null;
  declare passwordHash: string | null;
  declare gcg: boolean;
  declare gcgAdmin: boolean;
  declare codeOfConduct: boolean;
  declare conflictOfInterest: boolean;
  declare codeOfConductDt: Date | null;
  declare conflictOfInterestDt: Date | null;
  declare nip: string | null;
  declare jabatan: number | null;
  declare isTkjp: boolean;
  declare normalizedUserName: string | null;
  declare normalizedEmail: string | null;
  declare emailConfirmed: boolean;
  declare securityStamp: string | null;
  declare concurrencyStamp: string | null;
  declare phoneNumber: string | null;
  declare phoneNumberConfirmed: boolean;
  declare twoFactorEnabled: boolean;
  declare lockoutEnd: Date | null;
  declare lockoutEnabled: boolean;
  declare accessFailedCount: number;
  declare isSuperAdmin: boolean;
}

Employee.init(
  {
    id: {
      type: DataTypes.UUID,
      primaryKey: true,
      field: 'id',
    },
    email: {
      type: DataTypes.STRING(255),
      allowNull: true,
      field: 'email',
    },
    userName: {
      type: DataTypes.STRING(255),
      allowNull: true,
      field: 'user_name',
    },
    name: {
      type: DataTypes.STRING(255),
      allowNull: false,
      field: 'name',
    },
    department: {
      type: DataTypes.STRING(10),
      allowNull: true,
      field: 'department',
    },
    passwordHash: {
      type: DataTypes.TEXT,
      allowNull: true,
      field: 'password_hash',
    },
    gcg: {
      type: DataTypes.BOOLEAN,
      allowNull: false,
      defaultValue: false,
      field: 'gcg',
    },
    gcgAdmin: {
      type: DataTypes.BOOLEAN,
      allowNull: false,
      defaultValue: false,
      field: 'gcg_admin',
    },
    codeOfConduct: {
      type: DataTypes.BOOLEAN,
      allowNull: false,
      defaultValue: false,
      field: 'code_of_conduct',
    },
    conflictOfInterest: {
      type: DataTypes.BOOLEAN,
      allowNull: false,
      defaultValue: false,
      field: 'conflict_of_interest',
    },
    codeOfConductDt: {
      type: DataTypes.DATE,
      allowNull: true,
      field: 'code_of_conduct_dt',
    },
    conflictOfInterestDt: {
      type: DataTypes.DATE,
      allowNull: true,
      field: 'conflict_of_interest_dt',
    },
    nip: {
      type: DataTypes.STRING(50),
      allowNull: true,
      field: 'nip',
    },
    jabatan: {
      type: DataTypes.INTEGER,
      allowNull: true,
      field: 'jabatan',
    },
    isTkjp: {
      type: DataTypes.BOOLEAN,
      allowNull: false,
      defaultValue: false,
      field: 'is_tkjp',
    },
    normalizedUserName: {
      type: DataTypes.STRING(255),
      allowNull: true,
      field: 'normalized_user_name',
    },
    normalizedEmail: {
      type: DataTypes.STRING(255),
      allowNull: true,
      field: 'normalized_email',
    },
    emailConfirmed: {
      type: DataTypes.BOOLEAN,
      allowNull: false,
      defaultValue: false,
      field: 'email_confirmed',
    },
    securityStamp: {
      type: DataTypes.STRING(255),
      allowNull: true,
      field: 'security_stamp',
    },
    concurrencyStamp: {
      type: DataTypes.STRING(255),
      allowNull: true,
      field: 'concurrency_stamp',
    },
    phoneNumber: {
      type: DataTypes.STRING(50),
      allowNull: true,
      field: 'phone_number',
    },
    phoneNumberConfirmed: {
      type: DataTypes.BOOLEAN,
      allowNull: false,
      defaultValue: false,
      field: 'phone_number_confirmed',
    },
    twoFactorEnabled: {
      type: DataTypes.BOOLEAN,
      allowNull: false,
      defaultValue: false,
      field: 'two_factor_enabled',
    },
    lockoutEnd: {
      type: DataTypes.DATE,
      allowNull: true,
      field: 'lockout_end',
    },
    lockoutEnabled: {
      type: DataTypes.BOOLEAN,
      allowNull: false,
      defaultValue: true,
      field: 'lockout_enabled',
    },
    accessFailedCount: {
      type: DataTypes.INTEGER,
      allowNull: false,
      defaultValue: 0,
      field: 'access_failed_count',
    },
    isSuperAdmin: {
      type: DataTypes.BOOLEAN,
      allowNull: false,
      defaultValue: false,
      field: 'is_super_admin',
    },
  },
  {
    sequelize,
    tableName: 'employees',
    timestamps: false,
  }
);

export default Employee;
