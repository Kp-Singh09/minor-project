// server/index.js
import dotenv from 'dotenv';
import path from 'path';
import { fileURLToPath } from 'url';
import express from 'express';
import mongoose from 'mongoose';
import cors from 'cors';

import formRoutes from './routes/formRoutes.js'; 
import responseRoutes from './routes/responseRoutes.js';
import imageKitRoutes from './routes/imageKitRoutes.js'; 
import statsRoutes from './routes/statsRoutes.js';
import aiRoutes from './routes/aiRoutes.js'; 

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
dotenv.config({ path: path.resolve(__dirname, '.env') });

const app = express();

const allowedOrigins = [
  process.env.FRONTEND_URL,
  'http://localhost:5173',
  'https://formify-kp.vercel.app'
];

app.use(cors({
  origin: function (origin, callback) {
    if (!origin || allowedOrigins.indexOf(origin) !== -1) {
      callback(null, true);
    } else {
      callback(new Error('Not allowed by CORS'));
    }
  },
  credentials: true
}));

app.use(express.json({ limit: '50mb' }));

app.use('/api/forms', formRoutes);
app.use('/api/responses', responseRoutes);
app.use('/api/imagekit', imageKitRoutes);
app.use('/api/stats', statsRoutes);
app.use('/api/ai', aiRoutes);

const PORT = process.env.PORT || 5000;
mongoose.connect(process.env.MONGO_URI)
  .then(() => app.listen(PORT, () => console.log(`Neural Engine Online on Port: ${PORT}`)))
  .catch((error) => console.error(`Neural Link Failed: ${error}`));