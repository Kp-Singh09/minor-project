// client/src/pages/SubmissionsPage.jsx
import { useEffect, useState } from 'react';
import { useAuth } from '@clerk/clerk-react';
import { useNavigate } from 'react-router-dom';
import axios from '../api/axiosConfig';
import { Loader2, FileText, Calendar, ChevronRight, Award, Clock } from 'lucide-react';
import { motion } from 'framer-motion';

export default function SubmissionsPage() {
  const { userId, isLoaded } = useAuth();
  const navigate = useNavigate();
  const [submissions, setSubmissions] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchSubmissions = async () => {
      if (!userId) return;
      try {
        const res = await axios.get(`/api/responses/user/${userId}`);
        setSubmissions(res.data);
      } catch (err) {
        console.error("Failed to fetch submissions", err);
      } finally {
        setLoading(false);
      }
    };

    if (isLoaded) fetchSubmissions();
  }, [isLoaded, userId]);

  if (loading) return (
    <div className="h-screen w-full flex items-center justify-center bg-slate-950">
      <Loader2 className="animate-spin text-indigo-500" size={48} />
    </div>
  );

  return (
    <div className="max-w-5xl mx-auto p-6 min-h-screen">
      <h1 className="text-3xl font-bold text-white mb-2">My Attempts</h1>
      <p className="text-slate-400 mb-8">History of your completed assessments.</p>

      {submissions.length === 0 ? (
        <div className="text-center py-20 border border-white/10 rounded-2xl bg-white/5">
          <FileText className="mx-auto text-slate-500 mb-4" size={48} />
          <h3 className="text-xl text-white font-semibold">No submissions yet</h3>
          <p className="text-slate-400 mt-2">Complete an assessment to see your results here.</p>
        </div>
      ) : (
        <div className="grid gap-4">
          {submissions.map((sub, index) => (
            <motion.div 
              key={sub._id}
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: index * 0.05 }}
              onClick={() => navigate(`/submission/${sub._id}`)} // Navigate to Detail View
              className="group cursor-pointer glass-card p-6 border border-white/10 bg-white/5 hover:bg-white/10 transition-all rounded-xl flex justify-between items-center"
            >
              <div className="flex items-center gap-4">
                <div className="p-3 rounded-lg bg-indigo-500/20 text-indigo-400">
                  <FileText size={24} />
                </div>
                <div>
                  <h3 className="text-lg font-bold text-white group-hover:text-indigo-400 transition-colors">
                    {sub.formId?.title || "Untitled Assessment"}
                  </h3>
                  <div className="flex items-center gap-4 text-xs text-slate-400 mt-1">
                    <span className="flex items-center gap-1">
                      <Calendar size={12} /> {new Date(sub.submittedAt).toLocaleDateString()}
                    </span>
                    <span className="flex items-center gap-1">
                      <Clock size={12} /> {new Date(sub.submittedAt).toLocaleTimeString()}
                    </span>
                  </div>
                </div>
              </div>

              <div className="flex items-center gap-6">
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