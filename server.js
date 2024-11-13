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
    database:"gynecology"
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
        req.body.tp,
        req.body.bloodgr
        
    ];

    db.query(patientSql, [patientValues], (patientErr, patientResult) => {
        if (patientErr) {
            //console.error("Error inserting data into 'patient' table:", patientErr);
            
            // Check for unique constraint violation
            if (patientErr.code === 'ER_DUP_ENTRY') {
                // Error message for duplicate entry
                let errorMessage = '';

                if (patientErr.sqlMessage.includes('phn')) {
                    errorMessage = 'The PHN number is already registered.';
                } else if (patientErr.sqlMessage.includes('nic')) {
                    errorMessage = 'The NIC number is already registered.';
                } else {
                    errorMessage = 'A duplicate entry error occurred.';
                }

                return res.status(400).json({ error: errorMessage });
            }
            
            // Generic error message for other errors
            return res.status(500).json({ error: "Error inserting data into 'patient' table", details: patientErr });
        }

        const medicalSql= "INSERT into medical_hx (`phn`,`allergy`,`past_med`,`past_med_other`,`past_surg`,`past_surg_other`,`hx_diseases`,`hx_cancer`,`hx_cancer_other`,`diagnosis`,`height`,`weight`,`menarche_age`,`menopausal_age`,`lmp`,`menstrual_cycle`) VALUES (?)";
        const medicalValues = [
            req.body.phn,
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
            req.body.menstrual_cycle          
            // req.body.other
        ];

        db.query(medicalSql, [medicalValues], (medicalErr, medicalResult) => {
            if (medicalErr) {
                console.error("Error inserting data into 'patient' table:", medicalErr);
                return res.status(500).json({ error: "Error inserting data into 'medical_history' table", details: medicalErr });
            }

            // Insert data into the 'admission' table
            const admissionSql = "INSERT INTO admission (`date`,`phn`,`bht`,`ward_no`,`consultant`,`add_count`) VALUES (?)";
            const admissionValues = [
                req.body.date,
                req.body.phn,
                req.body.bht,
                req.body.ward,
                req.body.consultant,
                req.body.add_count
            ];

            db.query(admissionSql, [admissionValues], (admissionErr, admissionResult) => {
                if (admissionErr) {
                    console.error("Error inserting data into 'admission' table:", admissionErr);
                    return res.status(500).json({ error: "Error inserting data into 'admission' table", details: admissionErr });
                }
                return res.status(200).json({ patientResult, admissionResult, medicalResult});
            });
        });
    })
});

app.post('/newReg', (req, res) => {
    // Insert data into the 'admission' table
    const admissionSql = "INSERT INTO admission (`date`,`phn`,`bht`,`ward_no`,`consultant`,`add_count`) VALUES (?)";
    const admissionValues = [
        req.body.date,
        req.body.phn,
        req.body.bht,
        req.body.ward,
        req.body.consultant,
        req.body.add_count
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
    // const { full_name, phone_no, role, email, password, status } = req.body;
    const hashedPassword = await bcrypt.hash(req.body.password, 10);
    req.body.password = hashedPassword;
    const staffSql = "INSERT INTO staff (`full_name`,`phone_no`,`role`,`email`,`password`,`status`) VALUES (?)";
    const staffValues = [
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
    console.log(req.body);
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
        const payload = { id: user.id, full_name: user.full_name,  role: user.role};
        jwt.sign(payload, keys.secretOrKey, { expiresIn: 3600 }, (err, token) => {
          res.json({
            success: true,
            token: 'Bearer ' + token,
            role: user.role,
          });
        });
    }  
    });
  });

  app.put('/staff_update/:id', async (req, res) => {
    const id = req.params.id;
    const { full_name, phone_no, role, email, password, status } = req.body; 

    let sql, params;
    if (password) {
        // If a new password is provided, hash it
        const hashedPassword = await bcrypt.hash(password, 10);
        sql = 'UPDATE staff SET full_name = ?, phone_no = ?, role = ?, email = ?, password = ?, status = ? WHERE id = ?';
        params = [full_name, phone_no, role, email, hashedPassword, status, id];
    } else {
        // If no new password is provided, do not update the password field
        sql = 'UPDATE staff SET full_name = ?, phone_no = ?, role = ?, email = ?, status = ? WHERE id = ?';
        params = [full_name, phone_no, role, email, status, id];
    }

    db.query(sql, params, (err, result) => {
        if (err) {
            console.error('Error updating row:', err);
            return res.status(500).send('Error updating row');
        }
        res.send('Row updated successfully');
    });
});
  

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

