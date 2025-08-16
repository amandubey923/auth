import 'dotenv/config';
import express from 'express';
import cookieParser from 'cookie-parser';
import cors from 'cors';
import helmet from 'helmet';
import morgan from 'morgan';
import rateLimit from 'express-rate-limit';
import { connectDB } from './db.js';
import authRoutes from './routes/auth.routes.js';

const app = express();

// Security middleware
app.use(helmet());
app.use(morgan('dev'));
app.use(express.json());
app.use(cookieParser());

// CORS configuration
app.use(cors({
  origin: process.env.CLIENT_URL,
  credentials: true
}));

// Rate limiting
const limiter = rateLimit({ 
  windowMs: 15 * 60 * 1000, 
  max: 200 
});
app.use('/api/', limiter);

// Routes
app.use('/api/auth', authRoutes);

// Health check
app.get('/', (_req, res) => res.json({ status: 'healthy' }));

// Database connection and server start
const PORT = process.env.PORT || 5000;
connectDB()
  .then(() => {
    app.listen(PORT, () => {
      console.log(`🚀 Server running on port ${PORT}`);
      console.log(`Connected to MongoDB: ${process.env.MONGO_URI.split('@')[1].split('/')[0]}`);
    });
  })
  .catch(err => {
    console.error('Failed to connect to MongoDB:', err);
    process.exit(1);
  });