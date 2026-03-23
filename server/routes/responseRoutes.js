import express from 'express';
import { createResponse, getResponsesByFormId, getSingleResponseById,  getResponsesByUserId } from '../controllers/responseController.js';

const router = express.Router();

// Get all responses for a specific user
router.get('/user/:userId', getResponsesByUserId);

// Get a single specific response by its ID
router.get('/single/:responseId', getSingleResponseById);

// Get all responses for a specific form (UPDATED: added '/form/')
router.get('/form/:formId', getResponsesByFormId);

// Submit a new response
router.post('/', createResponse);

export default router;