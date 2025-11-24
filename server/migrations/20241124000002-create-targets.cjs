'use strict';

/** @type {import('sequelize-cli').Migration} */
module.exports = {
  async up(queryInterface, Sequelize) {
    await queryInterface.createTable('targets', {
      id: {
        type: Sequelize.INTEGER,
        primaryKey: true,
        autoIncrement: true,
        allowNull: false,
      },
      department_id: {
        type: Sequelize.STRING(10),
        allowNull: false,
        references: {
          model: 'departments',
          key: 'department_id',
        },
        onUpdate: 'CASCADE',
        onDelete: 'CASCADE',
      },
      year: {
        type: Sequelize.INTEGER,
        allowNull: false,
        comment: 'Tahun target berlaku',
      },
      certification_target: {
        type: Sequelize.INTEGER,
        allowNull: false,
        defaultValue: 0,
        comment: 'Target jumlah sertifikasi per tahun',
      },
      learning_hours_target: {
        type: Sequelize.INTEGER,
        allowNull: false,
        defaultValue: 0,
        comment: 'Target learning hours per tahun',
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

    // Add unique constraint for department + year combination
    await queryInterface.addConstraint('targets', {
      fields: ['department_id', 'year'],
      type: 'unique',
      name: 'unique_department_year',
    });

    // Add index for faster queries
    await queryInterface.addIndex('targets', ['year'], {
      name: 'idx_targets_year',
    });
  },

  async down(queryInterface, Sequelize) {
    await queryInterface.dropTable('targets');
  },
};
