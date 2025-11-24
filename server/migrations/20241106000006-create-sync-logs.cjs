'use strict';

/** @type {import('sequelize-cli').Migration} */
module.exports = {
  async up(queryInterface, Sequelize) {
    await queryInterface.createTable('sync_logs', {
      id: {
        type: Sequelize.INTEGER,
        primaryKey: true,
        autoIncrement: true,
        allowNull: false,
      },
      sync_type: {
        type: Sequelize.STRING(20),
        allowNull: false,
      },
      status: {
        type: Sequelize.STRING(20),
        allowNull: false,
      },
      synced_by: {
        type: Sequelize.STRING(255),
        allowNull: false,
      },
      source_ip: {
        type: Sequelize.STRING(45),
        allowNull: true,
      },
      departments_count: {
        type: Sequelize.INTEGER,
        allowNull: true,
      },
      positions_count: {
        type: Sequelize.INTEGER,
        allowNull: true,
      },
      employees_count: {
        type: Sequelize.INTEGER,
        allowNull: true,
      },
      error_message: {
        type: Sequelize.TEXT,
        allowNull: true,
      },
      synced_at: {
        type: Sequelize.DATE,
        allowNull: false,
        defaultValue: Sequelize.literal('GETDATE()'),
      },
    });

    // Add index for faster queries
    await queryInterface.addIndex('sync_logs', ['synced_at'], {
      name: 'idx_sync_logs_synced_at',
    });

    await queryInterface.addIndex('sync_logs', ['sync_type'], {
      name: 'idx_sync_logs_sync_type',
    });

    await queryInterface.addIndex('sync_logs', ['status'], {
      name: 'idx_sync_logs_status',
    });
  },

  async down(queryInterface, Sequelize) {
    await queryInterface.dropTable('sync_logs');
  }
};
