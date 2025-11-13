// server/routes/aiRoutes.js
import express from 'express';
import { generateFormWithAI } from '../controllers/aiController.js';

const router = express.Router();

router.post('/generate', generateFormWithAI);

export default router;