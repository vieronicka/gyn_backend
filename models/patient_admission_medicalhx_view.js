// models/patient_admission_medicalhx_view.js
'use strict';

module.exports = (sequelize, DataTypes) => {
  const PatientAdmissionMedicalHxView = sequelize.define('PatientAdmissionMedicalHxView', {
    patient_id: { type: DataTypes.INTEGER, primaryKey: true },
    full_name: DataTypes.STRING,
    address: DataTypes.STRING,
    blood_group: DataTypes.STRING,
    date_of_birth: DataTypes.DATE,
    marital_status: DataTypes.STRING,
    national_id_card: DataTypes.STRING,
    patient_phone_no: DataTypes.STRING,
    admission_id: DataTypes.INTEGER,
    admission_date: DataTypes.DATE,
    bed_number: DataTypes.STRING,
    ward_number: DataTypes.STRING,
    consultant_name: DataTypes.STRING,
    admission_status: DataTypes.STRING,
    admission_count: DataTypes.INTEGER,
    medical_history_diagnosis: DataTypes.STRING,
    medical_allergy: DataTypes.STRING,
    past_medical_conditions: DataTypes.STRING,
    past_surgical_history: DataTypes.STRING,
    medical_history_diseases: DataTypes.STRING,
    medical_history_cancer: DataTypes.STRING,
    height: DataTypes.FLOAT,
    weight: DataTypes.FLOAT,
    menarche_age: DataTypes.INTEGER,
    menopausal_age: DataTypes.INTEGER,
    last_menstrual_period: DataTypes.DATE,
    menstrual_cycle_type: DataTypes.STRING
  }, {
    tableName: 'patient_admission_medicalhx_view',
    timestamps: false
  });

  return PatientAdmissionMedicalHxView;
};
