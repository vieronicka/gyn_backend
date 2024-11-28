import express from 'express';
import mysql from 'mysql';
import cors from 'cors';
import cookieParser from "cookie-parser";
import session from "express-session";
import bcrypt from "bcryptjs";
import keys from './Config/keys.js';
import jwt from 'jsonwebtoken';
import nodemailer from 'nodemailer';
import excelJS from 'exceljs';
import pdf from 'pdfkit';
import fs from 'fs';
import path from 'path';
import dotenv from 'dotenv';
import { GoogleGenerativeAI } from '@google/generative-ai';

dotenv.config();
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
    database:"gyntest"
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
    // console.log(req.body);
    db.query(sql, [email],  (err, results) => {
        console.log(results.length)
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
            userId: user.id
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

app.get('/staff/:userId', (req, res) => {
    const userId = req.params.userId;
  
    const sql = "SELECT id, full_name, phone_no, role, email, status FROM staff WHERE id = ?";
    db.query(sql, [userId], (err, results) => {
      if (err) {
        console.error("Database query error:", err);
        return res.status(500).json({ error: "Server error" });
      }
      if (results.length === 0) {
        return res.status(404).json({ error: "User not found" });
      }
  
      const user = results[0];
      res.status(200).json(user); // Return user data as JSON
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
    const limit = parseInt(req.query.limit) || 8;
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
    const limit = parseInt(req.query.limit) || 8; // Default limit to 8 if not specified
    const page = parseInt(req.query.page) || 1; // Default to page 1 if not specified
    const offset = (page - 1) * limit; // Calculate offset

    db.query(
        'SELECT * FROM patient WHERE admit_status = "admitted" LIMIT ? OFFSET ?',
        [limit, offset],
        (err, results) => {
            if (err) {
                console.error('Error retrieving admitted data:', err);
                res.status(500).send('Error retrieving admitted data from database');
            } else {
                res.json(results);
            }
        }
    );
});

app.get('/dischargedata', (req, res) => {
    const limit = parseInt(req.query.limit) || 8; // Default limit to 8 if not specified
    const page = parseInt(req.query.page) || 1; // Default to page 1 if not specified
    const offset = (page - 1) * limit; // Calculate offset

    db.query(
        'SELECT * FROM patient WHERE admit_status = "discharged" LIMIT ? OFFSET ?',
        [limit, offset],
        (err, results) => {
            if (err) {
                console.error('Error retrieving discharged data:', err);
                res.status(500).send('Error retrieving discharged data from database');
            } else {
                res.json(results);
            }
        }
    );
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
    const sql = 'UPDATE patient SET admit_status = "discharged" WHERE phn = ?';
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
    const limit = parseInt(req.query.limit) || 8;
    const page = parseInt(req.query.page) || 1;
    const offset = (page - 1) * limit;
    db.query('SELECT * FROM staff LIMIT ? OFFSET ?', [limit, offset], (err, results) => {
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


//   app.post('/searchdata', (req, res) => {
//     const { val } = req.body;
//     const limit = parseInt(req.query.limit) || 8; // Default limit to 8 if not specified
//     const page = parseInt(req.query.page) || 1; // Default to page 1 if not specified
//     const offset = (page - 1) * limit; // Calculate offset    let sqlQuery = 'SELECT * FROM patient WHERE ';
//     let conditions = [];
//     let params = [];

//     // Check if the input is a number
//     if (!isNaN(val)) {
//         // If val is a number, search by phone number or NIC
//         conditions.push('phn LIKE ? OR nic LIKE ?');
//         params.push(`%${val}%`, `%${val}%`);
//         console.log(params);
//     } else {
//         // If val is a string, search by name
//         conditions.push('full_name LIKE ?');
//         params.push(`%${val}%`);
//         console.log(params);
//     }

//     if (conditions.length > 0) {
//         sqlQuery += conditions.join(' AND ') + ' LIMIT ? OFFSET ?',
//         [limit, offset],
//         // params.push(parseInt(limit)); // Adding limit to params
//         // console.log('SQL Query:', sqlQuery);
//         // console.log('Params:', params);
//         db.query(sqlQuery, params, (err, results) => {
//             if (err) {
//                 res.status(500).send('Error retrieving data from database');
//             } else {
//                 res.json(results);
//             }
//         });
//     } else {
//         res.status(400).send('Invalid search input');
//     }
// });

app.get('/searchdata', (req, res) => {

    const { val } = req.query; // Extract the search value from the request body
    console.log('Search value:', val);
    const limit = parseInt(req.query.limit) || 8; // Default limit to 8 if not provided
    const page = parseInt(req.query.page) || 1;  // Default page to 1 if not provided
    const offset = (page - 1) * limit; // Calculate offset for pagination

    let sqlQuery = 'SELECT * FROM patient WHERE ';
    let conditions = [];
    let params = [];

    // Check if the input is a number
    if (!isNaN(val)) {
        // Search by phone number or NIC if the input is numeric
        conditions.push('(phn LIKE ? OR nic LIKE ?)');
        params.push(`%${val}%`, `%${val}%`);
    } else {
        // Search by full name if the input is a string
        conditions.push('full_name LIKE ?');
        params.push(`%${val}%`);
    }

    // If there are search conditions, complete the query
    if (conditions.length > 0) {
        sqlQuery += conditions.join(' AND '); // Combine conditions with AND
        sqlQuery += ' LIMIT ? OFFSET ?'; // Add pagination

        // Add limit and offset to the parameters array
        params.push(limit, offset);

        console.log('SQL Query:', sqlQuery);
        console.log('Params:', params);

        // Execute the query
        db.query(sqlQuery, params, (err, results) => {
            if (err) {
                console.error('Error retrieving data from database:', err);
                res.status(500).send('Error retrieving data from database');
            } else {
                res.json(results); // Send the query results as the response
            }
        });
    } else {
        // If no valid input is provided, return a 400 Bad Request
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
            const investigateSql = "INSERT INTO investigation (`visit_id`,`fbc_wbc`,`fbc_hb`,`fbc_pt`,`ufr_wc`,`ufr_rc`,`ufr_protein`,`se_k`,`se_na`,`crp`,`fbs`,`ppbs_ab`,`ppbs_al`,`ppbs_ad`,`lft_alt`,`lft_ast`,`invest_other`,`scan_types`,`scan_mri`,`scan_ct`,`uss_tas`,`uss_tus`) VALUES (?)";
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
                req.body.scan_types.join(', '),
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

app.get('/stats', (req, res) => {
    const dischargedSql = "SELECT COUNT(*) AS discharged_count FROM patient WHERE admit_status = 'discharged'";
    const admittedSql = "SELECT COUNT(*) AS admitted_count FROM patient WHERE admit_status = 'admitted'";
    const total_patientsSql = "SELECT COUNT(*) AS total_patients FROM patient";
    const admissionSql = "SELECT COUNT(*) AS admission_count FROM admission WHERE DATE(date) >= CURDATE() - INTERVAL 30 DAY";

    // Query to get discharged count
    db.query(dischargedSql, (err, dischargedResults) => {
        if (err) {
            return res.status(500).json({ error: 'Error retrieving discharged count' });
        }

        // Query to get admitted count (active patients)
        db.query(admittedSql, (err, admittedResults) => {
            if (err) {
                return res.status(500).json({ error: 'Error retrieving admitted count' });
            }

            db.query(total_patientsSql,(err,patientResults)=>{
                if(err){
                    return res.status(500).json({error:"Error retriveing Total patients_count"});
               }
               
               db.query(admissionSql, (err, admissionResults) => {
                if (err) {
                    return res.status(500).json({ error: 'Error retrieving admission count' });
                }
                        const discharged_count = dischargedResults[0].discharged_count;
                        const admitted_count = admittedResults[0].admitted_count;
                        const total_patients = patientResults[0].total_patients;
                        const admissionCount = admissionResults[0].admission_count;
                        
                        const admissionRate = ((admissionCount / total_patients) * 100).toFixed(2);

                        const stats = {
                            total_patients: total_patients, 
                            active_patients: admitted_count, 
                            discharged_patients: discharged_count, 
                            admission_rate: `${admissionRate}%`
                        };
                        res.json(stats);
                    });
                });
            });
        });
    });

    app.get('/admission-stats', (req, res) => {
        const { view, year, month } = req.query;
    
        let sql;
        if (view === 'year') {
            sql = "SELECT YEAR(date) AS name, SUM(add_count) AS patientCount FROM admission GROUP BY YEAR(date)";
        } else if (view === 'month' && year) {
            sql = `SELECT MONTHNAME(date) AS name, SUM(add_count) AS patientCount 
                   FROM admission 
                   WHERE YEAR(date) = ? 
                   GROUP BY MONTH(date)`;
        } else if (view === 'day' && year && month) {
            sql = `SELECT DAY(date) AS name, SUM(add_count) AS patientCount 
                   FROM admission 
                   WHERE YEAR(date) = ? AND MONTH(date) = ? 
                   GROUP BY DAY(date)`;
        } else {
            return res.status(400).json({ error: 'Invalid parameters' });
        }
    
        const params = [year, month].filter((p) => p); // Filter undefined parameters
        db.query(sql, params, (err, results) => {
            if (err) {
                return res.status(500).json({ error: 'Error retrieving admission stats' });
            }
            res.json(results);
        });
    });
    

    const OTP_EXPIRATION = 300000; // 5 minutes in milliseconds
    const transporter = nodemailer.createTransport({
      service: 'Gmail', // or your email provider
      auth: {
        user: 'gyntngv@gmail.com', // replace with your email
        pass: 'dbqu luio zpho ktrb' // replace with your email password
      }
    });

    app.post('/forgotpassword', (req, res) => {
        const { email } = req.body; // Make sure email is being received correctly from the request
    
        if (!email) {
            return res.status(400).json({ message: 'Email is required' });
        }
    
        const otp = Math.floor(100000 + Math.random() * 900000); // Generate a 6-digit OTP
        const expiresAt = Math.floor(Date.now() / 1000) + Math.floor(OTP_EXPIRATION / 1000);
    
        const query = "UPDATE staff SET otp = ?, otp_expires = FROM_UNIXTIME(?) WHERE email = ?";
        db.query(query, [otp, expiresAt, email], (err, result) => {
            if (err) {
                return res.status(500).json({ message: 'Server error' });
            }
            if (result.affectedRows === 0) {
                return res.status(404).json({ message: 'Email not found' });
            }
            const mailOptions = {
                from: 'gyntngv@gmail.com',
                to: email, // Email is now defined in this scope
                subject: 'Your OTP Code',
                text: `Your OTP code is ${otp}`
            };
            
            transporter.sendMail(mailOptions, (error, info) => {
                if (error) {
                    return res.status(500).json({ message: 'Error sending email' });
                }
                
                // Log `info` only if there’s no error
                res.status(200).json({ message: 'OTP sent successfully' });
            });
            
        });
        console.log(otp);
        console.log(email);
        // console.log(error);


    });
    
    app.get('/complaints-stats', (req, res) => {
        const sql = "SELECT complaints FROM treatment";
    
        db.query(sql, (err, results) => {
            if (err) {
                return res.status(500).json({ error: 'Error retrieving complaints data' });
            }
    
            // Complaint categories
            const complaintCategories = [
                "Vaginal Bleeding",
                "Dribbiling",
                "Subtertility",
                "Vaginal Discharge",
                "Abdominal Pain",
                "Back Pain",
                "Urinary Incontenur",
                "Blood Sugar Series"
            ];
    
            // Initialize counts
            const complaintCounts = complaintCategories.reduce((acc, category) => {
                acc[category] = 0;
                return acc;
            }, {});
    
            // Process complaints data
            results.forEach(row => {
                const complaints = row.complaints.split(',').map(c => c.trim());
                complaints.forEach(complaint => {
                    if (complaintCounts.hasOwnProperty(complaint)) {
                        complaintCounts[complaint]++;
                    }
                });
            });
    
            // Format data for frontend
            const formattedData = Object.keys(complaintCounts).map(category => ({
                name: category,
                value: complaintCounts[category],
            }));
    
            res.json(formattedData);
        });
    });

    app.get('/history-stats', (req, res) => {
        const sql = "SELECT past_med FROM medical_hx";
    
        db.query(sql, (err, results) => {
            if (err) {
                return res.status(500).json({ error: 'Error retrieving complaints data' });
            }
    
            // Complaint categories
            const complaintCategories = [
                "Diabetics mellitus",
                "Hypertension","Hypothyroidism",
                "Bronchial asthma","Epilepsy",
                "Valvular heart diseases",
                "Ishemic heart diseases",
                "Renal diseases",
                "Arthritis",
                "Hypercholesterolemia"
            ];
    
            // Initialize counts
            const complaintCounts = complaintCategories.reduce((acc, category) => {
                acc[category] = 0;
                return acc;
            }, {});
    
            // Process complaints data
            results.forEach(row => {
                const complaints = row.past_med.split(',').map(c => c.trim());
                complaints.forEach(complaint => {
                    if (complaintCounts.hasOwnProperty(complaint)) {
                        complaintCounts[complaint]++;
                    }
                });
            });
    
            // Format data for frontend
            const formattedData = Object.keys(complaintCounts).map(category => ({
                name: category,
                value: complaintCounts[category],
            }));
    
            res.json(formattedData);
        });
    });

    
   // API endpoint to fetch report analysis
app.get("/report-analysis", (req, res) => {
    const { type } = req.query;
  
    if (!type) {
      return res.status(400).json({ error: "Report type is required" });
    }
  
    const query = "SELECT * FROM investigation";
  
    db.query(query, (err, results) => {
      if (err) {
        return res.status(500).json({ error: "Error fetching data" });
      }
  
      const response = {};
  
      if (type === "blood") {
        const bloodCounts = {
          hemoglobin: { Low: 0, Normal: 0, High: 0 },
          platelets: { Low: 0, Normal: 0, High: 0 },
          whiteCells: { Low: 0, Normal: 0, High: 0 },
        };
  
        results.forEach((row) => {
          // Hemoglobin
          if (row.fbc_hb < 12) bloodCounts.hemoglobin.Low++;
          else if (row.fbc_hb <= 16) bloodCounts.hemoglobin.Normal++;
          else bloodCounts.hemoglobin.High++;
  
          // Platelets
          if (row.fbc_pt < 150) bloodCounts.platelets.Low++;
          else if (row.fbc_pt <= 450) bloodCounts.platelets.Normal++;
          else bloodCounts.platelets.High++;
  
          // White Cells
          if (row.fbc_wbc < 4) bloodCounts.whiteCells.Low++;
          else if (row.fbc_wbc <= 11) bloodCounts.whiteCells.Normal++;
          else bloodCounts.whiteCells.High++;
        });
  
        response.blood = {
          hemoglobin: Object.keys(bloodCounts.hemoglobin).map((key) => ({
            name: key,
            value: bloodCounts.hemoglobin[key],
          })),
          platelets: Object.keys(bloodCounts.platelets).map((key) => ({
            name: key,
            value: bloodCounts.platelets[key],
          })),
          whiteCells: Object.keys(bloodCounts.whiteCells).map((key) => ({
            name: key,
            value: bloodCounts.whiteCells[key],
          })),
        };
      } else if (type === "urine") {
        const urineCounts = {
          whiteCells_ur: { Low: 0, Normal: 0, High: 0 },
          redCells: { Low: 0, Normal: 0, High: 0 },
        };
  
        results.forEach((row) => {
          // Urine White Cells
          if (row.ufr_wc < 5) urineCounts.whiteCells_ur.Low++;
          else if (row.ufr_wc <= 10) urineCounts.whiteCells_ur.Normal++;
          else urineCounts.whiteCells_ur.High++;
  
          // Urine Red Cells
          if (row.ufr_rc < 5) urineCounts.redCells.Low++;
          else if (row.ufr_rc <= 10) urineCounts.redCells.Normal++;
          else urineCounts.redCells.High++;
        });
  
        response.urine = {
            whiteCells_ur: Object.keys(urineCounts.whiteCells_ur).map((key) => ({
            name: key,
            value: urineCounts.whiteCells_ur[key],
          })),
          redCells: Object.keys(urineCounts.redCells).map((key) => ({
            name: key,
            value: urineCounts.redCells[key],
          })),
        };
      }
  
      res.json(response);
    });
  });
  
// Endpoint to verify OTP
app.post('/verifyotp', (req, res) => {
    const { email, otp } = req.body;
    const query = "SELECT otp, UNIX_TIMESTAMP(otp_expires) AS otp_expires FROM staff WHERE email = ?";
    db.query(query, [email], (err, results) => {
      if (err || results.length === 0) {
        console.log("Database error or user not found");
        return res.status(500).json({ message: 'User not found' });
      }
  
      const user = results[0];
      const otpExpiresInMs = user.otp_expires * 1000; 
  
      if (parseInt(user.otp) !== parseInt(otp)) {
        return res.status(400).json({ message: 'Incorrect OTP' });
      }
  
      if (Date.now() > otpExpiresInMs) {
        return res.status(400).json({ message: 'Expired OTP' });
      }
  
      res.json({ message: 'OTP verified' });
    });
  });
  
  
// Endpoint to reset password
app.post('/resetpassword', async (req, res) => {
  const { email, newPassword } = req.body;
  const hashedPassword = await bcrypt.hash(newPassword, 10);

  const query = "UPDATE staff SET password = ?, otp = NULL, otp_expires = NULL WHERE email = ?";
  db.query(query, [hashedPassword, email], (err, result) => {
    if (err) return res.status(500).json({ message: 'Error resetting password' });
    res.json({ message: 'Password reset successful. Please log in.' });
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
    console.log(visitUn);
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

    const visit_unique = req.params.visit_unique;

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

app.put('/visitUpdate/:visit_unique', (req, res) => {
    const visit_unique = req.params.visit_unique;
    const {
        date,
        seenBy,
        complaints=[],
        abnormalUlerine=[],
        otherComplaint,
        bpa,
        bpb,
        pr,
        abdominalExam,
        gynaecologyExam,
        minorEua,
        minorEb,
        major=[],
        medicalManage,
        surgicalManage,
        wbc,
        hb,
        plate,
        whiteCell,
        redCell,
        protein,
        seK,
        seNa,
        crp,
        fbs,
        ppbsAB,
        ppbsAL,
        ppbsAD,
        lftALT,
        lftAST,
        lftOther,
        scan_types=[],
        mri,
        ct,
        tas,
        tus,
    } = req.body;

    const formattedPastMed = complaints.filter(Boolean).join(', ');
    const formattedPastSurg = abnormalUlerine.filter(Boolean).join(', ');
    const formattedHxCancer = major.filter(Boolean).join(', ');
    const formattedScan = scan_types.filter(Boolean).join(', ');

    const updateTreatSql = "UPDATE treatment SET `date` = ?,`seen_by` = ?,`complaints` = ?,`abnormal_bleeding` = ?,`complaint_other` = ?,`exam_bpa` = ?,`exam_bpb` = ?,`exam_pulse` = ?,`exam_abdominal` = ?,`exam_gynaecology` = ?,`manage_minor_eua` = ?,`manage_minor_eb` = ?,`manage_major` = ?,`manage_medical` = ?,`manage_surgical` = ? where `visit_id` = ?";
    const updateTreatValues = [
        date,
        seenBy,
        formattedPastMed,
        formattedPastSurg,
        otherComplaint,
        bpa,
        bpb,
        pr,
        abdominalExam,
        gynaecologyExam,
        minorEua,
        minorEb,
        formattedHxCancer,
        medicalManage,
        surgicalManage,
        visit_unique,
    ];

    db.query(updateTreatSql, updateTreatValues, (err,result) => {
            if (err) {
                console.error(err);
                return res.status(500).send({ message: "Error updating treatment" });
            }
        });

    const updateInvestigateSql = "UPDATE investigation SET `fbc_wbc` = ?, `fbc_hb` = ?, `fbc_pt` = ?, `ufr_wc` = ?, `ufr_rc` = ?, `ufr_protein` = ?, `se_k` = ?, `se_na` = ?, `crp` = ?, `fbs` = ?, `ppbs_ab` = ?, `ppbs_al` = ?, `ppbs_ad` = ?, `lft_alt` = ?, `lft_ast` = ?, `invest_other` = ?, `scan_types` = ?, `scan_mri` = ?, `scan_ct` = ?, `uss_tas` = ?, `uss_tus` = ? where `visit_id` = ?";
    const updateInvestValues = [
        wbc,
        hb,
        plate,
        whiteCell,
        redCell,
        protein,
        seK,
        seNa,
        crp,
        fbs,
        ppbsAB,
        ppbsAL,
        ppbsAD,
        lftALT,
        lftAST,
        lftOther,
        formattedScan,
        mri,
        ct,
        tas,
        tus,
        visit_unique
    ];

    db.query(updateInvestigateSql, updateInvestValues, (err, result) => {
        if (err) {
            console.error(err);
            return res.status(500).send({ message: "Error updating investigation" });
        } else {
            res.send('visit information updated successfully');
        }
    });
});




// API to fetch data based on filters
app.post('/export-data', (req, res) => {
    const { filterType, fromDate, toDate, patientNameOrPhn } = req.body;

    // Validate inputs
    if (!filterType || (filterType === 'all' && (!fromDate || !toDate)) || (filterType === 'single' && !patientNameOrPhn)) {
        return res.status(400).json({ error: 'Invalid filter inputs' });
    }

    let query = '';
    const params = [];

    if (filterType === 'all') {
        query = `
            SELECT * 
            FROM Patient_Admission_Treatment_Investigation_View 
            WHERE admission_date BETWEEN ? AND ?
        `;
        params.push(fromDate, toDate);
    } else if (filterType === 'single') {
        query = `
            SELECT * 
            FROM Patient_Admission_Treatment_Investigation_View 
            WHERE full_name LIKE ? OR patient_phone_no = ?
        `;
        params.push(`%${patientNameOrPhn}%`, patientNameOrPhn);
    }

    db.query(query, params, (err, results) => {
        if (err) return res.status(500).json({ error: err.message });
        res.status(200).json({ data: results });
    });
});

// API to export data to Excel
app.post('/export-excel', (req, res) => {
    const { data } = req.body;

    if (!data || !data.length) {
        return res.status(400).json({ error: 'No data provided for export' });
    }

    const workbook = new excelJS.Workbook();
    const worksheet = workbook.addWorksheet('Patient Data');

    // Dynamically set columns based on keys from the first row of data
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
});

// API to export data to PDF
app.post('/export-pdf', (req, res) => {
    const { data } = req.body;

    if (!data || !data.length) {
        return res.status(400).json({ error: 'No data provided for export' });
    }

    const doc = new pdf();
    const filePath = './PatientData.pdf';


    // Stream the PDF to both a file and the response
    doc.pipe(fs.createWriteStream(filePath));
    doc.pipe(res);

    // Add hospital symbol image to the header
    doc.image('./download.png', 50, 30, { width: 50 });

    // Add header text
    doc.fontSize(20)
       .font('Courier') //Helvetica-Bold
       .fillColor('blue')
       .text('GYNECOLOGY DEPARTMENT\nJAFFNA TEACHING HOSPITAL', 100, 35, { align: 'center' });  // Adjust the X, Y values

    // Add a horizontal line after the header
    doc.moveTo(50, 100)
       .lineTo(550, 100)
       .stroke();

    // Move down to start the main content
    doc.moveDown(2);

    // Report title
    doc.fontSize(16).text('Patient Data Report', { align: 'center', underline: true});
    doc.fillColor('black')
    doc.moveDown(1);

    data.forEach((row, index) => {
        doc.fontSize(12).font('Courier-Bold').text(`Record ${index + 1}:` , { underline: true });
        Object.keys(row).forEach((key) => {
            doc.fontSize(10)
            .font('Courier')
            .moveDown(0.5)
            .text(`${key.replace(/_/g, ' ')}: ${row[key]}`);
        });
        doc.moveDown(4);
    });

    doc.end();

    // Cleanup temporary file after sending
    doc.on('finish', () => {
        fs.unlink(filePath, (err) => {
            if (err) console.error('Error deleting PDF file:', err);
        });
    });
});


// API route to fetch scan data
app.get('/scan-data', (req, res) => {
    const query = `
      SELECT 
        SUM(CASE WHEN scan_ct != '' THEN 1 ELSE 0 END) AS CT,
        SUM(CASE WHEN scan_mri != '' THEN 1 ELSE 0 END) AS MRI,
        SUM(CASE WHEN uss_tas != '' THEN 1 ELSE 0 END) AS TAS,
        SUM(CASE WHEN uss_tus != '' THEN 1 ELSE 0 END) AS TUS
      FROM investigation;
    `;
  
    db.query(query, (err, results) => {
      if (err) {
        res.status(500).send(err);
      } else {
        res.json(results[0]);
      }
    });
  });
  





const genAI = new GoogleGenerativeAI(process.env.GEMINI_API_KEY);

app.post('/chat', async (req, res) => {
  const { userMessage } = req.body;
  console.log(userMessage)

  try {
    const model = genAI.getGenerativeModel({ model: "gemini-pro" });
    const chat = model.startChat();
    const result = await chat.sendMessage(userMessage);
    const responseText = result.response.text();

    res.json({ reply: responseText });
  } catch (error) {
    console.error('Error with Gemini API:', error);
    res.status(500).json({ error: 'Something went wrong.' });
  }
});



// API to fetch data based on filters
app.post('/export-dataa', (req, res) => {
    const {fromDate, toDate} = req.body;

    // Validate inputs

    let query = '';
    const params = [];

    
        query = `
            SELECT * 
            FROM Patient_Admission_Treatment_Investigation_View 
            WHERE admission_date BETWEEN ? AND ?
        `;
        params.push(fromDate, toDate);
    

    db.query(query, params, (err, results) => {
        if (err) return res.status(500).json({ error: err.message });
        res.status(200).json({ data: results });
    });
});
