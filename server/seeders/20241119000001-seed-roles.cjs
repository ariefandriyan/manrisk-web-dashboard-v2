'use strict';

/** @type {import('sequelize-cli').Migration} */
module.exports = {
  async up(queryInterface, Sequelize) {
    // Insert default roles with permissions
    await queryInterface.bulkInsert('roles', [
      {
        role_name: 'Administrator',
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
          'settings-targets',
          'reports',
        ]),
        description: 'Full system access with all permissions',
        created_at: new Date(),
        updated_at: new Date(),
      },
      {
        role_name: 'Manager',
        permissions: JSON.stringify([
          'dashboard',
          'dashboard-tata-kelola',
          'dashboard-kapabilitas-risiko',
          'dashboard-budaya',
          'master-data-departments',
          'master-data-positions',
          'master-data-employees',
          'achievements',
          'settings-targets',
          'reports',
        ]),
        description: 'Can view and manage master data and reports',
        created_at: new Date(),
        updated_at: new Date(),
      },
      {
        role_name: 'User',
        permissions: JSON.stringify([
          'dashboard',
          'dashboard-tata-kelola',
          'dashboard-kapabilitas-risiko',
          'dashboard-budaya',
          'reports',
        ]),
        description: 'Basic access to dashboard and reports only',
        created_at: new Date(),
        updated_at: new Date(),
      },
    ]);
  },

  async down(queryInterface, Sequelize) {
    await queryInterface.bulkDelete('roles', null, {});
  },
};
