// server/routes/aiRoutes.js
import express from 'express';
import multer from 'multer';
import { generateFormWithAI, generateQuestionFromImage, generateFormFromDocument } from '../controllers/aiController.js';

const router = express.Router();

// Memory storage for immediate processing
const upload = multer({ storage: multer.memoryStorage() });

router.post('/generate', generateFormWithAI);
router.post('/vision', generateQuestionFromImage);

// New RAG Route
router.post('/upload-pdf', upload.single('file'), generateFormFromDocument);

export default router;