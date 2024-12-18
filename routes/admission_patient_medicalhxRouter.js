// const express = require('express');
// const router = express.Router();
// const admission_patient_medicalhxcontroller = require('../controllers/admission_patient_medicalhxController');

// // const admission_patient_medicalhxController = require('../controllers/admission_patient_medicalhxController');
// // const { register, newAdmission, getAdmissionCount, updatePatient, updateMedicalHistory, updateAdmission, getPatientDetails } = require('../controllers/admission_patient_medicalhxController');

// // Register a new patient
// router.post('/reg', admission_patient_medicalhxcontroller.register);

// router.get('/data',admission_patient_medicalhxcontroller.details);

// // Register a new admission
// router.post('/newReg', admission_patient_medicalhxcontroller.newAdmission);

// // Get admission count for a patient
// router.get('/require_count/:id', admission_patient_medicalhxcontroller.getAdmissionCount);

// // Update patient details
// router.put('/:id', admission_patient_medicalhxcontroller.updatePatient);

// // Update medical history
// router.put('/:phn/medHx', admission_patient_medicalhxcontroller.updateMedicalHistory);

// // Update admission
// router.put('/:phn/admission/:add_count', admission_patient_medicalhxcontroller.updateAdmission);

// // Get patient details
// router.get('/:id/details', admission_patient_medicalhxcontroller.getPatientDetails);

// module.exports = router;
const express = require('express');
const router = express.Router();
const controller = require('../controllers/admission_patient_medicalhxController');

// Routes for patient, medical history, and admission management

// Create or update patient, medical history, and admission
router.post('/reg', controller.register);

router.get('/data',controller.details);


// Get patient details
router.get('/patient/:id', controller.getPatientDetails);

// Get medical history by phn
router.get('/medicalhx/:phn', controller.getMedicalHistory);

// Get admission details by phn and add_count
router.get('/admission/:phn/:add_count', controller.getAdmissionDetails);

// Update patient details
router.put('/patientUpdate/:id', controller.updatePatient);

// Update medical history
router.put('/medicalUpdate/:phn', controller.updateMedicalHistory);

// Update admission status to discharged
router.put('/admissionUpdate/:phn/:add_count', controller.updateAdmissionStatus);

// Get all admissions for a patient
router.get('/admissions/:phn', controller.getAllAdmissionsForPatient);

router.get('/require_count/:id',controller.reqCount);

router.get('/consultants',controller.counsult);

router.get('/staffs',controller.getStaff);

// // Register a new admission
router.post('/newReg', controller.newAdmission);

router.get('/dynamicsearchdata',controller.searchData);

router.put('/discharge/:phn',controller.dischargePatient);

router.get('/admitdata',controller.admitDetail);

router.get('/dischargedata',controller.dischargeDetail);

module.exports = router;
