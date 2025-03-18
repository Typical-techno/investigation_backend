import { Request, Response } from 'express';
import bcrypt from 'bcryptjs';
import jwt from 'jsonwebtoken';
import prisma from '../config/db';
import { generateOTP, sendOTP } from '../utils/otpUtils';
import { errorResponse } from '../utils/errorResponse';

const SECRET = process.env.JWT_SECRET || 'supersecret';

export const login = async (req: Request, res: Response): Promise<void> => {
    try {
        const { email, password } = req.body;

        if (!email || !password) {
            return errorResponse(res, 400, 'Email and password are required');
        }

        const user = await prisma.user.findUnique({ where: { email } });
        if (!user) {
            return errorResponse(res, 404, 'User not found');
        }

        const isPasswordValid = await bcrypt.compare(password, user.password);
        if (!isPasswordValid) {
            return errorResponse(res, 401, 'Invalid credentials');
        }

        if (user.isActive !== 'Active') {
            return errorResponse(res, 403, 'Admin approval required to log in');
        }

        const token = jwt.sign({ userId: user.id }, SECRET, {
            expiresIn: '7d'
        });

        res.json({ message: 'Login successful', token, user });
    } catch (error) {
        console.error('Error in login:', error);
        return errorResponse(res, 500, 'Something went wrong');
    }
};

export const requestOTP = async (
    req: Request,
    res: Response
): Promise<void> => {
    try {
        const {
            email,
            phoneNumber,
            username,
            desigination,
            police_thana,
            password
        } = req.body;

        if (!email.endsWith('gov.in')) {
            return errorResponse(res, 400, '.gov mail is required');
        }

        const existingUser = await prisma.user.findUnique({ where: { email } });
        if (existingUser) {
            return errorResponse(
                res,
                400,
                'User already exists, please log in'
            );
        }

        const otpValue = generateOTP();
        const expiresAt = new Date(Date.now() + 5 * 60 * 1000);
        const hashedPassword = await bcrypt.hash(password, 10);

        const user = await prisma.user.create({
            data: {
                email,
                phoneNumber,
                username,
                desigination,
                police_thana,
                password: hashedPassword,
                isActive: 'Stagging'
            }
        });

        await prisma.oTP.create({
            data: { userId: user.id, otpValue, expiresAt }
        });
        await sendOTP(email, otpValue);

        res.status(200).json({ message: 'OTP sent successfully' });
    } catch (error) {
        console.error('Error in requestOTP:', error);
        return errorResponse(res, 500, 'Something went wrong');
    }
};

export const verifyOTP = async (req: Request, res: Response): Promise<void> => {
    try {
        const { email, otp } = req.body;
        if (!email || !otp) {
            return errorResponse(res, 400, 'Email and OTP are required');
        }

        const user = await prisma.user.findUnique({ where: { email } });
        if (!user) {
            return errorResponse(res, 404, 'User not found');
        }

        const otpRecord = await prisma.oTP.findFirst({
            where: { userId: user.id, otpValue: otp },
            orderBy: { expiresAt: 'desc' }
        });

        if (!otpRecord || new Date() > otpRecord.expiresAt) {
            return errorResponse(res, 400, 'Invalid or expired OTP');
        }

        await prisma.oTP.delete({ where: { id: otpRecord.id } });
        await prisma.user.update({
            where: { email },
            data: { isActive: 'Active' }
        });

        res.json({ message: 'OTP verified successfully. Account activated.', user });
    } catch (error) {
        console.error('Error in verifyOTP:', error);
        return errorResponse(res, 500, 'Something went wrong');
    }
};

export const resendOTP = async (req: Request, res: Response): Promise<void> => {
    try {
        const { email } = req.body;

        if (!email) {
            return errorResponse(
                res,
                400,
                'Email is required'
            );
        }

        if (!email.endsWith('gov.in')) {
            return errorResponse(res, 400, '.gov mail is required');
        }

        // Fetch user
        const user = await prisma.user.findUnique({
            where: { email }
        });
        if (!user) {
            return errorResponse(res, 404, 'User not found');
        }

        // Generate new OTP
        const otpValue = generateOTP();
        const expiresAt = new Date(Date.now() + 5 * 60 * 1000); // 5 mins expiry

        // Delete any existing OTPs for the user
        await prisma.oTP.deleteMany({ where: { userId: user.id } });

        // Store new OTP
        await prisma.oTP.create({
            data: { userId: user.id, otpValue, expiresAt }
        });

        // Send new OTP
        await sendOTP(email, otpValue);

        res.status(200).json({ message: 'New OTP sent successfully' });
    } catch (error) {
        console.error('Error in resendOTP:', error);
        return errorResponse(res, 500, 'Something went wrong');
    }
};

export const checkToken = async (
    req: Request,
    res: Response
): Promise<void> => {
    try {
        const token = req.headers.authorization?.split(' ')[1];
        if (!token) {
            return errorResponse(res, 401, 'Token is required');
        }

        const decoded = jwt.verify(token, SECRET) as { userId: string };
        const user = await prisma.user.findUnique({
            where: { id: decoded.userId }
        });

        if (!user) {
            return errorResponse(res, 401, 'User not found');
        }

        if (user.isActive !== 'Active') {
            return errorResponse(res, 403, 'Admin approval required to log in');
        }

        res.json({ message: 'Token is valid' });
    } catch (error) {
        return errorResponse(res, 401, 'Invalid or expired token');
    }
};

export const requestPasswordReset = async (req: Request, res: Response): Promise<void> => {
    try {
        const { email } = req.body;
        if (!email) {
            return errorResponse(res, 400, 'Email is required');
        }

        const user = await prisma.user.findUnique({ where: { email } });
        if (!user) {
            return errorResponse(res, 404, 'User not found');
        }

        const otpValue = generateOTP();
        const expiresAt = new Date(Date.now() + 5 * 60 * 1000); // OTP expires in 5 minutes

        await prisma.oTP.deleteMany({ where: { userId: user.id } });
        await prisma.oTP.create({ data: { userId: user.id, otpValue, expiresAt } });

        await sendOTP(email, otpValue);
        res.status(200).json({ message: 'Password reset OTP sent successfully' });
    } catch (error) {
        console.error('Error in requestPasswordReset:', error);
        return errorResponse(res, 500, 'Something went wrong');
    }
};

export const resetPassword = async (req: Request, res: Response): Promise<void> => {
    try {
        const { email, otp, newPassword } = req.body;
        if (!email || !otp || !newPassword) {
            return errorResponse(res, 400, 'Email, OTP, and new password are required');
        }

        const user = await prisma.user.findUnique({ where: { email } });
        if (!user) {
            return errorResponse(res, 404, 'User not found');
        }

        const otpRecord = await prisma.oTP.findFirst({
            where: { userId: user.id, otpValue: otp },
            orderBy: { expiresAt: 'desc' }
        });

        if (!otpRecord || new Date() > otpRecord.expiresAt) {
            return errorResponse(res, 400, 'Invalid or expired OTP');
        }

        const hashedPassword = await bcrypt.hash(newPassword, 10);
        await prisma.user.update({ where: { email }, data: { password: hashedPassword } });

        await prisma.oTP.delete({ where: { id: otpRecord.id } });
        res.json({ message: 'Password reset successfully' });
    } catch (error) {
        console.error('Error in resetPassword:', error);
        return errorResponse(res, 500, 'Something went wrong');
    }
};
