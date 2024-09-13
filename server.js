import express from 'express';
import mysql from 'mysql';
import cors from 'cors';
import cookieParser from "cookie-parser";
import session from "express-session";
import bcrypt from "bcryptjs";
import keys from './Config/keys.js';
import jwt from 'jsonwebtoken';

const app = express();

app.use(cors());

app.use(express.json());
app.use(express.urlencoded({ extended: true }));
const port = process.env.PORT || 8081;

app.use(cookieParser());

app.use(session({
    key: "userId",
    secret:'hellooooooo',
    resave: false,
    saveUninitialized: false,
    cookie: {
        maxAge: 1000 * 60 * 60 * 2
    }
}));

const db =mysql.createConnection({
    host:"localhost",
    user:"root",
    password:"",
    database:"gyn"
})

app.post('/reg', (req, res) => {
    // Insert data into the 'patient' table
    const patientSql = "INSERT INTO patient (`phn`,`full_name`,`address`,`nic`,`dob`,`marrital_status`,`phone_no`,`blood_gr`) VALUES (?)";
    const patientValues = [
        req.body.phn,
        req.body.fname,
        req.body.address,
        req.body.nic,
        req.body.dob,
        req.body.status,
        req.body.bloodgr,
        req.body.tp
    ];

    db.query(patientSql, [patientValues], (patientErr, patientResult) => {
        if (patientErr) {
            console.error("Error inserting data into 'patient' table:", patientErr);
            return res.status(500).json({ error: "Error inserting data into 'patient' table", details: patientErr });
        }

        // Insert data into the 'admission' table
        const admissionSql = "INSERT INTO admission (`date`,`phn`,`bht`,`ward_no`,`consultant`,`allergy`,`past_med`,`past_med_other`,`past_surg`,`past_surg_other`,`hx_diseases`,`hx_cancer`,`hx_cancer_other`,`diagnosis`,`height`,`weight`,`menarche_age`,`menopausal_age`,`lmp`,`menstrual_cycle`) VALUES (?)";
        const admissionValues = [
            req.body.date,
            req.body.phn,
            req.body.bht,
            req.body.ward,
            req.body.consultant,
            req.body.allergy,
            // req.body.past_obs,
            req.body.past_med.join(', '),
            req.body.past_med_other,
            req.body.past_surg.join(', '),
            req.body.past_surg_other,
            req.body.hx_diseases,
            req.body.hx_cancer.join(', '),
            req.body.hx_cancer_other,
            req.body.diagnosis, 
            req.body.height,
            req.body.weight,
            // req.body.past_hist,
            // req.body.complaint,
            req.body.menarche_age,
            req.body.menopausal_age,
            req.body.lmp,
            req.body.menstrual_cycle          
            // req.body.other
        ];

        db.query(admissionSql, [admissionValues], (admissionErr, admissionResult) => {
            if (admissionErr) {
                console.error("Error inserting data into 'admission' table:", admissionErr);
                return res.status(500).json({ error: "Error inserting data into 'admission' table", details: admissionErr });
            }

            return res.status(200).json({ patientResult, admissionResult });
        });
    });
});

app.post('/newReg', (req, res) => {
    // Insert data into the 'admission' table
    const admissionSql = "INSERT INTO admission (`date`,`phn`,`bht`,`ward_no`,`consultant`,`allergy`,`past_med`,`past_med_other`,`past_surg`,`past_surg_other`,`hx_diseases`,`hx_cancer`,`hx_cancer_other`,`diagnosis`,`height`,`weight`,`menarche_age`,`menopausal_age`,`lmp`,`menstrual_cycle`,`add_count`) VALUES (?)";
    const admissionValues = [
        req.body.date,
        req.body.phn,
        req.body.bht,
        req.body.ward,
        req.body.consultant,
        req.body.allergy,
        req.body.past_med.join(', '),
        req.body.past_med_other,
        req.body.past_surg.join(', '),
        req.body.past_surg_other,
        req.body.hx_diseases,
        req.body.hx_cancer.join(', '),
        req.body.hx_cancer_other,
        req.body.diagnosis, 
        req.body.height,
        req.body.weight,
        req.body.menarche_age,
        req.body.menopausal_age,
        req.body.lmp,
        req.body.menstrual_cycle,
        req.body.add_count
        // req.body.other
        // req.body.past_obs,
        // req.body.past_hist,
        // req.body.complaint,
    ];

    db.query(admissionSql, [admissionValues], (admissionErr, admissionResult) => {
        if (admissionErr) {
            console.error("Error inserting data into 'admission' table:", admissionErr);
            return res.status(500).json({ error: "Error inserting data into 'admission' table", details: admissionErr });
        }

        return res.status(200).json({admissionResult});
    });
});

