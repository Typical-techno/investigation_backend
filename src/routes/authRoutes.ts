import express from 'express';
import {
    requestOTP,
    verifyOTP,
    checkToken,
} from '../controllers/authController';

const router = express.Router();

// Route to request OTP (Register/Login)
router.post('/request-otp', requestOTP);

// Route to verify OTP (Registration/Login)
router.post('/verify-otp', verifyOTP);

// Route to check JWT token validity
router.get('/me', checkToken);

// // Route to register a new admin
// router.post('/register-admin', authenticateAdmin, registerAdmin);

// // Route to authenticate admin login
// router.post('/admin-login', authAdmin);

export default router;
