import { Request, Response } from 'express';
import bcrypt from 'bcryptjs';
import jwt from 'jsonwebtoken';
import prisma from '../config/db';

const SECRET = process.env.JWT_SECRET || 'supersecret';

export const signup = async (req: Request, res: Response): Promise<void> => {
    try {
        const { email, password, username, desigination, police_thana } =
            req.body;

        const existingUser = await prisma.user.findUnique({
            where: { email }
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
                police_thana
            }
        });

        res.status(201).json({ message: 'User created successfully' });
    } catch (error: any) {
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
            expiresIn: '1h'
        });
        const userData = {
            id: user.id,
            username: user.username,
            email: user.email,
            desigination: user.desigination,
            police_thana: user.police_thana,
            isActive: user.isActive
        };

        res.json({ userData, token });
    } catch (error: any) {
        res.status(500).json({ error: error.message });
    }
};
