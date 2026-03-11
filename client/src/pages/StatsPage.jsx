// client/src/pages/StatsPage.jsx
import { useState, useEffect } from 'react';
import { useUser, useAuth } from '@clerk/clerk-react';
import axios from '../api/axiosConfig'; // Uses your configured axios instance
import { motion } from 'framer-motion';
import { 
  Trophy, 
  BarChart2, 
  FileText, 
  Users, 
  Target, 
  Crown, 
  Medal, 
  Loader2,
  TrendingUp 
} from 'lucide-react';

export default function StatsPage() {
    const { user, isLoaded } = useUser();
    const { userId } = useAuth();
    
    const [userStats, setUserStats] = useState({
        totalResponses: 0,
        totalForms: 0,
        completionRate: 0,
        avgAccuracy: 0,
        aiGradedCount: 0
    });
    const [leaderboard, setLeaderboard] = useState([]);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        if (isLoaded && userId) {
            const fetchData = async () => {
                try {
                    // Parallel data fetching
                    const [statsRes, leaderboardRes] = await Promise.all([
                        axios.get(`/api/stats/user/${userId}`),
                        axios.get(`/api/stats/leaderboard`)
                    ]);

                    setUserStats(statsRes.data);
                    setLeaderboard(leaderboardRes.data);
                } catch (error) {
                    console.error("Failed to load stats grid:", error);
                } finally {
                    setLoading(false);
                }
            };
            fetchData();
        }
    }, [isLoaded, userId]);

    // Calculate Personal Score to match Leaderboard Logic: (Forms * 10) + (Responses * 2)
    const personalScore = (userStats.totalForms * 10) + (userStats.totalResponses * 2);

    if (loading) return (
        <div className="h-screen w-full flex items-center justify-center bg-slate-950 text-white">
            <Loader2 className="animate-spin text-indigo-500" size={48} />
        </div>
    );

    return (
        <div className="max-w-7xl mx-auto p-6 pb-20">
            {/* Header */}
            <header className="mb-12">
                <h1 className="text-4xl font-bold text-white mb-2 flex items-center gap-3">
                    <Trophy className="text-yellow-500" size={36} /> 
                    Command Center
                </h1>
                <p className="text-white/40">Your global ranking and neural performance metrics.</p>
            </header>

            {/* Personal Stats Grid */}
            <div className="grid grid-cols-1 md:grid-cols-4 gap-6 mb-16">
                <StatCard 
                    title="Neural Rank Score" 
                    value={personalScore} 
                    icon={Crown} 
                    color="text-yellow-400" 
                    subtext="Based on creation & engagement"
                />
                <StatCard 
                    title="Forms Deployed" 
                    value={userStats.totalForms} 
                    icon={FileText} 
                    color="text-blue-400" 
                />
                <StatCard 
                    title="Responses Captured" 
                    value={userStats.totalResponses} 
                    icon={Users} 
                    color="text-purple-400" 
                />
                <StatCard 
                    title="Avg. Accuracy" 
                    value={`${userStats.avgAccuracy}%`} 
                    icon={Target} 
                    color="text-emerald-400" 
                />
            </div>

            {/* Leaderboard Section */}
            <div className="flex flex-col md:flex-row gap-8">
                {/* Leaderboard Table */}
                <div className="flex-1">
                    <h2 className="text-2xl font-bold text-white mb-6 flex items-center gap-2">
                        <TrendingUp className="text-indigo-400" /> Top Architects
                    </h2>
                    
                    <div className="glass-card border border-white/10 overflow-hidden rounded-2xl bg-white/[0.02]">
                        <div className="grid grid-cols-12 gap-4 p-4 border-b border-white/5 text-[10px] uppercase tracking-widest text-white/40 font-mono">
                            <div className="col-span-1 text-center">Rank</div>
                            <div className="col-span-5">User Identity</div>
                            <div className="col-span-2 text-center">Forms</div>
                            <div className="col-span-2 text-center">Resp.</div>
                            <div className="col-span-2 text-right">Score</div>
                        </div>

                        <div className="max-h-[500px] overflow-y-auto">
                            {leaderboard.length > 0 ? (
                                leaderboard.map((entry, index) => {
                                    const isMe = entry.userId === userId;
                                    return (
                                        <motion.div 
                                            key={entry.userId}
                                            initial={{ opacity: 0, x: -10 }}
                                            animate={{ opacity: 1, x: 0 }}
                                            transition={{ delay: index * 0.05 }}
                                            className={`grid grid-cols-12 gap-4 p-4 items-center border-b border-white/5 transition-colors ${
                                                isMe ? 'bg-indigo-500/10 border-indigo-500/30' : 'hover:bg-white/[0.03]'
                                            }`}
                                        >
                                            {/* Rank Icon */}
                                            <div className="col-span-1 flex justify-center">
                                                {index === 0 && <span className="text-2xl">🥇</span>}
                                                {index === 1 && <span className="text-2xl">🥈</span>}
                                                {index === 2 && <span className="text-2xl">🥉</span>}
                                                {index > 2 && <span className="font-mono text-white/50">#{index + 1}</span>}
                                            </div>

                                            {/* User ID / Name */}
                                            <div className="col-span-5 flex items-center gap-3">
                                                <div className={`w-8 h-8 rounded-full flex items-center justify-center text-xs font-bold ${
                                                    isMe ? 'bg-indigo-500 text-white' : 'bg-white/10 text-white/50'
                                                }`}>
                                                    {index < 3 ? <Crown size={12} /> : <Users size={12} />}
                                                </div>
                                                <div className="truncate">
                                                    <p className={`font-medium ${isMe ? 'text-indigo-300' : 'text-slate-300'}`}>
                                                        {isMe ? "You (Current User)" : `Architect-${entry.userId.slice(-4)}`}
                                                    </p>
                                                    <p className="text-[10px] text-white/20 font-mono hidden md:block">
                                                        ID: {entry.userId}
                                                    </p>
                                                </div>
                                            </div>

                                            {/* Stats Columns */}
                                            <div className="col-span-2 text-center text-slate-400 font-mono text-sm">
                                                {entry.formsCreated}
                                            </div>
                                            <div className="col-span-2 text-center text-slate-400 font-mono text-sm">
                                                {entry.totalSubmissions}
                                            </div>
                                            <div className="col-span-2 text-right font-bold text-white text-lg">
                                                {entry.score}
                                            </div>
                                        </motion.div>
                                    );
                                })
                            ) : (
                                <div className="p-12 text-center text-white/30 italic">
                                    Leaderboard calibration in progress...
                                </div>
                            )}
                        </div>
                    </div>
                </div>

                {/* Side Panel: Achievements (Static Visuals for now) */}
                <div className="w-full md:w-80 space-y-6">
                    <div className="glass-card p-6 border border-white/10 rounded-2xl bg-gradient-to-br from-indigo-900/20 to-purple-900/20">
                        <h3 className="text-lg font-bold text-white mb-4 flex items-center gap-2">
                            <Medal size={20} className="text-orange-400" /> Milestones
                        </h3>
                        <div className="space-y-4">
                            <AchievementRow 
                                title="First Architect" 
                                desc="Created your first form" 
                                active={userStats.totalForms > 0} 
                            />
                            <AchievementRow 
                                title="Data Gatherer" 
                                desc="Received 10+ responses" 
                                active={userStats.totalResponses >= 10} 
                            />
                            <AchievementRow 
                                title="Neural Master" 
                                desc="Score over 100 points" 
                                active={personalScore >= 100} 
                            />
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
};

// --- Helper Components ---

const StatCard = ({ title, value, icon: Icon, color, subtext }) => (
    <motion.div 
        whileHover={{ y: -5 }}
        className="glass-card p-6 rounded-2xl border border-white/10 bg-white/[0.02]"
    >
        <div className="flex justify-between items-start mb-4">
            <div className={`p-3 rounded-xl bg-white/5 ${color}`}>
                <Icon size={24} />
            </div>
            {subtext && <span className="text-[10px] bg-white/10 px-2 py-1 rounded text-white/50">{subtext}</span>}
        </div>
        <p className="text-xs uppercase tracking-widest text-white/40 font-mono mb-1">{title}</p>
        <p className="text-3xl font-black text-white">{value}</p>
    </motion.div>
);

const AchievementRow = ({ title, desc, active }) => (
    <div className={`flex items-center gap-3 p-3 rounded-lg border ${
        active ? 'bg-green-500/10 border-green-500/20' : 'bg-white/5 border-transparent opacity-50'
    }`}>
        <div className={`w-2 h-2 rounded-full ${active ? 'bg-green-400' : 'bg-white/20'}`} />
        <div>
            <p className={`text-sm font-bold ${active ? 'text-green-300' : 'text-white/40'}`}>{title}</p>
            <p className="text-[10px] text-white/30">{desc}</p>
        </div>
    </div>
);