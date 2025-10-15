import express from 'express';
import { getUserStats, getLeaderboard } from '../controllers/statsController.js';

const router = express.Router();

router.get('/user/:userId', getUserStats);
router.get('/leaderboard', getLeaderboard);

export default router;