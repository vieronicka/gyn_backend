const express = require('express');
const router = express.Router();
const treatmentController = require('../controllers/treatment_investigationController'); 
// Route to create treatment and investigation
router.post('/treat', treatmentController.createTreatmentAndInvestigation);

// Route to get treatment records by visit ID
router.get('/visits/:visit_un', treatmentController.getTreatmentByVisit);

// Route to get treatment and investigation details by visit ID
router.get('/visitdetail/:visit_unique', treatmentController.getTreatmentAndInvestigationDetail);

// Route to update treatment and investigation records by visit ID
router.put('/visitUpdate/:visit_unique', treatmentController.updateTreatmentAndInvestigation);

router.get('/require_visit_count/:visit_un',treatmentController.reqCount);

module.exports = router;
