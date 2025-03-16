import { Request, Response } from 'express';
import bcrypt from 'bcryptjs';
import jwt from 'jsonwebtoken';
import prisma from '../config/db';
import { generateOTP, sendOTP } from '../utils/otpUtils';
import { errorResponse } from '../utils/errorResponse';

const SECRET = process.env.JWT_SECRET || 'supersecret';

// Function to handle user creation or retrieval
const getOrCreateUser = async (
    email: string,
    phoneNumber: string,
    data: any
) => {
    let user = await prisma.user.findUnique({ where: { email } });
    const userPhoneNumber = user?.phoneNumber;
    if (!user) {
        // Check if a user with the same phone number exists
        const existingUser = await prisma.user.findUnique({
            where: { email, phoneNumber: userPhoneNumber }
        });

        if (existingUser) {
            throw new Error(
                'A user with this email or phone number already exists.'
            );
        }

        // Create new user if phone number is also unique
        user = await prisma.user.create({ data });
    }

    return user;
};

// Request OTP handler
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

        if (!email) {
            return errorResponse(res, 400, 'Email is required');
        }

        if (!email.endsWith('gov.in')) {
            return errorResponse(res, 400, '.gov mail is required');
        }

        const otpValue = generateOTP();
        const expiresAt = new Date(Date.now() + 5 * 60 * 1000); // 5 mins expiry

        const hashedPassword = await bcrypt.hash(password, 10);

        // Fetch or create user
        const user = await getOrCreateUser(email, phoneNumber, {
            email,
            phoneNumber,
            username,
            desigination,
            police_thana,
            password: hashedPassword,
            isActive: email.endsWith('gov.in') ? 'Active' : 'Stagging'
        });

        // Store OTP
        await prisma.oTP.create({
            data: { userId: user.id, otpValue, expiresAt }
        });

        // Send OTP
        await sendOTP(email, otpValue);

        res.status(200).json({ message: 'OTP sent successfully' });
    } catch (error) {
        console.error('Error in requestOTP:', error);
        return errorResponse(res, 500, `${error}`);
    }
};

// Verify OTP handler
export const verifyOTP = async (req: Request, res: Response): Promise<void> => {
    try {
        const {
            otp,
            email,
            username,
            password,
            phoneNumber,
            police_thana,
            desigination
        } = req.body;

        if (!email || !password || !otp) {
            return errorResponse(
                res,
                400,
                'Email, Password, and OTP are required'
            );
        }

        // Fetch OTP record
        const otpRecord = await prisma.oTP.findFirst({
            where: {
                userId: (
                    await prisma.user.findUnique({ where: { email } })
                )?.id,
                otpValue: otp
            },
            orderBy: { expiresAt: 'desc' }
        });

        if (!otpRecord || new Date() > otpRecord.expiresAt) {
            return errorResponse(res, 400, 'Invalid or expired OTP');
        }

        // Delete OTP after verification
        await prisma.oTP.delete({ where: { id: otpRecord.id } });

        let user = await prisma.user.findUnique({ where: { email } });

        // If user doesn't exist, create one
        if (!user) {
            if (!username || !desigination || !police_thana) {
                return errorResponse(
                    res,
                    400,
                    'Complete details required for signup'
                );
            }

            const hashedPassword = await bcrypt.hash(password, 10);
            user = await prisma.user.create({
                data: {
                    email,
                    phoneNumber,
                    username,
                    desigination,
                    police_thana,
                    password: hashedPassword,
                    isActive: email.endsWith('gov.in') ? 'Active' : 'Stagging'
                }
            });
        }

        // Restrict login for non-approved users
        if (user.isActive === 'Stagging') {
            return errorResponse(res, 403, 'Admin approval required to log in');
        }

        // Generate JWT token
        const token = jwt.sign({ userId: user.id }, SECRET, {
            expiresIn: '7d'
        });

        res.json({ message: 'OTP verified successfully', token, user });
    } catch (error) {
        console.error('Error in verifyOTP:', error);
        return errorResponse(res, 500, 'Something went wrong');
    }
};

export const resendOTP = async (req: Request, res: Response): Promise<void> => {
    try {
        const { email, password } = req.body;

        if (!email || !password) {
            return errorResponse(
                res,
                400,
                'Email and phone number are required'
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

// Check token handler
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
