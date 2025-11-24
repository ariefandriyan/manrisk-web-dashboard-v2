import { Model, DataTypes } from 'sequelize';
import sequelize from '../config/database';

export class RiskData extends Model {
  declare id: number;
  declare name: string;
  declare value: number;
  declare category: string;
  declare createdAt: Date;
  declare updatedAt: Date;
}

RiskData.init(
  {
    id: {
      type: DataTypes.INTEGER,
      primaryKey: true,
      autoIncrement: true,
    },
    name: {
      type: DataTypes.STRING(255),
      allowNull: false,
    },
    value: {
      type: DataTypes.INTEGER,
      allowNull: false,
    },
    category: {
      type: DataTypes.STRING(100),
      allowNull: false,
    },
  },
  {
    sequelize,
    tableName: 'risk_data',
    timestamps: true,
    underscored: true,
  }
);

export default RiskData;
