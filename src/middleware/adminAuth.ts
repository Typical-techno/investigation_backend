import { Request, Response, NextFunction } from 'express';
import jwt from 'jsonwebtoken';
import prisma from '../config/db';
import { errorResponse } from '../utils/errorResponse';

const SECRET = process.env.JWT_SECRET || 'supersecret';

export const authenticateAdmin = async (
    req: Request,
    res: Response,
    next: NextFunction
): Promise<void> => {
    try {
        const token = req.headers.authorization?.split(' ')[1];
        if (!token) {
            return errorResponse(res, 401, 'Token is required');
        }

        const decoded = jwt.verify(token, SECRET) as {
            userId: string;
            isAdmin: boolean;
        };

        const admin = await prisma.admin.findUnique({
            where: { id: decoded.userId }
        });

        if (!admin || !admin.isAdmin || !admin.isActive) {
            return errorResponse(res, 403, 'Access denied');
        }

        (req as any).user = decoded; // Attach admin data to the request
        next(); // Pass control to the next middleware
    } catch (error) {
        console.error('Error in authenticateAdmin:', error);
        return errorResponse(res, 401, 'Invalid or expired token');
    }
};
