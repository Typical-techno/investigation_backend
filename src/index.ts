import express, { Application, Request, Response } from 'express';
import dotenv from 'dotenv';
import cors from 'cors';
import helmet from 'helmet';
import compression from 'compression';
import morgan from 'morgan';
import authRoutes from './routes/authRoutes';
import path from 'path';

dotenv.config();

const app: Application = express();

app.use(express.json());
app.use(cors());
app.use(helmet());
app.use(compression());
app.use(morgan('dev'));

app.use(express.static(path.join(__dirname, 'public')));

app.get('/', (req: Request, res: Response) => {
    res.sendFile(path.join(__dirname, 'public', 'index.html'));
});

app.use('/api/v1/auth', authRoutes);

const PORT = process.env.PORT || 5000;
app.listen(PORT, () => console.log(`Server running on port ${PORT}`));
