// client/src/pages/DashboardPage.jsx
import { useState, useEffect, useMemo } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { useUser } from '@clerk/clerk-react';
import { Plus, Loader2, AlertCircle, Layout, Activity, Search } from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import toast from 'react-hot-toast'; 
import api from '../api/axiosConfig'; 
import FormCard from '../components/dashboard/FormCard';

export default function DashboardPage() {
  const { user } = useUser();
  const navigate = useNavigate();
  const [forms, setForms] = useState([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState(null);
  
  const [searchQuery, setSearchQuery] = useState("");

  useEffect(() => {
    const fetchUserForms = async () => {
      if (!user) return;
      try {
        // UPDATED: Pass the email as a query parameter so shared forms show up!
        const email = encodeURIComponent(user.primaryEmailAddress?.emailAddress || '');
        const response = await api.get(`/api/forms/user/${user.id}?email=${email}`);
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

  const handleDeleteForm = async (formId) => {
    if (!window.confirm("Are you sure you want to delete this form? This action cannot be undone.")) {
      return;
    }

    try {
      await api.delete(`/api/forms/${formId}`);
      setForms((prevForms) => prevForms.filter((form) => form._id !== formId));
      toast.success('Form deleted successfully');
    } catch (err) {
      console.error("Error deleting form:", err);
      toast.error('Failed to delete form');
    }
  };

  const filteredForms = useMemo(() => {
    return forms.filter(form => 
      form.title.toLowerCase().includes(searchQuery.toLowerCase())
    );
  }, [forms, searchQuery]);

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
    <div className="max-w-7xl mx-auto pb-24 relative z-50 pt-8">
      <header className="flex flex-col md:flex-row justify-between items-start md:items-center mb-12 gap-6">
        <div className="flex-1 w-full">
          <div className="flex flex-col md:flex-row md:items-center gap-6">
            
            <div className="flex items-center gap-3 text-white/40 font-medium whitespace-nowrap bg-white/5 px-4 py-3 rounded-xl border border-white/10">
              <Activity size={18} className="text-indigo-400" />
              <span>Repository status: <strong className="text-white">{forms.length}</strong> active modules</span>
            </div>

            <div className="relative w-full max-w-md group">
              <div className="absolute inset-y-0 left-4 flex items-center pointer-events-none">
                <Search size={16} className="text-white/20 group-focus-within:text-indigo-400 transition-colors" />
              </div>
              <input 
                type="text"
                placeholder="Search neural modules..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="w-full bg-white/5 border border-white/10 rounded-xl py-3 pl-12 pr-4 text-sm text-white placeholder:text-white/20 focus:outline-none focus:border-indigo-500/50 focus:bg-white/[0.08] transition-all font-mono shadow-inner"
              />
            </div>
          </div>
        </div>

        <motion.button 
          whileHover={{ scale: 1.02 }}
          whileTap={{ scale: 0.98 }}
          onClick={() => navigate('/editor/new')}
          className="flex items-center gap-2 px-8 py-4 rounded-2xl bg-white text-black font-black uppercase tracking-tighter hover:bg-indigo-50 transition-all shadow-xl shadow-white/5 z-[100] relative whitespace-nowrap"
        >
          <Plus size={20} strokeWidth={3} />
          Create New Form
        </motion.button>
      </header>

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

      <AnimatePresence mode='popLayout'>
        {filteredForms.length === 0 ? (
          <motion.div 
            key="empty-state"
            initial={{ opacity: 0, y: 40 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, scale: 0.95 }}
            className="p-24 rounded-[40px] border border-white/5 flex flex-col items-center text-center bg-white/[0.02] backdrop-blur-3xl shadow-2xl mt-8"
          >
            <div className="w-24 h-24 bg-indigo-500/10 rounded-[32px] flex items-center justify-center mb-10 border border-indigo-500/20 shadow-inner">
              <Layout className="text-indigo-400" size={40} />
            </div>
            <h3 className="text-3xl font-bold mb-4 text-white tracking-tight">
              {searchQuery ? "No matching modules" : "Zero Modules Deployed"}
            </h3>
            <p className="text-white/40 max-w-sm mb-12 text-lg leading-relaxed">
              {searchQuery 
                ? `The query "${searchQuery}" did not return any results from the repository.`
                : "Your neural repository is currently offline. Initialize a new assessment module to begin data collection."
              }
            </p>
            {!searchQuery && (
              <button 
                onClick={() => navigate('/editor/new')}
                className="px-10 py-4 rounded-xl border border-white/10 hover:bg-white/5 text-white transition-all font-mono text-xs uppercase tracking-widest hover:border-indigo-500/50"
              >
                + Initialize First Module
              </button>
            )}
          </motion.div>
        ) : (
          <motion.div 
            key="grid-state"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-10"
          >
            {filteredForms.map((form) => (
              <motion.div 
                layout 
                key={form._id} 
                initial={{ opacity: 0, scale: 0.9 }} 
                animate={{ opacity: 1, scale: 1 }}
                exit={{ opacity: 0, scale: 0.9 }}
                transition={{ duration: 0.2 }}
              >
                <FormCard form={form} onDelete={handleDeleteForm} />
              </motion.div>
            ))}
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}