app.get('/admisiondetail/:phn', (req, res) => {
    const phn = req.params.phn;

    const sql = `
        SELECT *
        FROM admission a
        INNER JOIN medical_hx m ON a.phn = m.phn
        WHERE a.phn = ?;
    `;

    db.query(sql, [phn], (err, results) => {
        if (err) {
            console.error("Error fetching data:", err);
            return res.status(500).json({ error: "Error fetching data from the database", details: err.message });
        }

        if (results.length === 0) {
            return res.status(404).json({ error: "No data found for the specified PHN" });
        }

        res.status(200).json(results); // Returns all matching records
    });
});

app.get('/admissiondetail/:phn/:add_count', (req, res) => {
    const phn = req.params.phn;
    const add_count = parseInt(req.params.add_count, 10);

    // console.log("before");

    const sql = `
        SELECT *
        FROM admission 
        WHERE phn = ? AND add_count=?;
    `;

    db.query(sql, [phn,add_count], (err, results) => {
        // console.log("after");
        if (err) {
            console.error("Error fetching data:", err);
            return res.status(500).json({ error: "Error fetching data from the database", details: err.message });
        }

        if (results.length === 0) {
            return res.status(404).json({ error: "No data found for the specified PHN" });
        }

        res.status(200).json(results); // Returns all matching records
    });
});

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
        // console.log('SQL Query:', sqlQuery);
        // console.log('Params:', params);
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

app.listen(8081,() =>{
    console.log("Running...");
})

app.post('/treat', (req, res) => {
    const treatSql = "INSERT INTO treatment (`date`,`visit_id`,`admission_id`,`visit_count`,`seen_by`,`complaints`,`abnormal_bleeding`,`complaint_other`,`exam_bpa`,`exam_bpb`,`exam_pulse`,`exam_abdominal`,`exam_gynaecology`,`manage_minor_eua`,`manage_minor_eb`,`manage_major`,`manage_medical`,`manage_surgical`) VALUES (?)";
    const treatValues = [
        req.body.date,
        // req.body.phn,
        req.body.visit_id,
        req.body.admission_id,
        req.body.visit_no,
        req.body.seenBy,
        req.body.complaints.join(', '),
        req.body.abnormalUlerine.join(', '),
        req.body.otherComplaint,
        req.body.bpa,
        req.body.bpb,
        req.body.pr,
        req.body.abdominalExam,
        req.body.gynaecologyExam,
        req.body.minorEua,
        req.body.minorEb,
        req.body.major.join(', '),
        req.body.medicalManage,
        req.body.surgicalManage,
        // req.body.diagnosis
    ];

    db.query(treatSql, [treatValues], (treatErr, treatResult) => {
        if (treatErr) {   
            console.log(treatSql);   
            console.log(treatValues);  
            console.error("Error inserting data into 'treatment' table:", treatErr);
            console.error("Error inserting data into 'investigation' table:", investErr);

            return res.status(500).json({ error: "Error inserting data into 'treatment' table", details: treatErr });
        }
            // Insert data into the 'admission' table
            const investigateSql = "INSERT INTO investigation (`visit_id`,`fbc_wbc`,`fbc_hb`,`fbc_pt`,`ufr_wc`,`ufr_rc`,`ufr_protein`,`se_k`,`se_na`,`crp`,`fbs`,`ppbs_ab`,`ppbs_al`,`ppbs_ad`,`lft_alt`,`lft_ast`,`invest_other`,`scan_mri`,`scan_ct`,`uss_tas`,`uss_tus`) VALUES (?)";
            const investValues = [
                req.body.visit_id,
                req.body.wbc,
                req.body.hb,
                req.body.plate,
                req.body.whiteCell,
                req.body.redCell,
                req.body.protein,
                req.body.seK,
                req.body.seNa,
                req.body.crp,
                req.body.fbs,
                req.body.ppbsAB,
                req.body.ppbsAL,
                req.body.ppbsAD,
                req.body.lftALT,
                req.body.lftAST,
                req.body.lftOther,
                req.body.mri,
                req.body.ct,
                req.body.tas,
                req.body.tus
            ];
            

            db.query(investigateSql, [investValues], (investErr, investResult) => {
                if (investErr) {
                    console.error("Error inserting data into 'investigation' table:", investErr);
                    return res.status(500).json({ 
                        error: "Error inserting data into 'treatment' table", 
                        details: treatErr.sqlMessage || treatErr.message 
                    });
                }
                return res.status(200).json({ treatResult, investResult});
            });
    })
});

