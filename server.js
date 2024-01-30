import express from 'express';
import mysql from 'mysql';
import cors from 'cors';

const app = express();
app.use(cors());
app.use(express.json());

const db =mysql.createConnection({
    host:"localhost",
    user:"root",
    password:"",
    database:"gyn"
})


app.post('/reg', (req, res) => {
    // Insert data into the 'patient' table
    const patientSql = "INSERT INTO patient (`phn`,`full_name`,`address`,`nic`,`phone_no`) VALUES (?)";
    const patientValues = [
        req.body.phn,
        req.body.fname,
        req.body.address,
        req.body.nic,
        req.body.tp
    ];

    db.query(patientSql, [patientValues], (patientErr, patientResult) => {
        if (patientErr) {
            return res.json({ error: "Error inserting data into 'patient' table", details: patientErr });
        }

        // Insert data into the 'admission' table
        const admissionSql = "INSERT INTO admission (`date`,`phn`,`bht`,`ward_no`,`consultant`,`past_obs`,`past_med`,`past_surg`,`hist_cancer`) VALUES (?)";
        const admissionValues = [
            req.body.date,
            req.body.phn,
            req.body.bht,
            req.body.ward,
            req.body.consultant,
            req.body.past_obs,
            req.body.past_med,
            req.body.past_surg,
            req.body.past_hist
        ];

        db.query(admissionSql, [admissionValues], (admissionErr, admissionResult) => {
            if (admissionErr) {
                return res.json({ error: "Error inserting data into 'admission' table", details: admissionErr });
            }

            return res.json({ patientResult, admissionResult });
        });
    });
});

app.listen(8081,() =>{
    console.log("Running...");
})