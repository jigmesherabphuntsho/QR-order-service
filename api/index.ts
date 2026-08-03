import express from 'express';
import cors from 'cors';
import dotenv from 'dotenv';
import { errorHandler } from '../backend/src/middleware/errorHandler.js';

import authRoutes from '../backend/src/routes/authRoutes.js';
import categoryRoutes from '../backend/src/routes/categoryRoutes.js';
import menuRoutes from '../backend/src/routes/menuRoutes.js';
import orderRoutes from '../backend/src/routes/orderRoutes.js';
import restaurantRoutes from '../backend/src/routes/restaurantRoutes.js';
import qrRoutes from '../backend/src/routes/qrRoutes.js';

dotenv.config();

const app = express();

app.use(cors());
app.use(express.json({ limit: '10mb' }));
app.use(express.urlencoded({ extended: true, limit: '10mb' }));

app.get('/api/health', (req, res) => {
  res.json({ status: 'ok', time: new Date().toISOString(), service: 'Restaurant QR API' });
});

app.use('/api/auth', authRoutes);
app.use('/api/categories', categoryRoutes);
app.use('/api/menu', menuRoutes);
app.use('/api/orders', orderRoutes);
app.use('/api/restaurant', restaurantRoutes);
app.use('/api/qr', qrRoutes);

app.use(errorHandler);

export default app;
