'use strict';

import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

/** @type {import('sequelize-cli').Migration} */
export default {
  async up(queryInterface, Sequelize) {
    // Check if employees already exist
    const existingEmps = await queryInterface.sequelize.query(
      'SELECT COUNT(*) as count FROM employees',
      { type: Sequelize.QueryTypes.SELECT }
    );
    
    if (existingEmps[0].count > 0) {
      console.log(`⏭️  Skipping: ${existingEmps[0].count} employees already exist`);
      return;
    }

    // Read the employees JSON file
    const employeesPath = path.join(__dirname, '../data_initials/employees.json');
    const employeesData = JSON.parse(fs.readFileSync(employeesPath, 'utf8'));

    // Read departments to validate foreign keys
    const departmentsPath = path.join(__dirname, '../data_initials/departments.json');
    const departmentsData = JSON.parse(fs.readFileSync(departmentsPath, 'utf8'));
    const validDepts = new Set(departmentsData.map(d => d.departmentID));

    // Transform data to match database schema
    const employees = employeesData.map(emp => {
      // Validate department exists
      const deptStr = emp.department?.toString();
      const validDept = deptStr && validDepts.has(deptStr) ? deptStr : null;
      
      return {
        id: emp.id,
        email: emp.email,
        user_name: emp.userName,
        name: emp.name,
        department: validDept,
        password_hash: emp.passwordHash,
        gcg: emp.gcg || false,
        gcg_admin: emp.gcgAdmin || false,
        code_of_conduct: emp.codeOfConduct || false,
        conflict_of_interest: emp.conflictOfInterest || false,
        code_of_conduct_dt: emp.codeOfConductDt ? new Date(emp.codeOfConductDt) : null,
        conflict_of_interest_dt: emp.conflictOfInterestDt ? new Date(emp.conflictOfInterestDt) : null,
        nip: emp.nip,
        jabatan: emp.jabatan,
        is_tkjp: emp.isTkjp || false,
        normalized_user_name: emp.normalizedUserName,
        normalized_email: emp.normalizedEmail,
        email_confirmed: emp.emailConfirmed || false,
        security_stamp: emp.securityStamp,
        concurrency_stamp: emp.concurrencyStamp,
        phone_number: emp.phoneNumber,
        phone_number_confirmed: emp.phoneNumberConfirmed || false,
        two_factor_enabled: emp.twoFactorEnabled || false,
        lockout_end: emp.lockoutEnd ? new Date(emp.lockoutEnd) : null,
        lockout_enabled: emp.lockoutEnabled !== undefined ? emp.lockoutEnabled : true,
        access_failed_count: emp.accessFailedCount || 0
      };
    });

    // Insert employees in batches to avoid timeout
    const batchSize = 100;
    for (let i = 0; i < employees.length; i += batchSize) {
      const batch = employees.slice(i, i + batchSize);
      await queryInterface.bulkInsert('employees', batch, {});
      console.log(`✅ Inserted employees batch ${Math.floor(i / batchSize) + 1}/${Math.ceil(employees.length / batchSize)}`);
    }
    
    console.log(`✅ Total inserted: ${employees.length} employees`);
  },

  async down(queryInterface, Sequelize) {
    await queryInterface.bulkDelete('employees', null, {});
  }
};
