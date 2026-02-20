// client/src/pages/DashboardPage.jsx
import { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { useUser } from '@clerk/clerk-react';
import { Plus, Loader2, AlertCircle, Layout, Activity } from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import api from '../api/axiosConfig';
import FormCard from '../components/dashboard/FormCard';

export default function DashboardPage() {
  const { user } = useUser();
  const navigate = useNavigate();
  const [forms, setForms] = useState([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    const fetchUserForms = async () => {
      if (!user) return;
      try {
        // Fetch real data from the backend
        const response = await api.get(`/forms/user/${user.id}`);
        setForms(response.data);
        setError(null);
      } catch (err) {
        console.error("Dashboard Fetch Error:", err);
        setError("Neural link interrupted. Could not reach database.");
      } finally {
        setIsLoading(false);
      }
    };

    fetchUserForms();
  }, [user]);

  if (isLoading) {
    return (
      <div className="h-[70vh] w-full flex flex-col items-center justify-center gap-6">
        <div className="relative">
          <Loader2 className="animate-spin text-indigo-500" size={48} />
          <div className="absolute inset-0 blur-xl bg-indigo-500/20 animate-pulse" />
        </div>
        <p className="text-white/40 font-mono text-xs uppercase tracking-widest animate-pulse">
          Synchronizing Neural Repository...
        </p>
      </div>
    );
  }

  return (
    <div className="max-w-7xl mx-auto pb-24 relative z-50">
      {/* Dashboard Header */}
      <header className="flex justify-between items-end mb-16">
        <div>
          <motion.h2 
            initial={{ opacity: 0, x: -20 }}
            animate={{ opacity: 1, x: 0 }}
            className="text-5xl font-extrabold tracking-tighter text-white mb-3"
          >
            Welcome, <span className="text-indigo-500">{user?.firstName || 'Agent'}</span>
          </motion.h2>
          <div className="flex items-center gap-3 text-white/40 font-medium">
            <Activity size={16} className="text-indigo-400" />
            <span>Repository status: {forms.length} active modules identified.</span>
          </div>
        </div>

        <motion.button 
          whileHover={{ scale: 1.02 }}
          whileTap={{ scale: 0.98 }}
          onClick={() => navigate('/editor/new')}
          className="flex items-center gap-2 px-8 py-4 rounded-2xl bg-white text-black font-black uppercase tracking-tighter hover:bg-indigo-50 transition-all shadow-2xl shadow-white/10 z-[100] relative"
        >
          <Plus size={20} strokeWidth={3} />
          Create New Form
        </motion.button>
      </header>

      {/* Error Alert Box */}
      {error && (
        <motion.div 
          initial={{ opacity: 0, y: -10 }} 
          animate={{ opacity: 1, y: 0 }}
          className="p-6 rounded-2xl border border-red-500/20 bg-red-500/5 text-red-400 flex items-center gap-4 mb-12 backdrop-blur-md"
        >
          <AlertCircle size={20} />
          <p className="text-sm font-mono">{error}</p>
        </motion.div>
      )}

      {/* Main Content: Grid or Empty State */}
      {forms.length === 0 ? (
        <motion.div 
          initial={{ opacity: 0, y: 40 }}
          animate={{ opacity: 1, y: 0 }}
          className="p-24 rounded-[40px] border border-white/5 flex flex-col items-center text-center bg-white/[0.02] backdrop-blur-3xl shadow-2xl"
        >
          <div className="w-24 h-24 bg-indigo-500/10 rounded-[32px] flex items-center justify-center mb-10 border border-indigo-500/20 shadow-inner">
            <Layout className="text-indigo-400" size={40} />
          </div>
          <h3 className="text-3xl font-bold mb-4 text-white tracking-tight">Zero Modules Deployed</h3>
          <p className="text-white/40 max-w-sm mb-12 text-lg leading-relaxed">
            Your neural repository is currently offline. Initialize a new assessment module to begin data collection.
          </p>
          <button 
            onClick={() => navigate('/editor/new')}
            className="px-10 py-4 rounded-xl border border-white/10 hover:bg-white/5 text-white transition-all font-mono text-xs uppercase tracking-widest hover:border-indigo-500/50"
          >
            + Initialize First Module
          </button>
        </motion.div>
      ) : (
        <motion.div 
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-10"
        >
          {forms.map((form) => (
            <FormCard key={form._id} form={form} />
          ))}
        </motion.div>
      )}
    </div>
  );
}