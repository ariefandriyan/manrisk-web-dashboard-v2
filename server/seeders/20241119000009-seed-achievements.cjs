'use strict';

module.exports = {
  up: async (queryInterface, Sequelize) => {
    // Get some employee IDs first
    const employees = await queryInterface.sequelize.query(
      `SELECT TOP 5 id, name FROM employees`,
      { type: Sequelize.QueryTypes.SELECT }
    );

    if (employees.length === 0) {
      console.log('⚠️  No employees found. Skipping achievements seeding.');
      return;
    }

    const achievements = [
      {
        achievement_topic: 'Excellence in Project Management',
        achievement_type: 1, // Pelatihan
        achievement_valid_until: '2026-01-15',
        achievement_value: 100,
        achievement_organizer: 'Project Management Institute',
        achievement_employee: employees[0].id,
        achievement_date_start: '2024-01-15',
        achievement_date_end: '2024-03-15',
        achievement_input_by_name: 'Admin',
        achievement_input_by_id: null,
        achievement_created_at: new Date(),
      },
      {
        achievement_topic: 'ISO 27001 Information Security Certification',
        achievement_type: 2, // Sertifikat
        achievement_valid_until: '2027-06-01',
        achievement_value: 85,
        achievement_organizer: 'ISO Training Center',
        achievement_employee: employees[1]?.id || employees[0].id,
        achievement_date_start: '2024-06-01',
        achievement_date_end: '2024-06-05',
        achievement_input_by_name: 'HR Department',
        achievement_input_by_id: null,
        achievement_created_at: new Date(),
      },
      {
        achievement_topic: 'Risk Management Workshop',
        achievement_type: 1, // Pelatihan
        achievement_valid_until: '2025-09-10',
        achievement_value: 90,
        achievement_organizer: 'National Risk Management Association',
        achievement_employee: employees[2]?.id || employees[0].id,
        achievement_date_start: '2024-09-10',
        achievement_date_end: '2024-09-12',
        achievement_input_by_name: 'Training Coordinator',
        achievement_input_by_id: null,
        achievement_created_at: new Date(),
      },
      {
        achievement_topic: 'Advanced SQL Database Management',
        achievement_type: 1, // Pelatihan
        achievement_valid_until: '2025-12-20',
        achievement_value: 95,
        achievement_organizer: 'Microsoft Learning',
        achievement_employee: employees[3]?.id || employees[0].id,
        achievement_date_start: '2024-11-01',
        achievement_date_end: '2024-11-03',
        achievement_input_by_name: 'IT Manager',
        achievement_input_by_id: null,
        achievement_created_at: new Date(),
      },
      {
        achievement_topic: 'Certified Information Systems Auditor (CISA)',
        achievement_type: 2, // Sertifikat
        achievement_valid_until: '2028-03-15',
        achievement_value: 88,
        achievement_organizer: 'ISACA',
        achievement_employee: employees[4]?.id || employees[0].id,
        achievement_date_start: '2024-03-15',
        achievement_date_end: '2024-03-20',
        achievement_input_by_name: 'Audit Lead',
        achievement_input_by_id: null,
        achievement_created_at: new Date(),
      },
    ];

    await queryInterface.bulkInsert('achievements', achievements, {});
    
    console.log(`✅ Seeded ${achievements.length} achievements for employees`);
  },

  down: async (queryInterface, Sequelize) => {
    await queryInterface.bulkDelete('achievements', null, {});
  },
};
