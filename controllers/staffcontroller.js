const bcrypt = require('bcryptjs');
require('dotenv').config(); // Load .env file
const jwt = require('jsonwebtoken');
const nodemailer = require('nodemailer');
// controllers/staffcontroller.js
const { Staff } = require('../models');  // Make sure you're importing from the correct file (index.js)
const keys = require('../config/keys');   // Use CommonJS require for keys
const { col } = require('sequelize');
const OTP_EXPIRATION = 300000; // 5 minutes in milliseconds

// Create Nodemailer transporter
const transporter = nodemailer.createTransport({
  service: 'Gmail',
  auth: {
    user: 'gyntngv@gmail.com', // replace with your email
    pass: 'ymee fufl synm cknk', // replace with your email password
  },
});

// POST /staff_reg
exports.staffRegister = async (req, res) => {
  try {
    const hashedPassword = await bcrypt.hash(req.body.password, 10);
    req.body.password = hashedPassword;

    const newStaff = await Staff.create({
      full_name: req.body.full_name,
      phone_no: req.body.phone_no,
      role: req.body.role,
      email: req.body.email,
      password: req.body.password,
      status: req.body.status || 'pending', // Default to 'pending' if status is not provided
    });

    return res.json({ newStaff });
  } catch (error) {
    console.error(error);
    return res.status(500).json({ error: 'Error inserting data into the staff table' });
  }
};
require('dotenv').config(); // Load .env file


// POST /login
exports.staffLogin = (req, res) => {
  const { email, password } = req.body;
  console.log(req.body)
  Staff.findOne({ where: { email } })
    .then((user) => {
      if (!user) {
        return res.status(400).send('User not found');
      }
      if(user.status ==="inactive"){
        return res.status(403).send("Your account is inactive");
      }

      bcrypt.compare(password, user.password, (err, isMatch) => {
        if (err) {
          console.log(err)
          // console.log('miss')
          return res.status(500).send('Server error');
        }
        if (!isMatch) {
          console.log('miss')
          return res.status(400).send('Invalid credentials');
        }

        // Ensure your secretOrKey is defined properly
        const payload = { id: user.id, full_name: user.full_name, role: user.role };
        console.log(payload)
        // Use the JWT secret from your environment variable
        const secretKey = keys.secretOrKey

        if (!secretKey) {
          console.log("JWT ERROR")
          return res.status(500).json({ error: 'JWT secret key is missing in environment variables' });
        }

        jwt.sign(payload, secretKey, { expiresIn: '1h' }, (err, token) => {
  if (err) {
    console.error("Error generating token:", err);  // Log the error
    return res.status(500).json({ error: 'Error generating token' });
  }
  res.json({
    success: true,
    token: 'Bearer ' + token,
    // role: user.role,
    userId: user.id
  });
});


      });
    })
    .catch((err) => {
      console.log(err)
      return res.status(500).json({ error: 'Server error' });
    });
};



// PUT /staff_update/:id
exports.updateStaff = async (req, res) => {
  const id = req.params.id;
  const { full_name, phone_no, role, email, password, status } = req.body;

  try {
    let updateData = { full_name, phone_no, role, email, status };
    if (password) {
      const hashedPassword = await bcrypt.hash(password, 10);
      updateData.password = hashedPassword;
    }

    await Staff.update(updateData, { where: { id } });
    return res.json({ message: 'Staff updated successfully' });
  } catch (error) {
    console.error(error);
    return res.status(500).send('Error updating staff');
  }
};

// GET /data1
exports.getStaffList = (req, res) => {
  // const limit = req.query.limit || 20; // Default limit to 20 if not provided
  let limit = parseInt(req.query.limit) || 20; // Default limit to 20 if not provided
  const page = parseInt(req.query.page) || 1;  // Default page to 1 if not provided
  const offset = (page - 1) * limit;
  Staff.findAll({
    limit: limit,
    offset: offset
  })
    .then((staffList) => {
      res.json(staffList);
    })
    .catch((err) => {
      console.error(err);
      res.status(500).send('Error retrieving data from the staff table');
    });
};

// DELETE /staff_information/:id
exports.deleteStaff = (req, res) => {
  const id = req.params.id;

  Staff.destroy({ where: { id } })
    .then(() => {
      res.json({ message: 'Staff deleted successfully' });
    })
    .catch((err) => {
      console.error(err);
      res.status(500).send('Error deleting staff');
    });
};

// POST /forgotpassword
exports.forgotPassword = (req, res) => {
  const { email } = req.body;

  if (!email) {
    return res.status(400).json({ message: 'Email is required' });
  }

  const otp = Math.floor(100000 + Math.random() * 900000); // Generate OTP
  const expiresAt = Math.floor(Date.now() / 1000) + Math.floor(OTP_EXPIRATION / 1000);

  Staff.update({ otp, otp_expires: new Date(expiresAt * 1000) }, { where: { email } })
    .then(() => {
      const mailOptions = {
        from: 'gyntngv@gmail.com',
        to: email,
        subject: 'Your OTP Code',
        text: `Your OTP code is ${otp}`,
      };
      

      transporter.sendMail(mailOptions, (error, info) => {
        if (error) {
          console.log('email', email)
          console.error(error);
          return res.status(500).json({ message: 'Error sending OTP email' });
        }
        res.status(200).json({ message: 'OTP sent successfully' });
      });
    })
    .catch((err) => {
      console.error(err);
      res.status(500).json({ message: 'Error processing password reset' });
    });
};


// POST /verifyotp
exports.verifyOTP = (req, res) => {
  const { email, otp } = req.body;

  Staff.findOne({ where: { email } })
    .then((user) => {
      if (!user) {
        return res.status(400).json({ message: 'User not found' });
      }

      const otpExpiresInMs = user.otp_expires.getTime();

      if (parseInt(user.otp) !== parseInt(otp)) {
        return res.status(400).json({ message: 'Incorrect OTP' });
      }

      if (Date.now() > otpExpiresInMs) {
        return res.status(400).json({ message: 'OTP has expired' });
      }

      res.json({ message: 'OTP verified successfully' });
    })
    .catch((err) => {
      console.error(err);
      res.status(500).json({ message: 'Error verifying OTP' });
    });
};

exports.getStaffDetail= async (req, res) => {

    const staffId = req.params.id;
    console.log('staffId', staffId)
    try {
      const staffData = await Staff.findOne({ where: { id: staffId } });
      if (staffData) {
        res.json(staffData);
      } else {
        res.status(404).json({ message: 'Staff not found' });
      }
    } catch (error) {
      res.status(500).json({ message: 'Server error', error });
    }
  }

exports.resetPassword = async (req, res) => {
  const { email, newPassword } = req.body;

  if (!email || !newPassword) {
    return res.status(400).json({ message: 'Email and new password are required' });
  }

  try {
    // Hash the new password
    const hashedPassword = await bcrypt.hash(newPassword, 10);

    // Update the password, reset OTP, and its expiration
    const [updatedRows] = await Staff.update(
      {
        password: hashedPassword,
        otp: null,
        otp_expires: null,
      },
      {
        where: { email },
      }
    );

    // Check if any rows were updated
    if (updatedRows === 0) {
      return res.status(404).json({ message: 'Email not found' });
    }

    res.json({ message: 'Password reset successful. Please log in.' });
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: 'Error resetting password' });
  }
}