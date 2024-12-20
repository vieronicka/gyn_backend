const { PatientAdmissionTreatmentInvestigationView, BackupHistory,  PatientAdmissionMedicalHxView, TreatmentInvestigationView } = require('../models');
const excelJS = require('exceljs');
const pdf = require('pdfkit');
const fs = require('fs');
const path = require('path');
const { Op } = require('sequelize');
const {exec} = require('child_process')

// Export Data API
// const { Op } = require('sequelize');
// const PatientAdmissionTreatmentInvestigationView = require('../models/PatientAdmissionTreatmentInvestigationView');
// const PatientAdmissionMedicalhxView = require('../models/PatientAdmissionMedicalhxView');
// const TreatmentInvestigationView = require('../models/TreatmentInvestigationView');

exports.exportData = async (req, res) => {
    const { filterType, fromDate, toDate, patientNameOrPhn } = req.body;

    // Validate inputs
    if (!filterType || (filterType === 'all' && (!fromDate || !toDate)) || (filterType === 'single' && !patientNameOrPhn)) {
        return res.status(400).json({ error: 'Invalid filter inputs' });
    }

    try {
        let queryOptions = { where: {} };
        const params = {};

        // Handling each filterType explicitly without using OR conditions
        if (filterType === 'all') {
            // Fetch data for 'all' from all three views

            // Fetch from `patient_admission_treatment_investigation_view`
            queryOptions.where.admission_date = { [Op.between]: [fromDate, toDate] };

        } else if (filterType === 'admission') {
            // Fetch data for 'admission' from `patient_admission_medicalhx_view`
            queryOptions.where.admission_date = { [Op.between]: [fromDate, toDate] };

        } else if (filterType === 'visit') {
            // Fetch data for 'visit' from `treatment_investigation_view`
            queryOptions.where.treatment_date = { [Op.between]: [fromDate, toDate] };

        } else if (filterType === 'single') {
            // Fetch data for 'single' based on patient's name or phone number from `patient_admission_treatment_investigation_view`
            queryOptions.where = {
                full_name: { [Op.like]: `%${patientNameOrPhn}%` }
            };
        }

        let recordCount, results;

        if (filterType === 'all') {
            // Fetch data from all three views for the 'all' filter type
            // 1. Fetch from `PatientAdmissionTreatmentInvestigationView`
            const patientAdmissionCount = await PatientAdmissionTreatmentInvestigationView.count(queryOptions);
            const patientAdmissionData = await PatientAdmissionTreatmentInvestigationView.findAll(queryOptions);

            // // 2. Fetch from `PatientAdmissionMedicalhxView`
            // const medicalHxCount = await PatientAdmissionMedicalhxView.count(queryOptions);
            // const medicalHxData = await PatientAdmissionMedicalhxView.findAll(queryOptions);

            // // 3. Fetch from `TreatmentInvestigationView`
            // const treatmentCount = await TreatmentInvestigationView.count(queryOptions);
            // const treatmentData = await TreatmentInvestigationView.findAll(queryOptions);

            // Combine all the results into one data structure
            recordCount = patientAdmissionCount;
            results = patientAdmissionData;

        } else if (filterType === 'admission') {
            // If filterType is 'admission', only fetch data from `patient_admission_medicalhx_view`
            const countResult = await PatientAdmissionMedicalHxView.count(queryOptions);
            const resultData = await PatientAdmissionMedicalHxView.findAll(queryOptions);

            recordCount = countResult;
            results = resultData;

        } else if (filterType === 'visit') {
            // If filterType is 'visit', only fetch data from `treatment_investigation_view`
            const countResult = await TreatmentInvestigationView.count(queryOptions);
            const resultData = await TreatmentInvestigationView.findAll(queryOptions);

            recordCount = countResult;
            results = resultData;

        } else if (filterType === 'single') {
            // If filterType is 'single', fetch data from `patient_admission_treatment_investigation_view`
            const countResult = await PatientAdmissionTreatmentInvestigationView.count(queryOptions);
            const resultData = await PatientAdmissionTreatmentInvestigationView.findAll(queryOptions);

            recordCount = countResult;
            results = resultData;
        }
        // console.log('resultData', resultData)
        // Send the response with both count and data
        res.status(200).json({ count: recordCount, data: results });
    } catch (err) {
        // Handle any errors that occur during the process
        res.status(500).json({ error: err.message });
    }
};

