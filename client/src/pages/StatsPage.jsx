// src/pages/StatsPage.jsx
import { useState, useEffect } from 'react';
import { useUser } from '@clerk/clerk-react';
import axios from 'axios';
import { motion } from 'framer-motion';

const StatCard = ({ title, value, icon }) => (
    <motion.div 
        className="bg-white p-6 rounded-lg text-center border border-gray-200 shadow-md border-t-4 border-t-blue-400"
        whileHover={{ scale: 1.05, boxShadow: "0 10px 15px -3px rgba(0, 0, 0, 0.1), 0 4px 6px -2px rgba(0, 0, 0, 0.05)" }}
    >
        <div className="text-4xl mb-3">{icon}</div>
        <p className="text-gray-500 text-sm">{title}</p>
        <p className="text-3xl font-bold text-gray-900">{value}</p>
    </motion.div>
);

const StatsPage = () => {
    const { user } = useUser();
    const [userStats, setUserStats] = useState(null);
    const [leaderboard, setLeaderboard] = useState([]);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        if (user) {
            const fetchStats = async () => {
                try {
                    const [statsRes, leaderboardRes] = await Promise.all([
                        axios.get(`${import.meta.env.VITE_API_BASE_URL}/api/stats/user/${user.id}`),
                        axios.get(`${import.meta.env.VITE_API_BASE_URL}/api/stats/leaderboard`)
                    ]);
                    setUserStats(statsRes.data);
                    setLeaderboard(leaderboardRes.data);
                } catch (error) {
                    console.error("Failed to fetch stats", error);
                } finally {
                    setLoading(false);
                }
            };
            fetchStats();
        }
    }, [user]);

    if (loading) return <p className="text-center text-gray-500">Loading stats...</p>;
    if (!userStats) return <p className="text-center text-red-500">Could not load your stats.</p>;
    
    return (
        <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }}>
            <h1 className="text-4xl font-bold mb-8 text-gray-900">Your Stats</h1>

            <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-12">
                <StatCard title="Total Forms Created" value={userStats.formCount} icon="📄" />
                <StatCard title="Total Responses Received" value={userStats.totalResponsesReceived} icon="📈" />
                <StatCard title="Your Score" value={userStats.score} icon="🏆" />
            </div>

            <h2 className="text-3xl font-bold mb-6 text-gray-900">Leaderboard</h2>
            <div className="bg-white p-6 rounded-lg border border-gray-200 shadow-md border-t-4 border-t-blue-400">
                {leaderboard.length > 0 ? (
                    <ul className="space-y-4">
                        {leaderboard.map((entry, index) => (
                            <li key={entry.userId} className={`flex items-center justify-between p-4 rounded-md ${
                                index === 0 ? 'bg-yellow-100/50' : index === 1 ? 'bg-gray-200/50' : index === 2 ? 'bg-orange-200/50' : ''
                            }`}>
                                <div className="flex items-center gap-4">
                                    <span className="text-2xl font-bold w-8 text-center">{index === 0 ? '🥇' : index === 1 ? '🥈' : index === 2 ? '🥉' : index + 1}</span>
                                    <p className="font-semibold text-gray-800 truncate">{entry.userId === user.id ? "You" : entry.username || `User ID: ...${entry.userId.slice(-6)}`}</p>
                                </div>
                                <p className="font-bold text-xl text-blue-600">{entry.score} pts</p>
                            </li>
                        ))}
                    </ul>
                ) : (
                    <p className="text-gray-500 text-center">Leaderboard is being calculated. Check back soon!</p>
                )}
            </div>
        </motion.div>
    );
};

export default StatsPage;