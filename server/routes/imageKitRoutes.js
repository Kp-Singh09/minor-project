import express from 'express';
import { getAuthToken } from '../controllers/imageKitController.js';

const router = express.Router();

router.get('/auth', getAuthToken);

export default router;