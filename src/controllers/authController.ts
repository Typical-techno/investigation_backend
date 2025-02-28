import { Request, Response } from 'express';
import bcrypt from 'bcryptjs';
import jwt from 'jsonwebtoken';
import prisma from '../config/db';

const SECRET = process.env.JWT_SECRET || 'supersecret';

export const signup = async (req: Request, res: Response): Promise<void> => {
    try {
        const {
            email,
            password,
            username,
            desigination,
            police_thana,
            phoneNumber
        } = req.body;

        const existingUser = await prisma.user.findUnique({
            where: { email, phoneNumber }
        });
        if (existingUser) {
            res.status(400).json({ error: 'Username already exists' });
            return;
        }

        const hashedPassword = await bcrypt.hash(password, 10);
        await prisma.user.create({
            data: {
                email,
                password: hashedPassword,
                username,
                desigination,
                police_thana,
                phoneNumber
            }
        });

        res.status(201).json({ message: 'User created successfully' });
    } catch (error: any) {
        console.log(error.message);
        res.status(500).json({ error: error.message });
    }
};

export const login = async (req: Request, res: Response): Promise<void> => {
    try {
        const { email, password } = req.body;

        const user = await prisma.user.findUnique({ where: { email } });
        if (!user) {
            res.status(401).json({ error: 'Invalid credentials' });
            return;
        }

        const isMatch = await bcrypt.compare(password, user.password);
        if (!isMatch) {
            res.status(401).json({ error: 'Invalid credentials' });
            return;
        }

        const token = jwt.sign({ userId: user.id }, SECRET, {
            expiresIn: '7d'
        });

        const userData = {
            id: user.id,
            username: user.username,
            email: user.email,
            phoneNumber: user.phoneNumber,
            desigination: user.desigination,
            police_thana: user.police_thana,
            isActive: user.isActive
        };

        res.json({ userData, token });
    } catch (error: any) {
        res.status(500).json({ error: error.message });
    }
};

export const checkToken = async (req: Request, res: Response): Promise<void> => {
    try {
        const token = req.headers.authorization?.split(' ')[1];
        if (!token) {
            res.status(401).json({ error: 'Token is required' });
            return;
        }

        jwt.verify(token, SECRET);

        res.json({ message: 'Token is valid' });
    } catch (error: any) {
        res.status(401).json({ error: 'Invalid or expired token' });
    }
};
