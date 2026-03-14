// client/src/pages/AnalyticsPage.jsx
import { useEffect, useState } from 'react';
import { motion } from 'framer-motion';
import { useAuth } from '@clerk/clerk-react';
import axios from '../api/axiosConfig';
import { 
  Trophy, 
  Users, 
  Target, 
  Crown, 
  Activity, 
  BrainCircuit, 
  Loader2, 
  TrendingUp,
  FileText,
  Medal
} from 'lucide-react';

export default function AnalyticsPage() {
  const { userId, isLoaded } = useAuth();
  
  // State for User Stats
  const [stats, setStats] = useState({
    totalResponses: 0,
    completionRate: 0,
    avgAccuracy: 0,
    totalForms: 0,
    aiGradedCount: 0
  });

  // State for Leaderboard
  const [leaderboard, setLeaderboard] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchData = async () => {
      if (!userId) return;
      try {
        // Parallel Fetch: User Stats + Leaderboard
        const [statsRes, leaderboardRes] = await Promise.all([
            axios.get(`/api/stats/user/${userId}`),
            axios.get(`/api/stats/leaderboard`)
        ]);

        setStats(statsRes.data);
        setLeaderboard(leaderboardRes.data);
      } catch (err) {
        console.error("Failed to load analytics", err);
      } finally {
        setLoading(false);
      }
    };

    if (isLoaded) fetchData();
  }, [isLoaded, userId]);

  // Calculate Personal Score (Forms * 10 + Responses * 2)
  const personalScore = (stats.totalForms * 10) + (stats.totalResponses * 2);

  if (loading) return (
    <div className="h-screen w-full flex items-center justify-center bg-slate-950">
      <Loader2 className="animate-spin text-indigo-500" size={48} />
    </div>
  );

  return (
    <div className="max-w-7xl mx-auto p-6 pb-20">
      <header className="mb-12">
        <h2 className="text-4xl font-bold text-white mb-2 flex items-center gap-3">
            <Trophy className="text-yellow-500" size={32} /> Neural Analytics
        </h2>
        <p className="text-white/40">Real-time performance metrics and global ranking.</p>
      </header>

      {/* --- SECTION 1: PERSONAL STATS GRID --- */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-6 mb-12">
        
        {/* Card 1: Rank Score */}
        <StatCard 
            title="Neural Rank Score" 
            value={personalScore} 
            icon={Crown} 
            color="text-yellow-400" 
            border="border-yellow-500/20"
        />

        {/* Card 2: Total Responses */}
        <StatCard 
            title="Responses Captured" 
            value={stats.totalResponses} 
            icon={Users} 
            color="text-blue-400" 
            border="border-blue-500/20"
        />

        {/* Card 3: Avg Accuracy */}
        <StatCard 
            title="Avg. Accuracy" 
            value={`${stats.avgAccuracy}%`} 
            icon={Target} 
            color="text-emerald-400" 
            border="border-emerald-500/20"
        />

        {/* Card 4: AI Graded */}
        <StatCard 
            title="AI Graded" 
            value={stats.aiGradedCount} 
            icon={BrainCircuit} 
            color="text-indigo-400" 
            border="border-indigo-500/20"
        />
      </div>

      {/* --- SECTION 2: LEADERBOARD & MILESTONES --- */}
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
                            // SAFEGUARD: Provide fallback if entry.userId is null/undefined
                            const safeUserId = entry.userId || `unknown-${index}`;
                            const isMe = entry.userId === userId && userId !== undefined;
                            
                            // Get last 4 characters safely
                            const shortId = typeof safeUserId === 'string' && safeUserId.length >= 4 
                                ? safeUserId.slice(-4) 
                                : String(safeUserId).slice(-4);

                            return (
                                <motion.div 
                                    key={safeUserId}
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
                                                {isMe ? "You (Current User)" : `Architect-${shortId}`}
                                            </p>
                                            <p className="text-[10px] text-white/20 font-mono hidden md:block">
                                                ID: {safeUserId}
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
                            No leaderboard data available yet.
                        </div>
                    )}
                </div>
            </div>
        </div>

        {/* Side Panel: Achievements */}
        <div className="w-full md:w-80 space-y-6">
            <div className="glass-card p-6 border border-white/10 rounded-2xl bg-gradient-to-br from-indigo-900/20 to-purple-900/20">
                <h3 className="text-lg font-bold text-white mb-4 flex items-center gap-2">
                    <Medal size={20} className="text-orange-400" /> Milestones
                </h3>
                <div className="space-y-4">
                    <AchievementRow 
                        title="First Architect" 
                        desc="Created your first form" 
                        active={stats.totalForms > 0} 
                    />
                    <AchievementRow 
                        title="Data Gatherer" 
                        desc="Received 10+ responses" 
                        active={stats.totalResponses >= 10} 
                    />
                    <AchievementRow 
                        title="Neural Master" 
                        desc="Score over 100 points" 
                        active={personalScore >= 100} 
                    />
                </div>
            </div>
            
            {/* Active Status Card */}
            <div className="glass-card p-6 border border-white/10 rounded-2xl bg-white/[0.02]">
                <div className="flex items-center gap-3 mb-2">
                    <Activity className="text-green-400" size={20} />
                    <span className="text-sm font-bold text-white">System Status</span>
                </div>
                <div className="text-xs text-white/50 space-y-1">
                    <p>• Neural Engine: <span className="text-green-400">Online</span></p>
                    <p>• Real-time Sync: <span className="text-green-400">Active</span></p>
                    <p>• Data Stream: <span className="text-green-400">Stable</span></p>
                </div>
            </div>
        </div>

      </div>
    </div>
  );
}

// --- SUB-COMPONENTS ---

const StatCard = ({ title, value, icon: Icon, color, border }) => (
    <motion.div 
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      whileHover={{ y: -5 }}
      className={`glass-card p-6 border bg-white/[0.02] ${border || 'border-white/10'}`}
    >
      <div className="flex justify-between items-start mb-4">
         <Icon className={`${color}`} size={28} />
      </div>
      
      <p className="text-[10px] uppercase tracking-widest text-white/40 font-mono mb-1">
        {title}
      </p>
      <p className="text-3xl font-black text-white tracking-tight">
        {value}
      </p>
    </motion.div>
);

const AchievementRow = ({ title, desc, active }) => (
    <div className={`flex items-center gap-3 p-3 rounded-lg border transition-colors ${
        active ? 'bg-green-500/10 border-green-500/20' : 'bg-white/5 border-transparent opacity-50'
    }`}>
        <div className={`w-2 h-2 rounded-full ${active ? 'bg-green-400' : 'bg-white/20'}`} />
        <div>
            <p className={`text-sm font-bold ${active ? 'text-green-300' : 'text-white/40'}`}>{title}</p>
            <p className="text-[10px] text-white/30">{desc}</p>
        </div>
    </div>
);