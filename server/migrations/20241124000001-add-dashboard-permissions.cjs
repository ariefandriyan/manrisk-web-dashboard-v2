'use strict';

/** @type {import('sequelize-cli').Migration} */
module.exports = {
  async up(queryInterface, Sequelize) {
    // Update Administrator role
    await queryInterface.sequelize.query(`
      UPDATE roles 
      SET permissions = :permissions, updated_at = :updatedAt
      WHERE role_name = 'Administrator'
    `, {
      replacements: {
        permissions: JSON.stringify([
          'dashboard',
          'dashboard-tata-kelola',
          'dashboard-kapabilitas-risiko',
          'dashboard-budaya',
          'master-data-departments',
          'master-data-positions',
          'master-data-employees',
          'achievements',
          'settings-app',
          'settings-access',
          'reports',
        ]),
        updatedAt: new Date(),
      },
    });

    // Update Manager role
    await queryInterface.sequelize.query(`
      UPDATE roles 
      SET permissions = :permissions, updated_at = :updatedAt
      WHERE role_name = 'Manager'
    `, {
      replacements: {
        permissions: JSON.stringify([
          'dashboard',
          'dashboard-tata-kelola',
          'dashboard-kapabilitas-risiko',
          'dashboard-budaya',
          'master-data-departments',
          'master-data-positions',
          'master-data-employees',
          'achievements',
          'reports',
        ]),
        updatedAt: new Date(),
      },
    });

    // Update User role
    await queryInterface.sequelize.query(`
      UPDATE roles 
      SET permissions = :permissions, updated_at = :updatedAt
      WHERE role_name = 'User'
    `, {
      replacements: {
        permissions: JSON.stringify([
          'dashboard',
          'dashboard-tata-kelola',
          'dashboard-kapabilitas-risiko',
          'dashboard-budaya',
          'reports',
        ]),
        updatedAt: new Date(),
      },
    });
  },

  async down(queryInterface, Sequelize) {
    // Revert Administrator role
    await queryInterface.sequelize.query(`
      UPDATE roles 
      SET permissions = :permissions, updated_at = :updatedAt
      WHERE role_name = 'Administrator'
    `, {
      replacements: {
        permissions: JSON.stringify([
          'dashboard',
          'master-data-departments',
          'master-data-positions',
          'master-data-employees',
          'settings-app',
          'settings-access',
          'reports',
        ]),
        updatedAt: new Date(),
      },
    });

    // Revert Manager role
    await queryInterface.sequelize.query(`
      UPDATE roles 
      SET permissions = :permissions, updated_at = :updatedAt
      WHERE role_name = 'Manager'
    `, {
      replacements: {
        permissions: JSON.stringify([
          'dashboard',
          'master-data-departments',
          'master-data-positions',
          'master-data-employees',
          'reports',
        ]),
        updatedAt: new Date(),
      },
    });

    // Revert User role
    await queryInterface.sequelize.query(`
      UPDATE roles 
      SET permissions = :permissions, updated_at = :updatedAt
      WHERE role_name = 'User'
    `, {
      replacements: {
        permissions: JSON.stringify([
          'dashboard',
          'reports',
        ]),
        updatedAt: new Date(),
      },
    });
  },
};
