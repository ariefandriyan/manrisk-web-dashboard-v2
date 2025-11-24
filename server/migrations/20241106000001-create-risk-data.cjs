'use strict';

/** @type {import('sequelize-cli').Migration} */
module.exports = {
  async up(queryInterface, Sequelize) {
    await queryInterface.createTable('risk_data', {
      id: {
        allowNull: false,
        autoIncrement: true,
        primaryKey: true,
        type: Sequelize.INTEGER
      },
      name: {
        type: Sequelize.STRING(255),
        allowNull: false
      },
      value: {
        type: Sequelize.INTEGER,
        allowNull: false
      },
      category: {
        type: Sequelize.STRING(100),
        allowNull: false
      },
      created_at: {
        allowNull: false,
        type: Sequelize.DATE,
        defaultValue: Sequelize.literal('GETDATE()')
      },
      updated_at: {
        allowNull: false,
        type: Sequelize.DATE,
        defaultValue: Sequelize.literal('GETDATE()')
      }
    });

    // Add indexes
    await queryInterface.addIndex('risk_data', ['category'], {
      name: 'idx_category'
    });

    await queryInterface.addIndex('risk_data', ['created_at'], {
      name: 'idx_created_at'
    });
  },

  async down(queryInterface, Sequelize) {
    await queryInterface.dropTable('risk_data');
  }
};
