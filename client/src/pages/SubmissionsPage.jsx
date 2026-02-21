// client/src/pages/SubmissionsPage.jsx
import { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { Inbox, Clock, ChevronRight, User, Filter, Download } from 'lucide-react';
import api from '../api/axiosConfig'; //

export default function SubmissionsPage() {
  const [submissions, setSubmissions] = useState([]);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    const fetchSubmissions = async () => {
      try {
        // Fetching real submission data from your backend
        const response = await api.get('/responses'); 
        setSubmissions(response.data);
      } catch (error) {
        console.error("Neural Feed Interrupted:", error);
      } finally {
        setIsLoading(false);
      }
    };
    fetchSubmissions();
  }, []);

  // Helper function to format date without date-fns library
  const formatDate = (dateString) => {
    const date = new Date(dateString);
    return new Intl.DateTimeFormat('en-US', {
      month: 'short',
      day: '2-digit',
      hour: '2-digit',
      minute: '2-digit',
      hour12: false
    }).format(date);
  };

  return (
    <div className="max-w-7xl mx-auto pb-24 relative z-50">
      <header className="flex justify-between items-end mb-12">
        <div>
          <h2 className="text-5xl font-extrabold tracking-tighter text-white mb-3">Neural Feed</h2>
          <p className="text-white/40 font-mono text-xs uppercase tracking-widest flex items-center gap-2">
            <Inbox size={14} className="text-indigo-500" />
            Monitoring incoming data streams
          </p>
        </div>
        
        <div className="flex gap-4">
          <button className="p-3 rounded-xl bg-white/5 border border-white/10 text-white/60 hover:text-white transition-all">
            <Filter size={20} />
          </button>
          <button className="flex items-center gap-2 px-6 py-3 rounded-xl bg-white text-black font-bold text-xs uppercase tracking-widest hover:bg-indigo-50 transition-all">
            <Download size={16} /> Export Data
          </button>
        </div>
      </header>

      {submissions.length === 0 && !isLoading ? (
        <div className="p-32 rounded-[40px] border border-white/5 bg-white/[0.02] flex flex-col items-center justify-center text-center">
          <Clock size={48} className="text-white/10 mb-6" />
          <h3 className="text-xl font-bold text-white mb-2">No Data Streams Detected</h3>
          <p className="text-white/30 max-w-sm">Awaiting first neural handshake from external participants.</p>
        </div>
      ) : (
        <div className="space-y-4">
          {submissions.map((sub, i) => (
            <motion.div
              key={sub._id}
              initial={{ opacity: 0, x: -20 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ delay: i * 0.05 }}
              className="glass-card p-6 flex items-center justify-between group hover:border-indigo-500/30 transition-all cursor-pointer bg-white/[0.02] border-white/5 rounded-2xl"
            >
              <div className="flex items-center gap-6">
                <div className="w-12 h-12 rounded-2xl bg-indigo-500/10 flex items-center justify-center text-indigo-400 border border-indigo-500/20">
                  <User size={20} />
                </div>
                <div>
                  <h4 className="text-white font-bold tracking-tight">
                    {sub.respondentName || 'Anonymous Participant'}
                  </h4>
                  <div className="flex items-center gap-3 mt-1 font-mono text-[10px] uppercase tracking-wider text-white/30">
                    <span>Module: {sub.formTitle || 'Neural Module'}</span>
                    <span className="w-1 h-1 rounded-full bg-white/10" />
                    <span>{formatDate(sub.createdAt)}</span>
                  </div>
                </div>
              </div>

              <div className="flex items-center gap-8">
                <div className="text-right hidden md:block">
                  <p className="text-xs font-mono text-white/20 uppercase tracking-widest mb-1">Accuracy</p>
                  <p className="text-lg font-bold text-indigo-400">{sub.score || '0'}%</p>
                </div>
                <ChevronRight className="text-white/10 group-hover:text-white transition-colors" />
              </div>
            </motion.div>
          ))}
        </div>
      )}
    </div>
  );
}