app.get('/read/:id',(req,res) =>{
    const sql ="SELECT * FROM  patient WHERE id = ?";
    const id=req.params.id;
    db.query(sql,[id],(err,result) =>{
        if (err) {
            res.status(500).send('Error retrieving data from database');
        } else {
            res.json(result);
        }
       
    })
})

app.get('/readhx/:phn',(req,res) =>{
    const sql ="SELECT * FROM  medical_hx WHERE phn = ?";
    const phn=req.params.phn;
    db.query(sql,[phn],(err,result) =>{
        if (err) {
            res.status(500).send('Error retrieving data from database');
        } else {
            res.json(result);
        }
       
    })
})

app.put('/patientUpdate/:id', (req, res) => {
    const patientId = req.params.id;

    // Update SQL query
    const updateSql = "UPDATE patient SET  `phn` = ?, `full_name` = ?, `address` = ?, `nic` = ?, `dob` = ?, `marrital_status` = ?, `phone_no` = ?, `blood_gr` = ? WHERE `id` = ?";

    const updateValues = [
        req.body.phn,
        req.body.fname,
        req.body.address,
        req.body.nic,
        req.body.dob,
        req.body.status,
        req.body.tp,
        req.body.bloodgr,
        patientId
    ];

    db.query(updateSql, updateValues, (err, result) => {
        if (err) {
            console.error(err);
            res.status(500).send('Error updating patient information');
        } else {
            res.send('Patient information updated successfully');
        }
    });
});

app.put('/medicalUpdate/:phn', (req, res) => {
    const patientPhn = req.params.phn;

    // Prepare values from request body
    const {
        allergy,
        past_med = [],
        past_med_other,
        past_surg = [],
        past_surg_other,
        hx_diseases,
        hx_cancer = [],
        hx_cancer_other,
        diagnosis,
        height,
        weight,
        menarche_age,
        menopausal_age,
        lmp,
        menstrual_cycle
    } = req.body;

    // Join arrays with a check to avoid leading commas
    const formattedPastMed = past_med.filter(Boolean).join(', ');
    const formattedPastSurg = past_surg.filter(Boolean).join(', ');
    const formattedHxCancer = hx_cancer.filter(Boolean).join(', ');

    // Update SQL query
    const updateSql = "UPDATE medical_hx SET `allergy` = ?, `past_med` = ?, `past_med_other` = ?, `past_surg` = ?, `past_surg_other` = ?, `hx_diseases` = ?, `hx_cancer` = ?, `hx_cancer_other` = ?, `diagnosis` = ?, `height` = ?, `weight` = ?, `menarche_age` = ?, `menopausal_age` = ?, `lmp` = ?, `menstrual_cycle` = ? WHERE `phn` = ?";
    
    const updateValues = [
        allergy,
        formattedPastMed,
        past_med_other,
        formattedPastSurg,
        past_surg_other,
        hx_diseases,
        formattedHxCancer,
        hx_cancer_other,
        diagnosis, 
        height,
        weight,
        menarche_age,
        menopausal_age,
        lmp,
        menstrual_cycle,
        patientPhn
    ];

    db.query(updateSql, updateValues, (err, result) => {
        if (err) {
            console.error(err);
            res.status(500).send('Error updating patient history information');
        } else {
            res.send('Patient history information updated successfully');
        }
    });
});

app.put('/admissionUpdate/:phn/:add_count', (req, res) => {
    const patientPhn = req.params.phn;
    const add_count = req.params.add_count;

    const updateSql = "UPDATE admission SET  `date` = ?, `bht` = ?, `ward_no` = ?, `consultant` = ? WHERE `phn` = ? AND `add_count` = ?";

    const updateValues = [
        req.body.date,
        req.body.bht,
        req.body.ward,
        req.body.consultant,
        patientPhn,
        add_count
    ];

    db.query(updateSql, updateValues, (err, result) => {
        if (err) {
            console.error(err);
            res.status(500).send('Error updating admission information');
        } else {
            res.send('Admission information updated successfully');
        }
    });
});

app.get('/admissions/:phn', (req, res) => {
    const phn = req.params.phn;
    const sql = "SELECT * FROM admission WHERE phn = ?";
    
    db.query(sql, [phn], (err, results) => {
        if (err) {
            return res.status(500).json({ error: 'Error retrieving admissions' });
        }
        res.json(results); // Assuming results is an array of admissions
    });
});

