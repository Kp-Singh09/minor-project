// client/src/pages/SubmissionsPage.jsx
import { useState, useEffect } from 'react';
import { useUser } from '@clerk/clerk-react';
import { useNavigate } from 'react-router-dom';
import axios from '../api/axiosConfig';
import { motion } from 'framer-motion';
import { Loader2, Layout, Users, ChevronRight } from 'lucide-react';

export default function SubmissionsPage() {
  const { user } = useUser();
  const navigate = useNavigate();
  const [forms, setForms] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (user) {
      const fetchUserForms = async () => {
        try {
          const response = await axios.get(`/api/forms/user/${user.id}`);
          // Sort forms by creation date (Newest First)
          const sortedForms = response.data.sort((a, b) => new Date(b.createdAt) - new Date(a.createdAt));
          setForms(sortedForms);
        } catch (error) {
          console.error("Failed to fetch user forms", error);
        } finally {
          setLoading(false);
        }
      };
      fetchUserForms();
    }
  }, [user]);

  if (loading) return (
    <div className="h-[70vh] w-full flex items-center justify-center">
      <Loader2 className="animate-spin text-indigo-500" size={48} />
    </div>
  );

  return (
    <div className="max-w-5xl mx-auto p-6 min-h-screen pt-8 relative z-10">
      <h1 className="text-3xl font-bold text-white mb-2">Form Submissions</h1>
      <p className="text-slate-400 mb-8">Select a form to view the responses you've received.</p>
      
      {forms.length > 0 ? (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          {forms.map((form, index) => (
            <motion.div 
              key={form._id} 
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: index * 0.05 }}
              onClick={() => navigate(`/submissions/${form._id}`)}
              className="bg-white/5 border border-white/10 hover:border-indigo-500/50 hover:bg-white/10 transition-all p-6 rounded-2xl cursor-pointer group flex justify-between items-center backdrop-blur-md"
            >
              <div>
                <h2 className="text-xl font-bold text-white mb-2 truncate max-w-[250px] group-hover:text-indigo-300">
                  {form.title}
                </h2>
                <div className="flex items-center gap-2 text-sm text-slate-400 font-mono">
                  <Users size={14} />
                  <span>{form.responses?.length || 0} Responses received</span>
                </div>
              </div>
              <div className="w-10 h-10 rounded-full bg-white/5 border border-white/10 flex items-center justify-center text-slate-400 group-hover:bg-indigo-500 group-hover:text-white transition-all">
                <ChevronRight size={20} />
              </div>
            </motion.div>
          ))}
        </div>
      ) : (
        <div className="text-center py-20 border border-white/10 rounded-3xl bg-white/[0.02] backdrop-blur-xl">
          <Layout className="mx-auto text-slate-500 mb-6" size={56} strokeWidth={1.5} />
          <h3 className="text-2xl font-bold text-white">No forms deployed</h3>
          <p className="text-slate-400 mt-3 max-w-sm mx-auto">Create a new form to start collecting responses.</p>
          <button 
            onClick={() => navigate('/editor/new')}
            className="mt-8 px-8 py-3 bg-white text-black font-bold rounded-xl hover:bg-indigo-50 transition-colors"
          >
            Create Form
          </button>
        </div>
      )}
    </div>
  );
}