import { Model, DataTypes, Optional } from 'sequelize';
import sequelize from '../config/database';
import Department from './Department';

interface TargetAttributes {
  id: number;
  departmentId: string;
  year: number;
  certificationTarget: number;
  learningHoursTarget: number;
  createdAt?: Date;
  updatedAt?: Date;
}

interface TargetCreationAttributes extends Optional<TargetAttributes, 'id'> {}

class Target extends Model<TargetAttributes, TargetCreationAttributes> implements TargetAttributes {
  public id!: number;
  public departmentId!: string;
  public year!: number;
  public certificationTarget!: number;
  public learningHoursTarget!: number;
  public readonly createdAt!: Date;
  public readonly updatedAt!: Date;

  // Association
  public readonly department?: Department;
}

Target.init(
  {
    id: {
      type: DataTypes.INTEGER,
      primaryKey: true,
      autoIncrement: true,
    },
    departmentId: {
      type: DataTypes.STRING(10),
      allowNull: false,
      field: 'department_id',
    },
    year: {
      type: DataTypes.INTEGER,
      allowNull: false,
    },
    certificationTarget: {
      type: DataTypes.INTEGER,
      allowNull: false,
      defaultValue: 0,
      field: 'certification_target',
    },
    learningHoursTarget: {
      type: DataTypes.INTEGER,
      allowNull: false,
      defaultValue: 0,
      field: 'learning_hours_target',
    },
  },
  {
    sequelize,
    tableName: 'targets',
    timestamps: true,
    underscored: true,
  }
);

// Define associations
Target.belongsTo(Department, { 
  foreignKey: 'departmentId', 
  targetKey: 'departmentID',
  as: 'department' 
});
Department.hasMany(Target, { 
  foreignKey: 'departmentId', 
  sourceKey: 'departmentID',
  as: 'targets' 
});

export default Target;
