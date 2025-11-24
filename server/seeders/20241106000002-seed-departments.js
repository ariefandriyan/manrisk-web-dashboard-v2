'use strict';

import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

/** @type {import('sequelize-cli').Migration} */
export default {
  async up(queryInterface, Sequelize) {
    // Check if departments already exist
    const existingDepts = await queryInterface.sequelize.query(
      'SELECT COUNT(*) as count FROM departments',
      { type: Sequelize.QueryTypes.SELECT }
    );
    
    if (existingDepts[0].count > 0) {
      console.log(`⏭️  Skipping: ${existingDepts[0].count} departments already exist`);
      return;
    }

    // Read the departments JSON file
    const departmentsPath = path.join(__dirname, '../data_initials/departments.json');
    const departmentsData = JSON.parse(fs.readFileSync(departmentsPath, 'utf8'));

    // Transform data to match database schema
    const departments = departmentsData.map(dept => ({
      department_id: dept.departmentID,
      deskripsi: dept.deskripsi,
      induk: dept.induk,
      is_department: dept.isDepartment
    }));

    // Insert departments
    await queryInterface.bulkInsert('departments', departments, {});
    
    console.log(`✅ Inserted ${departments.length} departments`);
  },

  async down(queryInterface, Sequelize) {
    await queryInterface.bulkDelete('departments', null, {});
  }
};
