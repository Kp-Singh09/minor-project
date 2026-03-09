// client/src/pages/AnalyticsDashboard.jsx
import React, { useState, useEffect } from "react";
import { motion } from "framer-motion";
import { 
  BarChart2, 
  Users, 
  Clock, 
  TrendingUp, 
  Activity, 
  BrainCircuit,
  Eye,
  MousePointer2
} from "lucide-react";
import NeuralChart from "../components/Analytics/NeuralChart";
import ReportTemplate from "../components/Analytics/ReportTemplate";
import axios from "../api/axiosConfig"; // Use your configured axios instance
import { useAuth } from "@clerk/clerk-react"; // Assuming you use Clerk
import toast from "react-hot-toast";

const AnalyticsDashboard = () => {
  const { userId, isLoaded } = useAuth();
  const [loading, setLoading] = useState(true);
  const [stats, setStats] = useState({
    totalSubmissions: 0,
    activeForms: 0,
    avgCompletionRate: 0,
    avgTimeSpent: 0,
    aiGradedCount: 0,
    realTimeUsers: 0
  });

  useEffect(() => {
    const fetchStats = async () => {
      if (!isLoaded || !userId) return;

      try {
        setLoading(true);
        // Ensure this endpoint exists in your server/routes/statsRoutes.js
        const response = await axios.get(`/api/stats/user/${userId}`);
        
        // Map backend data to UI state
        // Assuming backend returns: { totalResponses, totalForms, completionRate, ... }
        const data = response.data; 

        setStats({
          totalSubmissions: data.totalResponses || 0,
          activeForms: data.totalForms || 0,
          avgCompletionRate: data.completionRate || 0,
          avgTimeSpent: data.avgTime || 0, // Ensure backend calculates this
          aiGradedCount: data.aiGradedCount || 0,
          realTimeUsers: 0 // Sockets will handle this later
        });
      } catch (error) {
        console.error("Failed to fetch analytics:", error);
        toast.error("Could not load neural analytics");
      } finally {
        setLoading(false);
      }
    };

    fetchStats();
  }, [userId, isLoaded]);

  const containerVariants = {
    hidden: { opacity: 0 },
    visible: {
      opacity: 1,
      transition: {
        staggerChildren: 0.1
      }
    }
  };

  const itemVariants = {
    hidden: { y: 20, opacity: 0 },
    visible: { y: 0, opacity: 1 }
  };

  return (
    <div className="min-h-screen bg-slate-950 text-white p-8 font-sans selection:bg-purple-500/30">
      <div className="max-w-7xl mx-auto space-y-8">
        
        {/* Header */}
        <motion.div 
          initial={{ opacity: 0, y: -20 }}
          animate={{ opacity: 1, y: 0 }}
          className="flex justify-between items-center"
        >
          <div>
            <h1 className="text-4xl font-bold bg-gradient-to-r from-purple-400 to-cyan-400 bg-clip-text text-transparent">
              Command Center
            </h1>
            <p className="text-slate-400 mt-2">Real-time neural analytics & feedback loop</p>
          </div>
          <div className="flex gap-4">
             {/* Report Generation Button */}
             <ReportTemplate stats={stats} />
          </div>
        </motion.div>

        {/* Key Metrics Grid */}
        <motion.div 
          variants={containerVariants}
          initial="hidden"
          animate="visible"
          className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6"
        >
          <StatCard 
            icon={Users}
            label="Total Submissions"
            value={stats.totalSubmissions}
            trend="+12%"
            color="text-blue-400"
            variants={itemVariants}
            loading={loading}
          />
          <StatCard 
            icon={Activity}
            label="Active Forms"
            value={stats.activeForms}
            trend="Stable"
            color="text-emerald-400"
            variants={itemVariants}
            loading={loading}
          />
          <StatCard 
            icon={TrendingUp}
            label="Completion Rate"
            value={`${stats.avgCompletionRate}%`}
            trend="+5%"
            color="text-purple-400"
            variants={itemVariants}
            loading={loading}
          />
          <StatCard 
            icon={BrainCircuit}
            label="AI Graded"
            value={stats.aiGradedCount}
            trend="98% Accuracy"
            color="text-rose-400"
            variants={itemVariants}
            loading={loading}
          />
        </motion.div>

        {/* Charts Section */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8 h-[500px]">
          <motion.div 
            initial={{ opacity: 0, x: -20 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ delay: 0.4 }}
            className="lg:col-span-2 bg-slate-900/50 backdrop-blur-xl border border-white/5 p-6 rounded-2xl relative overflow-hidden group"
          >
            <div className="absolute inset-0 bg-gradient-to-br from-purple-500/5 to-cyan-500/5 opacity-0 group-hover:opacity-100 transition-opacity duration-500" />
            <div className="flex justify-between items-center mb-6">
              <h3 className="text-xl font-semibold text-slate-200 flex items-center gap-2">
                <Activity className="w-5 h-5 text-purple-400" />
                Submission Velocity
              </h3>
              <div className="flex gap-2">
                {['1H', '24H', '7D', '30D'].map((time) => (
                  <button key={time} className="px-3 py-1 text-xs rounded-full bg-slate-800 text-slate-400 hover:bg-slate-700 hover:text-white transition-colors">
                    {time}
                  </button>
                ))}
              </div>
            </div>
            <div className="h-[400px] w-full">
              <NeuralChart />
            </div>
          </motion.div>

          <motion.div 
            initial={{ opacity: 0, x: 20 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ delay: 0.5 }}
            className="bg-slate-900/50 backdrop-blur-xl border border-white/5 p-6 rounded-2xl relative overflow-hidden group"
          >
             <div className="absolute inset-0 bg-gradient-to-bl from-rose-500/5 to-amber-500/5 opacity-0 group-hover:opacity-100 transition-opacity duration-500" />
            <h3 className="text-xl font-semibold text-slate-200 mb-6 flex items-center gap-2">
              <Eye className="w-5 h-5 text-rose-400" />
              Proctoring Integrity
            </h3>
            
            <div className="space-y-6">
              <IntegrityItem label="Tab Switches" value="124" severity="high" />
              <IntegrityItem label="Multiple Faces" value="12" severity="medium" />
              <IntegrityItem label="Gaze Violations" value="856" severity="low" />
              
              <div className="mt-8 p-4 bg-slate-800/50 rounded-xl border border-white/5">
                <div className="flex items-center justify-between mb-2">
                  <span className="text-slate-400 text-sm">Trust Score</span>
                  <span className="text-emerald-400 font-bold">94.2%</span>
                </div>
                <div className="h-2 bg-slate-700 rounded-full overflow-hidden">
                  <motion.div 
                    initial={{ width: 0 }}
                    animate={{ width: "94.2%" }}
                    transition={{ duration: 1, delay: 1 }}
                    className="h-full bg-gradient-to-r from-emerald-500 to-cyan-500"
                  />
                </div>
              </div>
            </div>
          </motion.div>
        </div>
      </div>
    </div>
  );
};

// Helper Components
const StatCard = ({ icon: Icon, label, value, trend, color, variants, loading }) => (
  <motion.div 
    variants={variants}
    className="bg-slate-900/50 backdrop-blur-xl border border-white/5 p-6 rounded-2xl relative overflow-hidden group hover:border-white/10 transition-colors"
  >
    <div className={`absolute inset-0 bg-gradient-to-br ${color.replace('text-', 'from-')}/5 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-500`} />
    
    <div className="relative z-10">
      <div className="flex justify-between items-start mb-4">
        <div className={`p-3 rounded-xl bg-slate-800/50 ${color}`}>
          <Icon size={24} />
        </div>
        <span className={`text-xs font-medium px-2 py-1 rounded-full bg-slate-800/50 ${color}`}>
          {trend}
        </span>
      </div>
      
      {loading ? (
        <div className="h-8 w-24 bg-slate-800 animate-pulse rounded" />
      ) : (
        <h2 className="text-3xl font-bold text-slate-100">{value}</h2>
      )}
      <p className="text-slate-400 text-sm mt-1">{label}</p>
    </div>
  </motion.div>
);

const IntegrityItem = ({ label, value, severity }) => {
  const colors = {
    high: "text-rose-400 bg-rose-400/10",
    medium: "text-amber-400 bg-amber-400/10",
    low: "text-blue-400 bg-blue-400/10"
  };

  return (
    <div className="flex items-center justify-between group">
      <span className="text-slate-400 group-hover:text-slate-200 transition-colors">{label}</span>
      <span className={`px-3 py-1 rounded-lg text-sm font-medium ${colors[severity]}`}>
        {value}
      </span>
    </div>
  );
};

export default AnalyticsDashboard;