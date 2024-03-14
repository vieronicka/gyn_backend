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
    console.log(req);
    // Insert data into the 'patient' table
    const patientSql = "INSERT INTO patient (`phn`,`full_name`,`address`,`nic`,`phone_no`,`dob`,`marrital_status`,`blood_gr`) VALUES (?)";
    const patientValues = [
        req.body.phn,
        req.body.fname,
        req.body.address,
        req.body.nic,
        req.body.tp,
        req.body.dob,
        req.body.status,
        req.body.bloodgr
    ];

    db.query(patientSql, [patientValues], (patientErr, patientResult) => {
        if (patientErr) {
            return res.json({ error: "Error inserting data into 'patient' table", details: patientErr });
        }

        // Insert data into the 'admission' table
        const admissionSql = "INSERT INTO admission (`date`,`phn`,`bht`,`ward_no`,`consultant`,`past_obs`,`past_med`,`past_surg`,`diagnosis`,`hist_cancer`,`allergy`,`complaints`,`other`) VALUES (?)";
        const admissionValues = [
            req.body.date,
            req.body.phn,
            req.body.bht,
            req.body.ward,
            req.body.consultant,
            req.body.past_obs,
            req.body.past_med,
            req.body.past_surg,
            req.body.diagnosis,
            req.body.past_hist,
            req.body.allergy,
            req.body.complaint,
            req.body.other
        ];

        db.query(admissionSql, [admissionValues], (admissionErr, admissionResult) => {
            if (admissionErr) {
                return res.json({ error: "Error inserting data into 'admission' table", details: admissionErr });
            }

            return res.json({ patientResult, admissionResult });
        });
    });
});

app.post('/staff_reg', (req, res) => {
    // Insert data into the 'patient' table
    const staffSql = "INSERT INTO staff (`full_name`,`phone_no`,`role`,`email`,`password`,`status`) VALUES (?)";
    const staffValues = [
        req.body.name,
        req.body.phone_no,
        req.body.role,
        req.body.email,
        req.body.password,
        req.body.status
    ];

    db.query(staffSql, [staffValues], (staffErr, staffResult) => {
        if (staffErr) {
            return res.json({ error: "Error inserting data into 'staff' table", details: staffErr });
        }

        return res.json({ staffResult });
    });
});

app.post('/login',(req,res) =>{
    const sql = "SELECT * from staff WHERE `email`=? AND `password` =?";
    db.query(sql,[req.body.email,req.body.password],(err,data)=>{
        //console.log(data);
        if(err){
            return res.json("Error");
        }
        if(data.length>0){
            return res.json("Success");
        }else{
            return res.json("Failed");
        }
    })
})

app.get('/details', (req, res) => {
    db.query('SELECT id, full_name, blood_gr,phn, phone_no, address, dob, marrital_status, nic,  FROM patient', (err, results) => {
        if (err) {
            res.status(500).send('Error retrieving data from database');
        } else {
            res.json(results);
        }
    });
});

app.get('/data', (req, res) => {
    const limit = req.query.limit || 20; // Default limit to 10 if not specified in the query string
    db.query('SELECT id, full_name, phn, phone_no FROM patient LIMIT ?', [limit], (err, results) => {
        if (err) {
            res.status(500).send('Error retrieving data from database');
        } else {
            res.json(results);
        }
    });
});

  
app.get('/logout',(req,res)=>{
    navigate('/');
    // req.session.user = null;
    // req.session.destroy();
    // return res.json("success")
})
app.listen(8081,() =>{
    console.log("Running...");
})
