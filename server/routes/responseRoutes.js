import express from 'express';
import { createResponse, getResponsesByFormId, getSingleResponseById,  getResponsesByUserId } from '../controllers/responseController.js';

const router = express.Router();

router.get('/user/:userId', getResponsesByUserId);
router.get('/single/:responseId', getSingleResponseById);

router.get('/:formId', getResponsesByFormId);
router.post('/', createResponse);

export default router;