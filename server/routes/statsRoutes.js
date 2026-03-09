// server/routes/statsRoutes.js
import express from 'express';
import { getUserStats, getLeaderboard } from '../controllers/statsController.js';

const router = express.Router();

// Matches axios.get('/api/stats/user/${userId}')
router.get('/user/:userId', getUserStats);

// Matches global leaderboard fetch
router.get('/leaderboard', getLeaderboard);

export default router;