'use strict';

/** @type {import('sequelize-cli').Migration} */
export default {
  async up(queryInterface, Sequelize) {
    // Check if achievements already exist
    const existing = await queryInterface.sequelize.query(
      'SELECT COUNT(*) as count FROM achievements',
      { type: Sequelize.QueryTypes.SELECT }
    );
    
    if (existing[0].count > 0) {
      console.log(`⏭️  Skipping: ${existing[0].count} achievements already exist`);
      return;
    }

    // Insert sample achievements
    await queryInterface.bulkInsert('achievements', [
      {
        achievement_topic: 'Excellence in Project Management',
        achievement_date_start: new Date('2024-01-15'),
        achievement_date_end: new Date('2024-03-15'),
        achievement_type: 1, // 1 = Award, 2 = Certification, 3 = Training
        achievement_valid_until: new Date('2026-01-15'),
        achievement_value: 100,
        achievement_organizer: 'Project Management Institute',
        achievement_input_by_name: 'Admin'
      },
      {
        achievement_topic: 'ISO 27001 Information Security Certification',
        achievement_date_start: new Date('2024-06-01'),
        achievement_date_end: new Date('2024-06-05'),
        achievement_type: 2,
        achievement_valid_until: new Date('2027-06-01'),
        achievement_value: 85,
        achievement_organizer: 'ISO Training Center',
        achievement_input_by_name: 'HR Department'
      },
      {
        achievement_topic: 'Risk Management Workshop',
        achievement_date_start: new Date('2024-09-10'),
        achievement_date_end: new Date('2024-09-12'),
        achievement_type: 3,
        achievement_valid_until: new Date('2025-09-10'),
        achievement_value: 90,
        achievement_organizer: 'National Risk Management Association',
        achievement_input_by_name: 'Training Coordinator'
      }
    ]);
    
    console.log('✅ Inserted 3 sample achievements');
  },

  async down(queryInterface, Sequelize) {
    await queryInterface.bulkDelete('achievements', null, {});
  }
};
