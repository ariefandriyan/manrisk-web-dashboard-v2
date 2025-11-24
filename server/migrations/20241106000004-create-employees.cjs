'use strict';

/** @type {import('sequelize-cli').Migration} */
module.exports = {
  async up(queryInterface, Sequelize) {
    await queryInterface.createTable('employees', {
      id: {
        type: Sequelize.UUID,
        primaryKey: true,
        allowNull: false
      },
      email: {
        type: Sequelize.STRING(255),
        allowNull: true
      },
      user_name: {
        type: Sequelize.STRING(255),
        allowNull: true
      },
      name: {
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
      password_hash: {
        type: Sequelize.TEXT,
        allowNull: true
      },
      gcg: {
        type: Sequelize.BOOLEAN,
        allowNull: false,
        defaultValue: false
      },
      gcg_admin: {
        type: Sequelize.BOOLEAN,
        allowNull: false,
        defaultValue: false
      },
      code_of_conduct: {
        type: Sequelize.BOOLEAN,
        allowNull: false,
        defaultValue: false
      },
      conflict_of_interest: {
        type: Sequelize.BOOLEAN,
        allowNull: false,
        defaultValue: false
      },
      code_of_conduct_dt: {
        type: Sequelize.DATE,
        allowNull: true
      },
      conflict_of_interest_dt: {
        type: Sequelize.DATE,
        allowNull: true
      },
      nip: {
        type: Sequelize.STRING(50),
        allowNull: true
      },
      jabatan: {
        type: Sequelize.INTEGER,
        allowNull: true,
        references: {
          model: 'positions',
          key: 'jabatan_id'
        },
        onUpdate: 'CASCADE',
        onDelete: 'SET NULL'
      },
      is_tkjp: {
        type: Sequelize.BOOLEAN,
        allowNull: false,
        defaultValue: false
      },
      normalized_user_name: {
        type: Sequelize.STRING(255),
        allowNull: true
      },
      normalized_email: {
        type: Sequelize.STRING(255),
        allowNull: true
      },
      email_confirmed: {
        type: Sequelize.BOOLEAN,
        allowNull: false,
        defaultValue: false
      },
      security_stamp: {
        type: Sequelize.STRING(255),
        allowNull: true
      },
      concurrency_stamp: {
        type: Sequelize.STRING(255),
        allowNull: true
      },
      phone_number: {
        type: Sequelize.STRING(50),
        allowNull: true
      },
      phone_number_confirmed: {
        type: Sequelize.BOOLEAN,
        allowNull: false,
        defaultValue: false
      },
      two_factor_enabled: {
        type: Sequelize.BOOLEAN,
        allowNull: false,
        defaultValue: false
      },
      lockout_end: {
        type: Sequelize.DATE,
        allowNull: true
      },
      lockout_enabled: {
        type: Sequelize.BOOLEAN,
        allowNull: false,
        defaultValue: true
      },
      access_failed_count: {
        type: Sequelize.INTEGER,
        allowNull: false,
        defaultValue: 0
      }
    });

    // Add indexes
    await queryInterface.addIndex('employees', ['email'], {
      name: 'idx_employees_email'
    });

    await queryInterface.addIndex('employees', ['user_name'], {
      name: 'idx_employees_username'
    });

    await queryInterface.addIndex('employees', ['department'], {
      name: 'idx_employees_department'
    });

    await queryInterface.addIndex('employees', ['jabatan'], {
      name: 'idx_employees_jabatan'
    });

    await queryInterface.addIndex('employees', ['nip'], {
      name: 'idx_employees_nip'
    });
  },

  async down(queryInterface, Sequelize) {
    await queryInterface.dropTable('employees');
  }
};