// Export to Excel
exports.exportExcel = async (req, res) => {
    const { data } = req.body;

    if (!data || !data.length) {
        return res.status(400).json({ error: 'No data provided for export' });
    }

    const workbook = new excelJS.Workbook();
    const worksheet = workbook.addWorksheet('Patient Data');

    worksheet.columns = Object.keys(data[0]).map((key) => ({
        header: key.replace(/_/g, ' ').toUpperCase(),
        key,
        width: 20
    }));

    data.forEach((row) => worksheet.addRow(row));

    res.setHeader(
        'Content-Type',
        'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet'
    );
    res.setHeader(
        'Content-Disposition',
        'attachment; filename=PatientData.xlsx'
    );

    workbook.xlsx.write(res).then(() => res.end());
};

// Export to PDF
exports.exportPdf = async (req, res) => {
    const { data } = req.body;

    if (!data || !data.length) {
        return res.status(400).json({ error: 'No data provided for export' });
    }

    const doc = new pdf();
    const filePath = './PatientData.pdf';

    doc.pipe(fs.createWriteStream(filePath));
    doc.pipe(res);

    doc.image('./download.png', 50, 30, { width: 50 });
    doc.fontSize(20).font('Courier').fillColor('blue')
       .text('GYNECOLOGY DEPARTMENT\nJAFFNA TEACHING HOSPITAL', 100, 35, { align: 'center' });

    doc.moveTo(50, 100).lineTo(550, 100).stroke();
    doc.moveDown(2);
    doc.fontSize(16).text('Patient Data Report', { align: 'center', underline: true });
    doc.fillColor('black').moveDown(1);

    data.forEach((row, index) => {
        doc.fontSize(12).font('Courier-Bold').text(`Record ${index + 1}:`, { underline: true });
        Object.keys(row).forEach((key) => {
            doc.fontSize(10).font('Courier').moveDown(0.5).text(`${key.replace(/_/g, ' ')}: ${row[key]}`);
        });
        doc.moveDown(4);
    });

    doc.end();
    doc.on('finish', () => {
        fs.unlink(filePath, (err) => {
            if (err) console.error('Error deleting PDF file:', err);
        });
    });
};

// const path = require('path');
// const fs = require('fs');
// const { exec } = require('child_process');
// const { BackupHistory } = require('../models'); // Assuming you have a BackupHistory model

exports.backupDatabase = async (req, res) => {
    const dbHost = 'localhost';
    const dbUser = 'root';
    const dbPassword = ''; // If you don't have a password, leave it as an empty string
    const dbName = 'gyny';
    
    // Set the path for the backup folder
    const backupFolderPath = path.join('C:', 'Users', 'Staff', 'Desktop', 'backups');
    const backupFilePath = path.join(backupFolderPath, `backup-${Date.now()}.sql`);

    // Check if the backup folder exists, create it if not
    if (!fs.existsSync(backupFolderPath)) {
        try {
            fs.mkdirSync(backupFolderPath, { recursive: true }); // Ensure the backups directory exists
        } catch (err) {
            console.error("Error creating backup folder:", err);
            return res.status(500).json({ error: 'Failed to create backup folder' });
        }
    }

    // Create the mysqldump command for backing up the database
    const command = `"C:/xampp/mysql/bin/mysqldump.exe" -h ${dbHost} -u ${dbUser}  ${dbName} > ${backupFilePath}`;

    try {
        exec(command, (error, stdout, stderr) => {
            if (error) {
                console.error(`Error executing mysqldump: ${error.message}`);
                return res.status(500).json({ error: 'Failed to create database backup' });
            }
            if (stderr) {
                console.error(`stderr: ${stderr}`);
                return res.status(500).json({ error: 'Failed to create database backup' });
            }

            // Insert backup date to the backup_history table
            BackupHistory.create({ backup_date: new Date() });

            console.log('Backup file created at:', backupFilePath);

            // Send the file for download from the backups folder
            res.download(backupFilePath, `backup-${Date.now()}.sql`, (err) => {
                if (err) {
                    console.error('Error sending the file:', err);
                    return res.status(500).json({ error: 'Error sending the backup file' });
                }
                // No need to delete the file if you want to keep it in the backup folder
                // You can delete it if you no longer need the file on the server.
                // fs.unlink(backupFilePath, (unlinkErr) => {
                //     if (unlinkErr) {
                //         console.error('Error deleting backup file:', unlinkErr);
                //     }
                // });
            });
        });
    } catch (err) {
        console.log(err);
        res.status(500).json({ error: 'Failed to create backup' });
    }
};

// Last Backup Date API
exports.lastBackup = async (req, res) => {
    try {
        const lastBackup = await BackupHistory.findOne({
            order: [['backup_date', 'DESC']]
        });

        if (lastBackup) {
            res.status(200).json({ lastBackupDate: lastBackup.backup_date });
        } else {
            res.status(200).json({ lastBackupDate: 'No backups available' });
        }
    } catch (err) {
        res.status(500).json({ error: 'Failed to retrieve last backup date' });
    }
};
