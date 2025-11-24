'use strict';

/** @type {import('sequelize-cli').Migration} */
module.exports = {
  async up(queryInterface, Sequelize) {
    // Get super admin employee ID
    const [superAdmin] = await queryInterface.sequelize.query(
      `SELECT id FROM employees WHERE email = 'admin@super.nusantararegas.com'`,
      { type: Sequelize.QueryTypes.SELECT }
    );

    if (!superAdmin) {
      console.log('⚠️  Super admin user not found. Run seed-super-admin first.');
      return;
    }

    // Get Administrator role ID
    const [adminRole] = await queryInterface.sequelize.query(
      `SELECT id FROM roles WHERE role_name = 'Administrator'`,
      { type: Sequelize.QueryTypes.SELECT }
    );

    if (!adminRole) {
      console.log('⚠️  Administrator role not found. Run seed-roles first.');
      return;
    }

    // Assign Administrator role to super admin
    await queryInterface.bulkInsert('user_roles', [
      {
        employee_id: superAdmin.id,
        role_id: adminRole.id,
        created_at: new Date(),
        updated_at: new Date(),
      },
    ]);

    console.log('✅ Administrator role assigned to Super Admin user');
    console.log('   User: admin@super.nusantararegas.com');
    console.log('   Role: Administrator (full access)');
  },

  async down(queryInterface, Sequelize) {
    // Get super admin employee ID
    const [superAdmin] = await queryInterface.sequelize.query(
      `SELECT id FROM employees WHERE email = 'admin@super.nusantararegas.com'`,
      { type: Sequelize.QueryTypes.SELECT }
    );

    if (superAdmin) {
      await queryInterface.bulkDelete('user_roles', {
        employee_id: superAdmin.id,
      }, {});
    }
  },
};
