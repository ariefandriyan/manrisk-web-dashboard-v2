import { Model, DataTypes } from 'sequelize';
import sequelize from '../config/database';

export class Position extends Model {
  declare jabatanID: number;
  declare deskripsi: string;
  declare department: string | null;
  declare jabatanParentID: number | null;
  declare isMitra: boolean;
  declare isOfficer: boolean;
  declare isManager: boolean;
  declare isVp: boolean;
  declare isDirector: boolean;
  declare isCommissioner: boolean;
  declare isSecretary: boolean;
  declare isDriver: boolean;
  declare isSecurity: boolean;
  declare isIntern: boolean;
  declare del: boolean;
}

Position.init(
  {
    jabatanID: {
      type: DataTypes.INTEGER,
      primaryKey: true,
      autoIncrement: true,
      field: 'jabatan_id',
    },
    deskripsi: {
      type: DataTypes.STRING(255),
      allowNull: false,
      field: 'deskripsi',
    },
    department: {
      type: DataTypes.STRING(10),
      allowNull: true,
      field: 'department',
    },
    jabatanParentID: {
      type: DataTypes.INTEGER,
      allowNull: true,
      field: 'jabatan_parent_id',
    },
    isMitra: {
      type: DataTypes.BOOLEAN,
      allowNull: false,
      defaultValue: false,
      field: 'is_mitra',
    },
    isOfficer: {
      type: DataTypes.BOOLEAN,
      allowNull: false,
      defaultValue: false,
      field: 'is_officer',
    },
    isManager: {
      type: DataTypes.BOOLEAN,
      allowNull: false,
      defaultValue: false,
      field: 'is_manager',
    },
    isVp: {
      type: DataTypes.BOOLEAN,
      allowNull: false,
      defaultValue: false,
      field: 'is_vp',
    },
    isDirector: {
      type: DataTypes.BOOLEAN,
      allowNull: false,
      defaultValue: false,
      field: 'is_director',
    },
    isCommissioner: {
      type: DataTypes.BOOLEAN,
      allowNull: false,
      defaultValue: false,
      field: 'is_commissioner',
    },
    isSecretary: {
      type: DataTypes.BOOLEAN,
      allowNull: false,
      defaultValue: false,
      field: 'is_secretary',
    },
    isDriver: {
      type: DataTypes.BOOLEAN,
      allowNull: false,
      defaultValue: false,
      field: 'is_driver',
    },
    isSecurity: {
      type: DataTypes.BOOLEAN,
      allowNull: false,
      defaultValue: false,
      field: 'is_security',
    },
    isIntern: {
      type: DataTypes.BOOLEAN,
      allowNull: false,
      defaultValue: false,
      field: 'is_intern',
    },
    del: {
      type: DataTypes.BOOLEAN,
      allowNull: false,
      defaultValue: false,
      field: 'del',
    },
  },
  {
    sequelize,
    tableName: 'positions',
    timestamps: false,
  }
);

export default Position;
