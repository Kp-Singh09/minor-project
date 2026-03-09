// server/routes/reportRoutes.js
import express from 'express';
import { generateSubmissionPDF } from '../controllers/reportController.js';

const router = express.Router();

// Route to download PDF
router.get('/download/:responseId', generateSubmissionPDF);

export default router;