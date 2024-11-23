const mysql = require('mysql2');
const ExcelJS = require('exceljs');

// Create a MySQL connection
const connection = mysql.createConnection({
  host: 'localhost',
  user: 'root',
  password: '',
  database: 'gynecology'
});

connection.connect(err => {
  if (err) throw err;
  console.log('Connected to the database.');
});

// Query the database and create an Excel file
connection.query('SELECT * FROM patient', (err, results) => {
  if (err) {
    console.error('Error fetching data:', err);
    connection.end();
    return;
  }

  // Create a new workbook and worksheet
  const workbook = new ExcelJS.Workbook();
  const worksheet = workbook.addWorksheet('Patient Data');

  // Add column headers based on table structure
  worksheet.columns = [
    { header: 'ID', key: 'id', width: 10 },
    { header: 'PHN', key: 'phn', width: 15 },
    { header: 'Full Name', key: 'full_name', width: 30 },
    { header: 'Address', key: 'address', width: 25 },
    { header: 'Blood Group', key: 'blood_gr', width: 10 },
    { header: 'Date of Birth', key: 'dob', width: 15 },
    { header: 'Marital Status', key: 'marrital_status', width: 15 },
    { header: 'NIC', key: 'nic', width: 15 },
    { header: 'Phone No', key: 'phone_no', width: 20 }
  ];

  // Add rows to the worksheet
  results.forEach(row => {
    worksheet.addRow(row);
  });

  // Save the workbook to a file
  workbook.xlsx.writeFile('PatientData.xlsx')
    .then(() => {
      console.log('Excel file created successfully!');
      connection.end();
    })
    .catch(err => {
      console.error('Error writing to Excel file:', err);
      connection.end();
    });
});
