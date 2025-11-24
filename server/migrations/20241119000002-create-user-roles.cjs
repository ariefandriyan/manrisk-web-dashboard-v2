'use strict';

/** @type {import('sequelize-cli').Migration} */
module.exports = {
  async up(queryInterface, Sequelize) {
    await queryInterface.createTable('user_roles', {
      id: {
        type: Sequelize.INTEGER,
        primaryKey: true,
        autoIncrement: true,
        allowNull: false,
      },
      employee_id: {
        type: Sequelize.UUID,
        allowNull: false,
        references: {
          model: 'employees',
          key: 'id',
        },
        onUpdate: 'CASCADE',
        onDelete: 'CASCADE',
      },
      role_id: {
        type: Sequelize.INTEGER,
        allowNull: false,
        references: {
          model: 'roles',
          key: 'id',
        },
        onUpdate: 'CASCADE',
        onDelete: 'CASCADE',
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

    // Add composite unique index to prevent duplicate role assignments
    await queryInterface.addIndex('user_roles', ['employee_id', 'role_id'], {
      unique: true,
      name: 'idx_user_roles_unique',
    });

    // Add index on employee_id for faster lookups
    await queryInterface.addIndex('user_roles', ['employee_id'], {
      name: 'idx_user_roles_employee_id',
    });

    // Add index on role_id for faster lookups
    await queryInterface.addIndex('user_roles', ['role_id'], {
      name: 'idx_user_roles_role_id',
    });
  },

  async down(queryInterface, Sequelize) {
    await queryInterface.dropTable('user_roles');
  },
};
