'use strict';

/** @type {import('sequelize-cli').Migration} */
module.exports = {
  async up(queryInterface, Sequelize) {
    // Add is_super_admin column to employees table
    await queryInterface.addColumn('employees', 'is_super_admin', {
      type: Sequelize.BOOLEAN,
      allowNull: false,
      defaultValue: false,
      comment: 'Flag to identify super admin users that should not be deleted during sync',
    });

    console.log('✅ Added is_super_admin column to employees table');
  },

  async down(queryInterface, Sequelize) {
    await queryInterface.removeColumn('employees', 'is_super_admin');
  },
};
