const express = require('express');
const router = express.Router();
const exportController = require('../controllers/exportController');

// Export Data
router.post('/export-data', exportController.exportData);

// Export to Excel
router.post('/export-excel', exportController.exportExcel);

// Export to PDF
router.post('/export-pdf', exportController.exportPdf);

// Backup Database
router.get('/backup-database', exportController.backupDatabase);

// Last Backup
router.get('/last-backup', exportController.lastBackup);

module.exports = router;
