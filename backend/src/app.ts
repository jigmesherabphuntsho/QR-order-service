import express from 'express';
import cors from 'cors';
import dotenv from 'dotenv';
import { errorHandler } from './middleware/errorHandler.js';

import authRoutes from './routes/authRoutes.js';
import categoryRoutes from './routes/categoryRoutes.js';
import menuRoutes from './routes/menuRoutes.js';
import orderRoutes from './routes/orderRoutes.js';
import restaurantRoutes from './routes/restaurantRoutes.js';
import qrRoutes from './routes/qrRoutes.js';

dotenv.config();

const app = express();

// Middleware
app.use(cors());
app.use(express.json({ limit: '10mb' }));
app.use(express.urlencoded({ extended: true, limit: '10mb' }));

// Middleware to normalize /api prefix for Vercel serverless functions
app.use((req, res, next) => {
  if (req.url.startsWith('/api')) {
    req.url = req.url.replace('/api', '') || '/';
  }
  next();
});

// API Health Check
app.get('/health', (req, res) => {
  res.json({ status: 'ok', time: new Date().toISOString(), service: 'Restaurant QR API' });
});

// API Routes
app.use('/auth', authRoutes);
app.use('/categories', categoryRoutes);
app.use('/menu', menuRoutes);
app.use('/orders', orderRoutes);
app.use('/restaurant', restaurantRoutes);
app.use('/qr', qrRoutes);

// Error Handling Middleware
app.use(errorHandler);

export default app;