app.get('/require_visit_count/:visit_un', (req, res) => {
    const visitUn = req.params.visit_un;
    const sql = "SELECT COUNT(*) AS visit_count FROM treatment WHERE visit_id LIKE ?";
    const visitPattern = `${visitUn}%`;

    db.query(sql, [visitPattern], (err, result) => {
        if (err) {
            console.error("Error fetching visit count:", err);
            return res.status(500).json({ error: "Error fetching visit count", details: err });
        }
        // Access the count from the result
        const visitCount = result[0].visit_count;
        return res.status(200).json({ visit_count: visitCount });
    });
});

app.get('/visits/:visit_un', (req, res) => {
    const visitUn = req.params.visit_un;
    const sql = "SELECT * FROM treatment WHERE visit_id LIKE ?";
    const visitPattern = `${visitUn}%`;
    
    db.query(sql, [visitPattern], (err, results) => {
        if (err) {
            return res.status(500).json({ error: 'Error retrieving admissions' });
        }
        res.json(results); // Assuming results is an array of admissions
    });
});

app.get('/visitdetail/:visit_unique', (req, res) => {
    const visit_unique = parseInt(req.params.visit_unique, 10);

    // console.log("before");

    const sql = `
        SELECT *
        FROM treatment
        JOIN investigation ON treatment.visit_id = investigation.visit_id
        WHERE treatment.visit_id = ?;
    `;

    db.query(sql, [visit_unique], (err, results) => {
        // console.log("after");
        if (err) {
            console.error("Error fetching data:", err);
            return res.status(500).json({ error: "Error fetching data from the database", details: err.message });
        }

        if (results.length === 0) {
            return res.status(404).json({ error: "No data found for the specified PHN" });
        }

        res.status(200).json(results); // Returns all matching records
    });
});

// app.put('/visitUpdate/:visit_unique', (req, res) => {
//     const visit_unique = parseInt(req.params.visit_unique, 10);

//     const updateTreatSql = "UPDATE treatment `date` = ?,`visit_id` = ?,`admission_id` = ?,`visit_count` = ?,`seen_by` = ?,`complaints` = ?,`abnormal_bleeding` = ?,`complaint_other` = ?,`exam_bpa` = ?,`exam_bpb` = ?,`exam_pulse` = ?,`exam_abdominal` = ?,`exam_gynaecology` = ?,`manage_minor_eua` = ?,`manage_minor_eb` = ?,`manage_major` = ?,`manage_medical` = ?,`manage_surgical` = ?";
//     const updateTreatValues = [
//         req.body.date,
//         // req.body.phn,
//         req.body.visit_id,
//         req.body.admission_id,
//         req.body.visit_no,
//         req.body.seenBy,
//         req.body.complaints.join(', '),
//         req.body.abnormalUlerine.join(', '),
//         req.body.otherComplaint,
//         req.body.bpa,
//         req.body.bpb,
//         req.body.pr,
//         req.body.abdominalExam,
//         req.body.gynaecologyExam,
//         req.body.minorEua,
//         req.body.minorEb,
//         req.body.major.join(', '),
//         req.body.medicalManage,
//         req.body.surgicalManage,
//         visit_unique
//     ]

//     const updateInvestigateSql = "UPDATE investigation `visit_id` = ?, `fbc_wbc` = ?, `fbc_hb` = ?, `fbc_pt` = ?, `ufr_wc` = ?, `ufr_rc` = ?, `ufr_protein` = ?, `se_k` = ?, `se_na` = ?, `crp` = ?, `fbs` = ?, `ppbs_ab` = ?, `ppbs_al` = ?, `ppbs_ad` = ?, `lft_alt` = ?, `lft_ast` = ?, `invest_other` = ?, `scan_mri` = ?, `scan_ct` = ?, `uss_tas` = ?, `uss_tus` = ?";
//     const updateInvestValues = [
//         req.body.visit_id,
//         req.body.wbc,
//         req.body.hb,
//         req.body.plate,
//         req.body.whiteCell,
//         req.body.redCell,
//         req.body.protein,
//         req.body.seK,
//         req.body.seNa,
//         req.body.crp,
//         req.body.fbs,
//         req.body.ppbsAB,
//         req.body.ppbsAL,
//         req.body.ppbsAD,
//         req.body.lftALT,
//         req.body.lftAST,
//         req.body.lftOther,
//         req.body.mri,
//         req.body.ct,
//         req.body.tas,
//         req.body.tus
//     ];

