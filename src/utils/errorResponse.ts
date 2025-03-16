import { Response } from "express";

// Utility function to respond with errors
export const errorResponse = (res: Response, status: number, message: string) => {
    res.status(status).json({ error: message });
};
