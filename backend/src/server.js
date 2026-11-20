import 'dotenv/config';
import express from 'express';
import helmet from 'helmet';
import cors from 'cors';
import rateLimit from 'express-rate-limit';
import compression from 'compression';
import cookieParser from 'cookie-parser';
import morgan from 'morgan';
import path from 'path';
import { connectDatabase } from './config/db.js';
import apiRoutes from './routes/api.js';
import { errorHandler, notFound } from './middleware/error.js';

const app = express();
const allowedOrigins = [process.env.FRONTEND_URL, process.env.ADMIN_URL].filter(Boolean);

app.use(helmet({ crossOriginResourcePolicy: { policy: 'cross-origin' } }));
app.use(cors({ origin(origin, callback) { if (!origin || allowedOrigins.includes(origin)) return callback(null, true); callback(new Error('Origin not allowed by CORS')); }, credentials: true }));
app.use(compression());
app.use(express.json({ limit: '1mb' }));
app.use(express.urlencoded({ extended: true, limit: '1mb' }));
app.use(cookieParser());
app.use(morgan(process.env.NODE_ENV === 'production' ? 'combined' : 'dev'));
app.use('/uploads', express.static(path.resolve(process.cwd(), 'uploads'), { maxAge: '1d', immutable: false }));
app.use('/api', rateLimit({ windowMs: 15 * 60 * 1000, limit: 300, standardHeaders: 'draft-7', legacyHeaders: false }));
app.use('/api', apiRoutes);
app.get('/api/health', (req, res) => res.json({ success: true, status: 'ok' }));
app.get('/', (req, res) => res.json({ success: true, name: 'PRERNA API', status: 'ok', health: '/api/health' }));
app.use(notFound);
app.use(errorHandler);

const port = process.env.PORT || 5000;

async function start() {
  await connectDatabase();
  app.listen(port, () => console.log(`PRERNA API listening on http://localhost:${port}`));
}

if (process.env.NODE_ENV !== 'test') start().catch(error => {
  console.error('Failed to start server:', error.message);
  process.exit(1);
});

export default app;
