import { Request, Response } from 'express';
import prisma from '../config/db';
import { errorResponse } from '../utils/errorResponse';
import bcrypt from 'bcryptjs';
import jwt from 'jsonwebtoken';

const SECRET = process.env.JWT_SECRET || 'supersecret';

export const authAdmin = async (req: Request, res: Response): Promise<void> => {
    const { email, password } = req.body;
    try {
        if (!email || !password) {
            return errorResponse(res, 400, 'Email and password required');
        }

        const admin = await prisma.admin.findUnique({ where: { email } });

        if (!admin || !admin.isAdmin || !admin.isActive) {
            return errorResponse(res, 403, 'Access denied');
        }

        const passwordMatch = await bcrypt.compare(password, admin.password);
        if (!passwordMatch) {
            return errorResponse(res, 401, 'Invalid credentials');
        }

        const token = jwt.sign({ userId: admin.id, isAdmin: true }, SECRET, {
            expiresIn: '7d'
        });

        res.json({ message: 'Admin login successful', token });
    } catch (error) {
        console.error('Error in admin login:', error);
        res.status(500).json({ error: 'Something went wrong' });
    }
};

export const registerAdmin = async (
    req: Request,
    res: Response
): Promise<void> => {
    try {
        const { username, email, phoneNumber, password } = req.body;

        if (!username || !email || !phoneNumber || !password) {
            return errorResponse(res, 400, 'All fields are required');
        }

        // Check if admin already exists
        const existingAdmin = await prisma.admin.findUnique({
            where: { email }
        });
        if (existingAdmin) {
            return errorResponse(
                res,
                400,
                'Admin with this email already exists'
            );
        }

        // Hash password
        const hashedPassword = await bcrypt.hash(password, 10);

        // Ensure only `gov.in` emails are automatically activated
        const isActive = email.endsWith('gov.in');

        // Create new admin
        const admin = await prisma.admin.create({
            data: {
                username,
                email,
                phoneNumber,
                password: hashedPassword,
                isAdmin: true,
                isActive: true
            }
        });

        res.status(201).json({
            message: 'Admin registered successfully.',
            adminId: admin.id
        });
    } catch (error) {
        console.error('Error in registerAdmin:', error);
        res.status(500).json({ error: 'Something went wrong' });
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
        const user = await prisma.admin.findUnique({
            where: { id: decoded.userId }
        });

        if (!user) {
            return errorResponse(res, 401, 'User not found');
        }

        res.json({ message: 'Token is valid', user });
    } catch (error) {
        return errorResponse(res, 401, 'Invalid or expired token');
    }
};

export const getStaggingUsers = async (req: Request, res: Response): Promise<void> => {
    try {
        const staggingUsers = await prisma.user.findMany({
            where: { isActive: 'Stagging' },
            select: {
                id: true,
                email: true,
                phoneNumber: true,
                username: true,
                desigination: true,
                police_thana: true,
                photo: true,
            }
        });

        res.status(200).json({ users: staggingUsers });
    } catch (error) {
        console.error('Error fetching stagging users:', error);
        return errorResponse(res, 500, 'Failed to fetch stagging users');
    }
};
