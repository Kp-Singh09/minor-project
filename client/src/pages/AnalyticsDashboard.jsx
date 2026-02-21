// client/src/pages/AnalyticsDashboard.jsx
import { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { BarChart3, TrendingUp, Users, ShieldAlert, Activity, Globe, Loader2 } from 'lucide-react';
import api from '../api/axiosConfig';
import NeuralChart from '../components/Analytics/NeuralChart';

export default function AnalyticsDashboard() {
  const [stats, setStats] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchGlobalStats = async () => {
      try {
        // Mocking the aggregate data structure
        setTimeout(() => {
          setStats({
            totalSubmissions: 1248,
            avgAccuracy: 76.4,
            integrityViolations: 12,
            activeUsers: 84,
            trendData: [30, 40, 35, 50, 49, 60, 70, 91]
          });
          setLoading(false);
        }, 1000);
      } catch (err) {
        console.error(err);
      }
    };
    fetchGlobalStats();
  }, []);

  if (loading) return (
    <div className="h-screen flex items-center justify-center">
      <Loader2 className="animate-spin text-indigo-500" size={48} />
    </div>
  );

  return (
    <div className="max-w-[1400px] mx-auto pb-24">
      <header className="mb-16 flex justify-between items-end">
        <div>
          <h2 className="text-5xl font-black text-white tracking-tighter">Command Center</h2>
          <p className="text-white/30 font-mono text-xs uppercase tracking-[0.4em] mt-2">Global Neural Analytics Network</p>
        </div>
        <div className="flex items-center gap-2 px-4 py-2 rounded-full bg-green-500/10 border border-green-500/20 text-green-400 text-[10px] font-bold">
          <Globe size={14} className="animate-spin-slow" /> SYSTEM ONLINE
        </div>
      </header>

      {/* STATS GRID */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-6 mb-12">
        {[
          { label: 'Total Syncs', val: stats.totalSubmissions, icon: Users, color: 'text-blue-400' },
          { label: 'Avg Accuracy', val: `${stats.avgAccuracy}%`, icon: TrendingUp, color: 'text-indigo-400' },
          { label: 'Active Links', val: stats.activeUsers, icon: Activity, color: 'text-purple-400' },
          { label: 'Integrity Flags', val: stats.integrityViolations, icon: ShieldAlert, color: 'text-red-400' },
        ].map((item, i) => (
          <motion.div 
            key={i}
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: i * 0.1 }}
            className="glass-card p-8 border-white/5 relative overflow-hidden group"
          >
            <div className={`absolute top-0 right-0 p-4 opacity-5 group-hover:opacity-20 transition-opacity`}>
              <item.icon size={64} />
            </div>
            <p className="text-[10px] font-mono text-white/30 uppercase tracking-widest mb-2">{item.label}</p>
            <h4 className={`text-4xl font-black ${item.color}`}>{item.val}</h4>
          </motion.div>
        ))}
      </div>

      {/* TREND ANALYSIS */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        <div className="lg:col-span-2 glass-card p-12 border-white/5">
          <div className="flex justify-between items-center mb-8">
            <h3 className="text-xl font-bold text-white flex items-center gap-3">
              <BarChart3 className="text-indigo-500" /> Performance Velocity
            </h3>
            <span className="text-[10px] font-mono text-white/20 uppercase tracking-widest">7 Day Cycle</span>
          </div>
          <NeuralChart data={stats.trendData} />
        </div>

        <div className="glass-card p-12 border-white/5 flex flex-col justify-between">
          <div>
            <h3 className="text-xl font-bold text-white mb-6">Security Overview</h3>
            <p className="text-sm text-white/40 leading-relaxed">
              The neural proctoring engine has prevented <span className="text-red-400 font-bold">{stats.integrityViolations}</span> potential integrity breaches this week.
            </p>
          </div>
          <div className="mt-12 space-y-4">
            <div className="h-2 w-full bg-white/5 rounded-full overflow-hidden">
              <div className="h-full bg-indigo-500 w-[98%]" />
            </div>
            <p className="text-[10px] font-mono text-white/20 uppercase">98% System Integrity Rating</p>
          </div>
        </div>
      </div>
    </div>
  );
}