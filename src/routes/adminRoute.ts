import express from 'express';
import { authenticateAdmin } from '../middleware/adminAuth';
import { authAdmin, checkToken, getStaggingUsers, registerAdmin } from '../controllers/adminController';

const router = express.Router();

// Route to register a new admin
router.post('/register-admin', authenticateAdmin, registerAdmin);

// Route to authenticate admin login
router.post('/admin-login', authAdmin);

//Route to check admin details and token
router.get('/me', authenticateAdmin, checkToken)

//Route to get all stagging user
router.get('/new-request', authenticateAdmin, getStaggingUsers)

export default router;
