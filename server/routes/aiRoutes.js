// server/routes/aiRoutes.js
import express from 'express';
import { generateFormWithAI, generateQuestionFromImage } from '../controllers/aiController.js';

const router = express.Router();

router.post('/generate', generateFormWithAI);
router.post('/image-to-question', generateQuestionFromImage); 

export default router;