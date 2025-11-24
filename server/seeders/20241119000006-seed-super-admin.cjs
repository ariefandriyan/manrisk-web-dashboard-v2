'use strict';

const crypto = require('crypto');

/** @type {import('sequelize-cli').Migration} */
module.exports = {
  async up(queryInterface, Sequelize) {
    // Generate UUID v4 manually
    const adminId = crypto.randomUUID();
    
    await queryInterface.bulkInsert('employees', [
      {
        id: adminId,
        name: 'Super Admin',
        email: 'admin@super.nusantararegas.com',
        user_name: 'admin',
        department: null,
        jabatan: null,
        password_hash: null,
        gcg: false,
        gcg_admin: false,
        code_of_conduct: false,
        conflict_of_interest: false,
        code_of_conduct_dt: null,
        conflict_of_interest_dt: null,
        nip: 'SUPERADMIN001',
        is_tkjp: false,
        normalized_user_name: 'ADMIN',
        normalized_email: 'ADMIN@SUPER.NUSANTARAREGAS.COM',
        email_confirmed: true,
        security_stamp: null,
        concurrency_stamp: null,
        phone_number: null,
        phone_number_confirmed: false,
        two_factor_enabled: false,
        lockout_end: null,
        lockout_enabled: false,
        access_failed_count: 0,
        is_super_admin: true,
      },
    ]);

    console.log('✅ Super Admin user created with ID:', adminId);
    console.log('   Username: admin');
    console.log('   Email: admin@super.nusantararegas.com');
    console.log('   This user will not be deleted during employee sync');
  },

  async down(queryInterface, Sequelize) {
    await queryInterface.bulkDelete('employees', {
      email: 'admin@super.nusantararegas.com',
    }, {});
  },
};
