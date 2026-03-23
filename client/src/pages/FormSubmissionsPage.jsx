// client/src/pages/FormSubmissionsPage.jsx
import { useEffect, useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import axios from '../api/axiosConfig';
import { motion } from 'framer-motion';
import { Loader2, ArrowLeft, Calendar, ChevronRight, User, ShieldAlert, Clock, ArrowUpDown } from 'lucide-react';

export default function FormSubmissionsPage() {
  const { formId } = useParams();
  const navigate = useNavigate();
  const [responses, setResponses] = useState([]);
  const [loading, setLoading] = useState(true);
  
  // NEW: State for sorting
  const [sortBy, setSortBy] = useState('newest');

  useEffect(() => {
    const fetchResponses = async () => {
      try {
        const res = await axios.get(`/api/responses/form/${formId}`);
        setResponses(res.data);
      } catch (err) {
        console.error("Failed to fetch form responses", err);
      } finally {
        setLoading(false);
      }
    };
    if (formId) fetchResponses();
  }, [formId]);

  // NEW: Derived sorted array based on selected filter
  const sortedResponses = [...responses].sort((a, b) => {
    if (sortBy === 'newest') return new Date(b.submittedAt) - new Date(a.submittedAt);
    if (sortBy === 'oldest') return new Date(a.submittedAt) - new Date(b.submittedAt);
    if (sortBy === 'highest') return b.score - a.score;
    if (sortBy === 'lowest') return a.score - b.score;
    return 0;
  });

  if (loading) return (
    <div className="h-screen w-full flex items-center justify-center bg-transparent relative z-10">
      <Loader2 className="animate-spin text-indigo-500" size={48} />
    </div>
  );

  return (
    <div className="max-w-5xl mx-auto p-6 min-h-screen pt-8 relative z-10">
      <button 
        onClick={() => navigate('/submissions')} 
        className="flex items-center gap-2 text-slate-400 hover:text-white transition-colors mb-6 w-fit"
      >
        <ArrowLeft size={18} /> Back to Forms
      </button>

      {/* Header with Sorting UI */}
      <div className="flex flex-col md:flex-row md:items-end justify-between gap-4 mb-8">
        <div>
          <h1 className="text-3xl font-bold text-white mb-2">Collected Responses</h1>
          <p className="text-slate-400">All submissions submitted by users for this module.</p>
        </div>
        
        {responses.length > 0 && (
          <div className="flex items-center gap-2 bg-white/5 border border-white/10 rounded-xl px-4 py-2 backdrop-blur-md">
            <ArrowUpDown size={16} className="text-indigo-400" />
            <select 
              value={sortBy} 
              onChange={(e) => setSortBy(e.target.value)}
              className="bg-transparent border-none text-white text-sm font-medium focus:ring-0 cursor-pointer outline-none [&>option]:bg-slate-900"
            >
              <option value="newest">Newest First</option>
              <option value="oldest">Oldest First</option>
              <option value="highest">Highest Score</option>
              <option value="lowest">Lowest Score</option>
            </select>
          </div>
        )}
      </div>

      {responses.length === 0 ? (
        <div className="text-center py-20 border border-white/10 rounded-2xl bg-white/5 backdrop-blur-md">
          <User className="mx-auto text-slate-500 mb-4" size={48} />
          <h3 className="text-xl text-white font-semibold">No responses yet</h3>
          <p className="text-slate-400 mt-2">Share your form link to start receiving submissions.</p>
        </div>
      ) : (
        <div className="grid gap-4">
          {sortedResponses.map((sub, index) => (
            <motion.div 
              key={sub._id}
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: index * 0.05 }}
              onClick={() => navigate(`/submission/${sub._id}`)}
              className="group cursor-pointer glass-card p-6 border border-white/10 bg-white/5 hover:bg-white/10 transition-all rounded-xl flex flex-col md:flex-row md:items-center justify-between gap-4"
            >
              <div className="flex items-center gap-4">
                <div className="w-12 h-12 rounded-full bg-gradient-to-br from-indigo-500 to-purple-500 flex items-center justify-center text-white font-bold text-lg shadow-lg">
                  {(sub.username || sub.userEmail || "A")[0].toUpperCase()}
                </div>
                <div>
                  <h3 className="text-lg font-bold text-white group-hover:text-indigo-400 transition-colors">
                    {sub.username || sub.userEmail || "Anonymous User"}
                  </h3>
                  <div className="flex items-center gap-4 text-xs text-slate-400 mt-1 font-mono">
                    <span className="flex items-center gap-1">
                      <Calendar size={12} /> {new Date(sub.submittedAt).toLocaleDateString()}
                    </span>
                    <span className="flex items-center gap-1">
                      <Clock size={12} /> {new Date(sub.submittedAt).toLocaleTimeString()}
                    </span>
                  </div>
                </div>
              </div>

              <div className="flex flex-row items-center gap-6 justify-between md:justify-end border-t border-white/10 md:border-none pt-4 md:pt-0">
                {/* Integrity Flags Badge */}
                {sub.integrityFlags && sub.integrityFlags.length > 0 && (
                  <div className="flex items-center gap-1.5 px-3 py-1 rounded-full bg-rose-500/10 text-rose-400 border border-rose-500/20 text-xs font-bold">
                    <ShieldAlert size={14} />
                    {sub.integrityFlags.length} Flags
                  </div>
                )}

                <div className="text-right">
                  <p className="text-[10px] font-mono text-slate-500 uppercase tracking-wider">Score</p>
                  <p className={`text-xl font-bold ${
                    (sub.score / sub.totalMarks) >= 0.5 ? 'text-emerald-400' : 'text-rose-400'
                  }`}>
                    {sub.score} <span className="text-sm text-slate-500">/ {sub.totalMarks}</span>
                  </p>
                </div>
                
                <div className="p-2 rounded-full border border-white/10 text-slate-400 group-hover:bg-white group-hover:text-black transition-all">
                  <ChevronRight size={20} />
                </div>
              </div>
            </motion.div>
          ))}
        </div>
      )}
    </div>
  );
}