import express from 'express';
import mysql from 'mysql';
import cors from 'cors';
import cookieParser from "cookie-parser";
import session from "express-session";


const app = express();
app.use(cors());
app.use(express.json());

app.use(cookieParser());
app.use(session({
    key: "userId",
    secret:'hellooooooo',
    resave: false,
    saveUninitialized: false,
    cookie: {
        expires: 60 * 60 * 24,
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
        if(err){
            return res.json("Error");
        }
        if(data.length>0){
            req.session.user = {
                userId: req.body.email,
                username: req.body.password,
            };
            console.log(req.session.user);
            return res.json("Success");
        }else{
            return res.json("Failed");
        }
    })
})
const isAuthenticated = (req, res, next) => {
    if (req.session && req.session.user) {
      // User is authenticated
      next();
    } else {
      // Redirect to login page or send an unauthorized response
      res.status(401).send('Unauthorized');
    }
  };

  app.get('/home', isAuthenticated, (req, res) => {
    // Access allowed for authenticated users
    res.send('/home');
  });


app.get('/logout',(req,res)=>{
    // console.log(req.session.user);
    req.session.user = null;
    req.session.destroy();
    return res.json("success")
})
// app.get('/logout', (req, res) => {
//     req.session.destroy((err) => {
//       if (err) {
//         console.error(err);
//       }
//       res.redirect('/login'); // Redirect to login page after logout
//     });
//   });
  
app.listen(8081,() =>{
    console.log("Running...");
})
