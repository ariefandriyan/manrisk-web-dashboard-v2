'use strict';

/** @type {import('sequelize-cli').Migration} */
module.exports = {
  async up(queryInterface, Sequelize) {
    await queryInterface.createTable('departments', {
      department_id: {
        type: Sequelize.STRING(10),
        primaryKey: true,
        allowNull: false
      },
      deskripsi: {
        type: Sequelize.STRING(255),
        allowNull: false
      },
      induk: {
        type: Sequelize.STRING(10),
        allowNull: true
      },
      is_department: {
        type: Sequelize.STRING(1),
        allowNull: false,
        defaultValue: 'N'
      }
    });

    // Add index on induk for faster lookups
    await queryInterface.addIndex('departments', ['induk'], {
      name: 'idx_departments_induk'
    });
  },

  async down(queryInterface, Sequelize) {
    await queryInterface.dropTable('departments');
  }
};