app.get('/require_count/:id', (req, res) => {
    // SQL query to get the phn and add_count for a specific id, ordered by add_count ascending, and limit to 1 result
    const sql = "SELECT phn, add_count FROM admission WHERE phn = ? ORDER BY add_count DESC LIMIT 1";
    const id = req.params.id;
    db.query(sql, [id], (err, result) => {
        if (err) {
            // Log the error for debugging purposes
            console.error('Database query error:', err);
            res.status(500).send('Error retrieving data from database');
        } else {
            res.json(result);
        }
    });
});


app.post('/staff_reg', async (req, res) => {
    //const { full_name, phone_no, role, email, password, status } = req.body;
    const hashedPassword = await bcrypt.hash(password, 10);
    req.body.password = hashedPassword;
    const staffSql = "INSERT INTO staff (`full_name`,`phone_no`,`role`,`email`,`password`,`status`) VALUES (?)";
    const staffValues = [
        req.body.full_name,
        req.body.full_name,
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

app.post('/login',  (req, res) => {
    const { email, password } = req.body;
    const sql = "SELECT * FROM staff WHERE email = ?";
    db.query(sql, [email],  (err, results) => {
      if (err) {
        return res.status(500).send('Server error');
      }
      if (results.length === 0) {
        return res.status(400).send('User not found');
      }
  
      const user = results[0];
      const isMatch =  bcrypt.compareSync(password, user.password);
      if (!isMatch) {
        return res.status(400).send('Invalid credentials');
      }else{
        const payload = { id: user.id, full_name: user.full_name };
        jwt.sign(payload, keys.secretOrKey, { expiresIn: 3600 }, (err, token) => {
          res.json({
            success: true,
            token: 'Bearer ' + token,
          });
        });
    }  
    });
  });

  app.put('/staff_update/:id', async (req, res) => {
    const id = req.params.id;
    const { full_name, phone_no, role, email, password, status } = req.body; 
    const hashedPassword = await bcrypt.hash(password, 10);
    req.body.password = hashedPassword;
   
    
    const sql = 'UPDATE staff SET full_name = ?, phone_no = ?, role = ?, email = ?, password = ?, status = ? WHERE id = ?';
    db.query(sql, [full_name, phone_no, role, email, hashedPassword, status, id], (err, result) => {
      if (err) {
        console.error('Error updating row:', err);
        return res.status(500).send('Error updating row');
        }
        res.send('Row updated successfully');        
    });
  });

app.get('/details', (req, res) => {
    db.query('SELECT id, full_name, blood_gr,phn, phone_no, address, dob, marital_status, nic,  FROM patient', (err, results) => {
        if (err) {
            res.status(500).send('Error retrieving data from database');
        } else {
            res.json(results);
        }
    });
});

app.get('/data', (req, res) => {
    const limit = parseInt(req.query.limit) || 6;
    const page = parseInt(req.query.page) || 1;
    const offset = (page - 1) * limit;
    
    db.query('SELECT * FROM patient LIMIT ? OFFSET ?', [limit, offset], (err, results) => {
        if (err) {
            res.status(500).send('Error retrieving data from database');
        } else {
            res.json(results);
        }
    });
});

app.get('/admitdata', (req, res) => {
    const limit = req.query.limit || 8; // Default limit to 10 if not specified in the query string
    db.query('SELECT * FROM patient INNER JOIN admission ON patient.phn = admission.phn WHERE admission.status = "admit" LIMIT ?', [limit], (err, results) => {
        if (err) {
            res.status(500).send('Error retrieving data from database');
        } else {
            res.json(results);
        }
    });
});

app.get('/dischargedata', (req, res) => {
    const limit = req.query.limit || 8; // Default limit to 10 if not specified in the query string
    db.query('SELECT * FROM patient INNER JOIN admission ON patient.phn = admission.phn WHERE admission.status = "discharged" LIMIT ?', [limit], (err, results) => {
        if (err) {
            res.status(500).send('Error retrieving data from database');
        } else {
            res.json(results);
        }
    });
});

app.get('/view/:id',(req,res) =>{
    const sql ="SELECT * , FLOOR(DATEDIFF(CURRENT_DATE(), dob) / 365) AS age FROM  patient WHERE id = ?";
    const id=req.params.id;
    db.query(sql,[id],(err,result) =>{
        if (err) {
            res.status(500).send('Error retrieving data from database');
        } else {
            res.json(result);
        }
       
    })
})

app.get('/about/:id',(req,res) =>{
    const sql ="SELECT * , FLOOR(DATEDIFF(CURRENT_DATE(), dob) / 365) AS age FROM  patient WHERE id = ?";
    const id=req.params.id;
    db.query(sql,[id],(err,result) =>{
        if (err) {
            res.status(500).send('Error retrieving data from database');
        } else {
            res.json(result);
        }
       
    })
})

app.get('/patientda/:id',(req,res) =>{
    const sql ="SELECT * , FLOOR(DATEDIFF(CURRENT_DATE(), dob) / 365) AS age FROM  patient WHERE id = ?";
    const id=req.params.id;
    db.query(sql,[id],(err,result) =>{
        if (err) {
            res.status(500).send('Error retrieving data from database');
        } else {
            res.json(result);
        }
       
    })
})

app.get('/admisiondetail/:id',(req,res) =>{
    //const sql ="SELECT * , FLOOR(DATEDIFF(CURRENT_DATE(), dob) / 365) AS age FROM  patient WHERE id = ?";
    const sql ="select * from admission where phn = ?"
    const id =req.params.id;
    db.query(sql,[id],(err,result) =>{
        if (err) {
            res.status(500).send('Error retrieving data from database');
        } else {
            res.json(result);
        }
       
    })
})

app.put('/discharge/:phn', (req, res) => {
    const sql = 'UPDATE admission SET status = "discharged" WHERE phn = ?';
    const phn = req.params.phn;
    db.query(sql, [phn], (err, result) => {
        if (err) {
            res.status(500).send('Error discharging data from database');
        } else {
            res.json(result);
        }
    });
});

app.get('/data1', (req, res) => {
    const limit = req.query.limit || 20; // Default limit to 10 if not specified in the query string
    db.query('SELECT * FROM staff LIMIT ?', [limit], (err, results) => {
        if (err) {
            res.status(500).send('Error retrieving data from database');
        } else {
            res.json(results);
        }
    });
});

app.delete('/staff_information/:id', (req, res) => {
    const sql = 'DELETE FROM staff WHERE id = ?';
    const id =req.params.id;
    db.query(sql, [id], (err, result) => {
      if (err) {
        console.error('Error deleting row:', err);
        return res.status(500).send('Error deleting row');
      }
      res.send('Row deleted successfully');
    });
  });

  app.post('/searchdata', (req, res) => {
    const { val } = req.body;
    const limit = req.query.limit || 20; // Default limit to 20 if not specified in the query string
    let sqlQuery = 'SELECT * FROM patient WHERE ';
    let conditions = [];
    let params = [];

    // Check if the input is a number
    if (!isNaN(val)) {
        // If val is a number, search by phone number or NIC
        conditions.push('phn LIKE ? OR nic LIKE ?');
        params.push(`%${val}%`, `%${val}%`);
        console.log(params);
    } else {
        // If val is a string, search by name
        conditions.push('full_name LIKE ?');
        params.push(`%${val}%`);
        console.log(params);
    }

    if (conditions.length > 0) {
        sqlQuery += conditions.join(' AND ') + ' LIMIT ?';
        params.push(parseInt(limit)); // Adding limit to params
        //console.log('SQL Query:', sqlQuery);
        //console.log('Params:', params);
        db.query(sqlQuery, params, (err, results) => {
            if (err) {
                res.status(500).send('Error retrieving data from database');
            } else {
                res.json(results);
            }
        });
    } else {
        res.status(400).send('Invalid search input');
    }
});

app.get('/logout',(req,res)=>{
    //navigate('/');
    // req.session.user = null;
    // req.session.destroy();
    // return res.json("success")
})
app.listen(8081,() =>{
    console.log("Running...");
})
