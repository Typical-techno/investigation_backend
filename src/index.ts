import express, { Application, Request, Response } from 'express';
import dotenv from 'dotenv';
import cors from 'cors';
import helmet from 'helmet';
import compression from 'compression';
import morgan from 'morgan';
import authRoutes from './routes/authRoutes';
import adminRoutes from './routes/adminRoute';
import path from 'path';

dotenv.config();

const app: Application = express();

app.use(express.json());
app.use(
    cors({
        origin: [
            'http://localhost:3000',
            'https://investigation.erohtak.com',
            'http://localhost:5500',
            'http://127.0.0.1:5500',
            'http://localhost:5173',
            'https://cyber-investigation.vercel.app'
        ], // Allow all origins (Change this to specific domains for security)
        methods: ['GET', 'POST', 'PUT', 'DELETE'],
        allowedHeaders: ['Content-Type', 'Authorization'],
        credentials: true
    })
);
app.use(helmet());
app.use(compression());
app.use(morgan('dev'));

app.use(express.static(path.join(__dirname, 'public')));

app.get('/', (req: Request, res: Response) => {
    res.sendFile(path.join(__dirname, 'public', 'index.html'));
});

app.use('/api/v1/auth', authRoutes);
app.use('/api/v1/admin', adminRoutes);

const PORT = process.env.PORT || 5000;
app.listen(PORT, () => console.log(`Server running on port ${PORT}`));
