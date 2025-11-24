import dotenv from 'dotenv';

dotenv.config();

export default {
  development: {
    username: process.env.DB_USER || 'your_username',
    password: process.env.DB_PASSWORD || 'your_password',
    database: process.env.DB_NAME || 'your_database',
    host: process.env.DB_SERVER || 'localhost',
    port: parseInt(process.env.DB_PORT || '1433'),
    dialect: 'mssql',
    dialectOptions: {
      options: {
        encrypt: true,
        trustServerCertificate: true,
        enableArithAbort: true,
      },
    },
    pool: {
      max: 5,
      min: 0,
      acquire: 30000,
      idle: 10000,
    },
  },
  test: {
    username: process.env.DB_USER || 'your_username',
    password: process.env.DB_PASSWORD || 'your_password',
    database: process.env.DB_NAME_TEST || 'your_database_test',
    host: process.env.DB_SERVER || 'localhost',
    port: parseInt(process.env.DB_PORT || '1433'),
    dialect: 'mssql',
    dialectOptions: {
      options: {
        encrypt: true,
        trustServerCertificate: true,
        enableArithAbort: true,
      },
    },
    pool: {
      max: 5,
      min: 0,
      acquire: 30000,
      idle: 10000,
    },
  },
  production: {
    username: process.env.DB_USER,
    password: process.env.DB_PASSWORD,
    database: process.env.DB_NAME,
    host: process.env.DB_SERVER,
    port: parseInt(process.env.DB_PORT || '1433'),
    dialect: 'mssql',
    dialectOptions: {
      options: {
        encrypt: true,
        trustServerCertificate: false,
        enableArithAbort: true,
      },
    },
    pool: {
      max: 5,
      min: 0,
      acquire: 30000,
      idle: 10000,
    },
  },
};
