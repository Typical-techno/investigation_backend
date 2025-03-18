import express from 'express';
import {
    requestOTP,
    verifyOTP,
    checkToken,
    login,
    requestPasswordReset,
    resetPassword
} from '../controllers/authController';

const router = express.Router();

// Route (Login)
router.post('/login', login);

// Route to request OTP (Register)
router.post('/request-otp', requestOTP);

// Route to verify OTP (Registration)
router.post('/verify-otp', verifyOTP);

// Route to check JWT token validity
router.get('/me', checkToken);

router.post('/forgot-otp', requestPasswordReset);

router.post('/forgot-pass', resetPassword);

// router.post('/test-otp', TestSendingOTP)
// // Route to register a new admin
// router.post('/register-admin', authenticateAdmin, registerAdmin);

// // Route to authenticate admin login
// router.post('/admin-login', authAdmin);

export default router;
