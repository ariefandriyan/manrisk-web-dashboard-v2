'use strict';

/** @type {import('sequelize-cli').Migration} */
module.exports = {
  async up(queryInterface, Sequelize) {
    await queryInterface.createTable('roles', {
      id: {
        type: Sequelize.INTEGER,
        primaryKey: true,
        autoIncrement: true,
        allowNull: false,
      },
      role_name: {
        type: Sequelize.STRING(100),
        allowNull: false,
        unique: true,
      },
      permissions: {
        type: Sequelize.TEXT,
        allowNull: false,
        comment: 'JSON array of permission strings',
      },
      description: {
        type: Sequelize.STRING(500),
        allowNull: true,
      },
      created_at: {
        type: Sequelize.DATE,
        allowNull: false,
        defaultValue: Sequelize.literal('GETDATE()'),
      },
      updated_at: {
        type: Sequelize.DATE,
        allowNull: false,
        defaultValue: Sequelize.literal('GETDATE()'),
      },
    });

    // Add index on role_name for faster lookups
    await queryInterface.addIndex('roles', ['role_name'], {
      name: 'idx_roles_role_name',
    });
  },

  async down(queryInterface, Sequelize) {
    await queryInterface.dropTable('roles');
  },
};
