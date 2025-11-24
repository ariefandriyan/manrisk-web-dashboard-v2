import { Sequelize } from 'sequelize';
import dotenv from 'dotenv';

dotenv.config();

const sequelize = new Sequelize({
  database: process.env.DB_NAME || 'your_database',
  dialect: 'mssql',
  username: process.env.DB_USER || 'your_username',
  password: process.env.DB_PASSWORD || 'your_password',
  host: process.env.DB_SERVER || 'localhost',
  port: parseInt(process.env.DB_PORT || '1433'),
  dialectOptions: {
    options: {
      encrypt: true,
      trustServerCertificate: true,
    },
  },
  logging: process.env.NODE_ENV === 'development' ? console.log : false,
  pool: {
    max: 5,
    min: 0,
    acquire: 30000,
    idle: 10000,
  },
});

export default sequelize;
