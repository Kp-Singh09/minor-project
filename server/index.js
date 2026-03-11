// server/index.js
import dotenv from 'dotenv';
import path from 'path';
import { fileURLToPath } from 'url';
import express from 'express';
import mongoose from 'mongoose';
import cors from 'cors';
import { createServer } from 'http'; // Import createServer
import { initSocket } from './socket.js'; // Import socket initializer

// Route Imports
import formRoutes from './routes/formRoutes.js'; 
import responseRoutes from './routes/responseRoutes.js';
import imageKitRoutes from './routes/imageKitRoutes.js'; 
import statsRoutes from './routes/statsRoutes.js';
import aiRoutes from './routes/aiRoutes.js'; 
import reportRoutes from './routes/reportRoutes.js';
// Environment Configuration
const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
dotenv.config({ path: path.resolve(__dirname, '.env') });

const app = express();
const httpServer = createServer(app); // Create HTTP server wrapping Express

// CORS configuration
const allowedOrigins = [
  process.env.FRONTEND_URL,
  'https://formify-kp.vercel.app',
  'https://formify-kp.vercel.app/',
  'http://localhost:5173', // <--- FIXED: Added Localhost for development
  'http://localhost:5174'
];

const corsOptions = {
  origin: function (origin, callback) {
    if (allowedOrigins.indexOf(origin) !== -1 || !origin) {
      callback(null, true);
    } else {
      callback(new Error('Not allowed by CORS'));
    }
  },
  methods: ["GET", "POST", "PUT", "DELETE", "OPTIONS"],
  allowedHeaders: ["Content-Type", "Authorization"],
  credentials: true,
  optionsSuccessStatus: 200
};

app.use(cors(corsOptions));
app.options('*', cors(corsOptions));

app.use(express.json({ limit: '50mb' }));
app.use(express.urlencoded({ extended: true, limit: '50mb' }));

// Initialize Socket.io
initSocket(httpServer);

// Test Route
app.get('/', (req, res) => {
  res.send('Form Builder API is running!');
});

// API Routes
app.use('/api/forms', formRoutes);
app.use('/api/responses', responseRoutes);
app.use('/api/imagekit', imageKitRoutes);
app.use('/api/stats', statsRoutes);
app.use('/api/ai', aiRoutes);
app.use('/api/reports', reportRoutes);
// Database Connection and Server Start
const PORT = process.env.PORT || 5000;

mongoose.connect(process.env.MONGO_URI)
  .then(() => {
    // Listen using the httpServer, not app
    httpServer.listen(PORT, () => console.log(`Server running on port: ${PORT}`));
  })
  .catch((error) => console.error(`${error} did not connect`));