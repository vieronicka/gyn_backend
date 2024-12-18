// routes/statsRouter.js
const express = require('express');
const router = express.Router();
const statsController = require('../controllers/analysiscontroller');

// Stats Routes
router.get('/stats', statsController.getStats);
router.get('/admission-stats', statsController.getAdmissionStats);
router.get('/history-stats', statsController.getHistoryStats);
router.get('/report-analysis', statsController.getReportAnalysis);
router.get('/scan-data', statsController.getScanData);
router.get('/complaints-stats',statsController.getComplaintStats);

module.exports = router;
