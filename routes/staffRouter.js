const express = require('express');
const router = express.Router();
const staffController = require('../controllers/staffcontroller');

// Staff registration route
router.post('/staff_reg', staffController.staffRegister);

// Staff login route
router.post('/login', staffController.staffLogin);

// Update staff route
router.put('/staff_update/:id', staffController.updateStaff);

// Get staff list
router.get('/data1', staffController.getStaffList);

// Delete staff route
router.delete('/staff_information/:id', staffController.deleteStaff);

// Forgot password
router.post('/forgotpassword', staffController.forgotPassword);

// Verify OTP
router.post('/verifyotp', staffController.verifyOTP);

router.get('/staff/:id',staffController.getStaffDetail);

router.post('/resetpassword',staffController.resetPassword);

module.exports = router;