//     db.query(updateTreatSql, updateTreatValues, (err, result) => {
//         if (err) {
//             console.error(err);
//             res.status(500).send('Error updating visit information');
//         } else {
//             res.send('visit information updated successfully');
//         }
//     });
// });




















app.put('/visitUpdate/:visit_unique', (req, res) => {
    const visit_unique = (req.params.visit_unique);
    // const visit_id = req.body.visit_id; // Ensure visit_id is provided
console.log(visit_unique);
    // if (!visit_id) {
    //     return res.status(400).json({ error: "visit_id is required." });
    // }

    const updateTreatSql = `UPDATE treatment SET 
        \`date\` = ?, 
        \`visit_id\` = ?, 
        \`admission_id\` = ?, 
        \`visit_count\` = ?, 
        \`seen_by\` = ?, 
        \`complaints\` = ?, 
        \`abnormal_bleeding\` = ?, 
        \`complaint_other\` = ?, 
        \`exam_bpa\` = ?, 
        \`exam_bpb\` = ?, 
        \`exam_pulse\` = ?, 
        \`exam_abdominal\` = ?, 
        \`exam_gynaecology\` = ?, 
        \`manage_minor_eua\` = ?, 
        \`manage_minor_eb\` = ?, 
        \`manage_major\` = ?, 
        \`manage_medical\` = ?, 
        \`manage_surgical\` = ? 
        WHERE \`visit_id\` = ?`;

    const updateTreatValues = [
        req.body.date,
        req.body.visit_id,
        req.body.admission_id,
        req.body.visit_no,
        req.body.seenBy,
        req.body.complaints.join(', '),
        req.body.abnormalUlerine.join(', '),
        req.body.otherComplaint,
        req.body.bpa,
        req.body.bpb,
        req.body.pr,
        req.body.abdominalExam,
        req.body.gynaecologyExam,
        req.body.minorEua,
        req.body.minorEb,
        req.body.major.join(', '),
        req.body.medicalManage,
        req.body.surgicalManage,
        visit_unique
    ];

    const updateInvestigateSql = `UPDATE investigation SET 
        \`visit_id\` = ?, 
        \`fbc_wbc\` = ?, 
        \`fbc_hb\` = ?, 
        \`fbc_pt\` = ?, 
        \`ufr_wc\` = ?, 
        \`ufr_rc\` = ?, 
        \`ufr_protein\` = ?, 
        \`se_k\` = ?, 
        \`se_na\` = ?, 
        \`crp\` = ?, 
        \`fbs\` = ?, 
        \`ppbs_ab\` = ?, 
        \`ppbs_al\` = ?, 
        \`ppbs_ad\` = ?, 
        \`lft_alt\` = ?, 
        \`lft_ast\` = ?, 
        \`invest_other\` = ?, 
        \`scan_mri\` = ?, 
        \`scan_ct\` = ?, 
        \`uss_tas\` = ?, 
        \`uss_tus\` = ? 
        WHERE \`visit_id\` = ?`;

    const updateInvestValues = [
        req.body.visit_id,
        req.body.wbc,
        req.body.hb,
        req.body.plate,
        req.body.whiteCell,
        req.body.redCell,
        req.body.protein,
        req.body.seK,
        req.body.seNa,
        req.body.crp,
        req.body.fbs,
        req.body.ppbsAB,
        req.body.ppbsAL,
        req.body.ppbsAD,
        req.body.lftALT,
        req.body.lftAST,
        req.body.lftOther,
        req.body.mri,
        req.body.ct,
        req.body.tas,
        req.body.tus,
        visit_unique
    ];

    db.beginTransaction((err) => {
        if (err) {
            console.error("Transaction initialization failed:", err);
            res.status(500).send('Transaction initialization failed');
            return;
        }

        db.query(updateTreatSql, updateTreatValues, (err, result) => {
            if (err) {
                return db.rollback(() => {
                    console.error("Error updating treatment information:", err);
                    res.status(500).send('Error updating treatment information');
                });
            }

            db.query(updateInvestigateSql, updateInvestValues, (err, result) => {
                if (err) {
                    return db.rollback(() => {
                        console.error("Error updating investigation information:", err);
                        res.status(500).send('Error updating investigation information');
                    });
                }

                db.commit((err) => {
                    if (err) {
                        return db.rollback(() => {
                            console.error("Transaction commit failed:", err);
                            res.status(500).send('Transaction commit failed');
                        });
                    }
                    res.send('Visit information updated successfully');
                });
            });
        });
    });
});
