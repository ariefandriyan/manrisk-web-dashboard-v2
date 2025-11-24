'use strict';

import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

/** @type {import('sequelize-cli').Migration} */
export default {
  async up(queryInterface, Sequelize) {
    // Check if positions already exist
    const existingPos = await queryInterface.sequelize.query(
      'SELECT COUNT(*) as count FROM positions',
      { type: Sequelize.QueryTypes.SELECT }
    );
    
    if (existingPos[0].count > 0) {
      console.log(`⏭️  Skipping: ${existingPos[0].count} positions already exist`);
      return;
    }

    // Read the positions JSON file
    const positionsPath = path.join(__dirname, '../data_initials/positions.json');
    const positionsData = JSON.parse(fs.readFileSync(positionsPath, 'utf8'));

    // Read departments to validate foreign keys
    const departmentsPath = path.join(__dirname, '../data_initials/departments.json');
    const departmentsData = JSON.parse(fs.readFileSync(departmentsPath, 'utf8'));
    const validDepts = new Set(departmentsData.map(d => d.departmentID));

    // Transform data to match database schema
    const positions = positionsData.map(pos => {
      const deptStr = pos.department ? pos.department.toString() : null;
      // Set to NULL if department doesn't exist
      const validDept = deptStr && validDepts.has(deptStr) ? `'${deptStr}'` : 'NULL';
      
      return {
        jabatan_id: pos.jabatanID,
        deskripsi: pos.deskripsi,
        department: validDept,
        jabatan_parent_id: pos.jabatanParentID || 'NULL',
        is_mitra: pos.isMitra ? 1 : 0,
        is_officer: pos.isOfficer ? 1 : 0,
        is_manager: pos.isManager ? 1 : 0,
        is_vp: pos.isVp ? 1 : 0,
        is_director: pos.isDirector ? 1 : 0,
        is_commissioner: pos.isCommissioner ? 1 : 0,
        is_secretary: pos.isSecretary ? 1 : 0,
        is_driver: pos.isDriver ? 1 : 0,
        is_security: pos.isSecurity ? 1 : 0,
        is_intern: pos.isIntern ? 1 : 0,
        del: pos.del ? 1 : 0
      };
    });

    // Build INSERT statements
    const values = positions.map(p => 
      `(${p.jabatan_id}, '${p.deskripsi.replace(/'/g, "''")}', ${p.department}, ${p.jabatan_parent_id}, ` +
      `${p.is_mitra}, ${p.is_officer}, ${p.is_manager}, ${p.is_vp}, ${p.is_director}, ` +
      `${p.is_commissioner}, ${p.is_secretary}, ${p.is_driver}, ${p.is_security}, ${p.is_intern}, ${p.del})`
    ).join(',\n      ');

    const insertQuery = `
      SET IDENTITY_INSERT positions ON;
      
      INSERT INTO positions (
        jabatan_id, deskripsi, department, jabatan_parent_id,
        is_mitra, is_officer, is_manager, is_vp, is_director,
        is_commissioner, is_secretary, is_driver, is_security,
        is_intern, del
      ) VALUES
        ${values};
      
      SET IDENTITY_INSERT positions OFF;
    `;
    
    await queryInterface.sequelize.query(insertQuery);
    
    console.log(`✅ Inserted ${positions.length} positions`);
  },

  async down(queryInterface, Sequelize) {
    await queryInterface.bulkDelete('positions', null, {});
  }
};
