// migrations/YYYYMMDDHHMMSS-create_patient_admission_medicalhx_view.js
'use strict';

module.exports = {

  
  up: async (queryInterface, Sequelize) => {
    await queryInterface.sequelize.query('DROP VIEW IF EXISTS patient_admission_medicalhx_view');
    await queryInterface.sequelize.query(`
      CREATE VIEW patient_admission_medicalhx_view AS 
      SELECT 
        p.id AS patient_id,
        p.full_name AS full_name,
        p.address AS address,
        p.blood_gr AS blood_group,
        p.dob AS date_of_birth,
        p.marrital_status AS marital_status,
        p.nic AS national_id_card,
        p.phone_no AS patient_phone_no,
        a.id AS admission_id,
        a.date AS admission_date,
        a.bht AS bed_number,
        a.ward_no AS ward_number,
        a.consultant AS consultant_name,
        a.status AS admission_status,
        a.add_count AS admission_count,
        mhx.diagnosis AS medical_history_diagnosis,
        mhx.allergy AS medical_allergy,
        mhx.past_med AS past_medical_conditions,
        mhx.past_surg AS past_surgical_history,
        mhx.hx_diseases AS medical_history_diseases,
        mhx.hx_cancer AS medical_history_cancer,
        a.height AS height,
        a.weight AS weight,
        mhx.menarche_age AS menarche_age,
        mhx.menopausal_age AS menopausal_age,
        mhx.lmp AS last_menstrual_period,
        mhx.menstrual_cycle AS menstrual_cycle_type
      FROM patient p
      JOIN admission a ON p.phn = a.phn
      LEFT JOIN medical_hx mhx ON p.phn = mhx.phn;
    `);
  },

   down: async (queryInterface, Sequelize) => {
    // Optionally drop the view or table in the down migration
    await queryInterface.sequelize.query('DROP VIEW IF EXISTS patient_admission_medicalhx_view');
  }
};
