'use strict';

/** @type {import('sequelize-cli').Migration} */
module.exports = {
  async up(queryInterface, Sequelize) {
    await queryInterface.createTable('achievements', {
      achievement_id: {
        type: Sequelize.BIGINT,
        primaryKey: true,
        autoIncrement: true,
        allowNull: false
      },
      achievement_created_at: {
        type: Sequelize.DATE,
        allowNull: false,
        defaultValue: Sequelize.literal('GETDATE()')
      },
      achievement_topic: {
        type: Sequelize.TEXT,
        allowNull: true
      },
      achievement_date_start: {
        type: Sequelize.DATEONLY,
        allowNull: true
      },
      achievement_type: {
        type: Sequelize.SMALLINT,
        allowNull: true
      },
      achievement_valid_until: {
        type: Sequelize.DATEONLY,
        allowNull: true
      },
      achievement_value: {
        type: Sequelize.INTEGER,
        allowNull: true
      },
      achievement_organizer: {
        type: Sequelize.TEXT,
        allowNull: true
      },
      achievement_employee: {
        type: Sequelize.UUID,
        allowNull: true,
        references: {
          model: 'employees',
          key: 'id'
        },
        onUpdate: 'CASCADE',
        onDelete: 'SET NULL'
      },
      achievement_date_end: {
        type: Sequelize.DATEONLY,
        allowNull: true
      },
      achievement_input_by_name: {
        type: Sequelize.TEXT,
        allowNull: true
      },
      achievement_input_by_id: {
        type: Sequelize.UUID,
        allowNull: true
      }
    });

    // Add indexes for better query performance
    await queryInterface.addIndex('achievements', ['achievement_employee'], {
      name: 'idx_achievements_employee'
    });

    await queryInterface.addIndex('achievements', ['achievement_type'], {
      name: 'idx_achievements_type'
    });

    await queryInterface.addIndex('achievements', ['achievement_created_at'], {
      name: 'idx_achievements_created_at'
    });
  },

  async down(queryInterface, Sequelize) {
    await queryInterface.dropTable('achievements');
  }
};
