'use strict';

/** @type {import('sequelize-cli').Migration} */
module.exports = {
  async up(queryInterface, Sequelize) {
    await queryInterface.createTable('positions', {
      jabatan_id: {
        type: Sequelize.INTEGER,
        primaryKey: true,
        autoIncrement: true,
        allowNull: false
      },
      deskripsi: {
        type: Sequelize.STRING(255),
        allowNull: false
      },
      department: {
        type: Sequelize.STRING(10),
        allowNull: true,
        references: {
          model: 'departments',
          key: 'department_id'
        },
        onUpdate: 'CASCADE',
        onDelete: 'SET NULL'
      },
      jabatan_parent_id: {
        type: Sequelize.INTEGER,
        allowNull: true
      },
      is_mitra: {
        type: Sequelize.BOOLEAN,
        allowNull: false,
        defaultValue: false
      },
      is_officer: {
        type: Sequelize.BOOLEAN,
        allowNull: false,
        defaultValue: false
      },
      is_manager: {
        type: Sequelize.BOOLEAN,
        allowNull: false,
        defaultValue: false
      },
      is_vp: {
        type: Sequelize.BOOLEAN,
        allowNull: false,
        defaultValue: false
      },
      is_director: {
        type: Sequelize.BOOLEAN,
        allowNull: false,
        defaultValue: false
      },
      is_commissioner: {
        type: Sequelize.BOOLEAN,
        allowNull: false,
        defaultValue: false
      },
      is_secretary: {
        type: Sequelize.BOOLEAN,
        allowNull: false,
        defaultValue: false
      },
      is_driver: {
        type: Sequelize.BOOLEAN,
        allowNull: false,
        defaultValue: false
      },
      is_security: {
        type: Sequelize.BOOLEAN,
        allowNull: false,
        defaultValue: false
      },
      is_intern: {
        type: Sequelize.BOOLEAN,
        allowNull: false,
        defaultValue: false
      },
      del: {
        type: Sequelize.BOOLEAN,
        allowNull: false,
        defaultValue: false
      }
    });

    // Add indexes
    await queryInterface.addIndex('positions', ['department'], {
      name: 'idx_positions_department'
    });

    await queryInterface.addIndex('positions', ['jabatan_parent_id'], {
      name: 'idx_positions_parent'
    });
  },

  async down(queryInterface, Sequelize) {
    await queryInterface.dropTable('positions');
  }
};
