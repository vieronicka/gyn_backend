// migrations/YYYYMMDDHHMMSS-create_treatment_investigation_view.js
'use strict';

module.exports = {
  up: async (queryInterface, Sequelize) => {
    await queryInterface.sequelize.query('DROP VIEW IF EXISTS treatment_investigation_view');
    await queryInterface.sequelize.query(`
      CREATE VIEW treatment_investigation_view AS 
      SELECT 
        t.date AS treatment_date,
        t.visit_id AS treatment_visit_id,
        t.seen_by AS doctor_seen_by,
        t.complaints AS treatment_complaints,
        t.abnormal_bleeding AS abnormal_bleeding_symptoms,
        CONCAT(t.exam_bpa, '/', t.exam_bpb) AS blood_pressure,
        t.exam_pulse AS pulse_rate,
        t.exam_abdominal AS abdominal_exam,
        t.exam_gynaecology AS gynaecological_exam,
        t.manage_minor_eua AS minor_examination,
        t.manage_minor_eb AS minor_examination_findings,
        t.manage_major AS major_surgical_interventions,
        t.manage_medical AS medical_management,
        t.manage_surgical AS surgical_management,
        i.fbc_wbc AS investigation_fbc_wbc,
        i.fbc_hb AS investigation_fbc_hb,
        i.fbc_pt AS investigation_fbc_pt,
        i.ufr_wc AS investigation_ufr_wc,
        i.ufr_rc AS investigation_ufr_rc,
        i.ufr_protein AS investigation_ufr_protein,
        i.se_k AS investigation_se_k,
        i.se_na AS investigation_se_na,
        i.crp AS investigation_crp,
        i.fbs AS investigation_fbs,
        i.ppbs_ab AS investigation_ppbs_ab,
        i.ppbs_al AS investigation_ppbs_al,
        i.ppbs_ad AS investigation_ppbs_ad,
        i.lft_alt AS investigation_lft_alt,
        i.lft_ast AS investigation_lft_ast,
        i.invest_other AS investigation_other,
        i.scan_mri AS investigation_scan_mri,
        i.scan_ct AS investigation_scan_ct,
        i.uss_tas AS investigation_uss_tas,
        i.uss_tus AS investigation_uss_tus
      FROM treatment t
      JOIN investigation i ON t.visit_id = i.visit_id;
    `);
  },

  down: async (queryInterface, Sequelize) => {
    await queryInterface.sequelize.query('DROP VIEW IF EXISTS treatment_investigation_view');
  }
};
