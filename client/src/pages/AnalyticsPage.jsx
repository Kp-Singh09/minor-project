// client/src/pages/AnalyticsPage.jsx
import { motion } from 'framer-motion';
import { BarChart3, TrendingUp, Users, Clock } from 'lucide-react';

export default function AnalyticsPage() {
  return (
    <div className="max-w-7xl mx-auto">
      <header className="mb-12">
        <h2 className="text-4xl font-bold text-white mb-2">Neural Analytics</h2>
        <p className="text-white/40">Real-time data stream analysis across all active modules.</p>
      </header>

      {/* Placeholder Stats Grid */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-6 mb-12">
        {[
          { label: 'Total Views', value: '2.4k', icon: Users, color: 'text-blue-400' },
          { label: 'Completion Rate', value: '68%', icon: TrendingUp, color: 'text-green-400' },
          { label: 'Avg. Response Time', value: '1m 24s', icon: Clock, color: 'text-purple-400' },
          { label: 'Active Sessions', value: '12', icon: Activity, color: 'text-indigo-400' },
        ].map((stat, i) => (
          <motion.div 
            key={i}
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: i * 0.1 }}
            className="glass-card p-6 border-white/5 bg-white/[0.02]"
          >
            <stat.icon className={`${stat.color} mb-4`} size={24} />
            <p className="text-[10px] uppercase tracking-widest text-white/40 font-mono mb-1">{stat.label}</p>
            <p className="text-2xl font-bold text-white">{stat.value}</p>
          </motion.div>
        ))}
      </div>

      <div className="glass-card p-20 border-white/5 bg-white/[0.01] flex flex-col items-center justify-center text-center">
        <BarChart3 size={48} className="text-white/10 mb-6" />
        <h3 className="text-xl font-bold text-white mb-2">Detailed Analysis Pending</h3>
        <p className="text-white/40 max-w-sm">Gather more responses to unlock advanced visual insights and behavioral heatmaps.</p>
      </div>
    </div>
  );
}