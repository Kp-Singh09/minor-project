// client/src/pages/SubmissionDetail.jsx
import { useEffect, useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import axios from '../api/axiosConfig';
import { motion } from 'framer-motion';
import { ArrowLeft, Clock, Award, ShieldAlert, Download, FileText } from 'lucide-react';
import { GlassButton } from '../components/ui/GlassButton';
import toast from 'react-hot-toast';

export default function SubmissionDetail() {
  const { responseId } = useParams();
  const navigate = useNavigate();
  const [response, setResponse] = useState(null);
  const [loading, setLoading] = useState(true);
  const [downloading, setDownloading] = useState(false);

  useEffect(() => {
    const fetchResponse = async () => {
      try {
        const res = await axios.get(`/api/responses/single/${responseId}`);
        setResponse(res.data);
      } catch (err) {
        toast.error('Failed to load submission.');
      } finally {
        setLoading(false);
      }
    };
    fetchResponse();
  }, [responseId]);

  const handleDownloadPDF = async () => {
    try {
      setDownloading(true);
      // We use standard fetch here to handle the Blob (binary data) for PDF
      const response = await fetch(`${import.meta.env.VITE_API_BASE_URL}/api/reports/download/${responseId}`);
      
      if (!response.ok) throw new Error("Download failed");

      const blob = await response.blob();
      const url = window.URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.href = url;
      a.download = `Report-${responseId}.pdf`;
      document.body.appendChild(a);
      a.click();
      window.URL.revokeObjectURL(url);
      document.body.removeChild(a);
      
      toast.success("Report Downloaded");
    } catch (err) {
      console.error(err);
      toast.error("Failed to generate PDF");
    } finally {
      setDownloading(false);
    }
  };

  if (loading) return <div className="p-8 text-white">Loading details...</div>;
  if (!response) return <div className="p-8 text-white">Submission not found.</div>;

  return (
    <div className="min-h-screen bg-slate-950 text-white p-6 md:p-12 font-sans">
      <div className="max-w-4xl mx-auto space-y-8">
        
        {/* Header */}
        <div className="flex justify-between items-center">
          <button 
            onClick={() => navigate(-1)} 
            className="flex items-center gap-2 text-slate-400 hover:text-white transition-colors"
          >
            <ArrowLeft size={18} /> Back
          </button>
          
          {/* Download Button */}
          <GlassButton 
            onClick={handleDownloadPDF}
            disabled={downloading}
            className="flex items-center gap-2 bg-indigo-600/20 text-indigo-300 border-indigo-500/50 hover:bg-indigo-600/30"
          >
            {downloading ? <Clock size={18} className="animate-spin" /> : <Download size={18} />}
            {downloading ? "Generating..." : "Download Report"}
          </GlassButton>
        </div>

        {/* Score Card */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          <motion.div 
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            className="glass-card p-6 border-l-4 border-l-emerald-500 bg-slate-900/50"
          >
            <div className="flex items-center gap-3 mb-2">
              <Award className="text-emerald-400" />
              <h3 className="text-sm font-bold text-slate-400 uppercase">Score</h3>
            </div>
            <p className="text-3xl font-bold text-white">
              {response.score} <span className="text-lg text-slate-500">/ {response.totalMarks}</span>
            </p>
          </motion.div>

          <motion.div 
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.1 }}
            className="glass-card p-6 border-l-4 border-l-blue-500 bg-slate-900/50"
          >
            <div className="flex items-center gap-3 mb-2">
              <Clock className="text-blue-400" />
              <h3 className="text-sm font-bold text-slate-400 uppercase">Submitted</h3>
            </div>
            <p className="text-lg font-medium text-white">
              {new Date(response.submittedAt).toLocaleDateString()}
            </p>
            <p className="text-xs text-slate-500">
              {new Date(response.submittedAt).toLocaleTimeString()}
            </p>
          </motion.div>

          <motion.div 
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.2 }}
            className="glass-card p-6 border-l-4 border-l-rose-500 bg-slate-900/50"
          >
            <div className="flex items-center gap-3 mb-2">
              <ShieldAlert className="text-rose-400" />
              <h3 className="text-sm font-bold text-slate-400 uppercase">Integrity</h3>
            </div>
            <p className="text-3xl font-bold text-white">
              {response.integrityFlags?.length || 0} <span className="text-sm font-normal text-slate-500">Flags</span>
            </p>
          </motion.div>
        </div>

        {/* AI Analysis */}
        {response.aiFeedback && (
          <div className="glass-card p-6 border border-white/5 bg-gradient-to-br from-indigo-900/20 to-purple-900/20">
            <h3 className="text-lg font-bold text-white mb-3 flex items-center gap-2">
              <FileText size={20} className="text-indigo-400" /> AI Evaluation
            </h3>
            <p className="text-slate-300 leading-relaxed italic">
              "{response.aiFeedback}"
            </p>
          </div>
        )}

        {/* Question Breakdown */}
        <div className="space-y-4">
           <h2 className="text-xl font-bold text-white mb-4">Response Breakdown</h2>
           {response.answers.map((ans, idx) => (
             <div key={idx} className="glass-card p-4 border border-white/5">
                <div className="flex justify-between mb-2">
                   <span className="text-sm text-slate-400">Question ID: {ans.questionId}</span>
                   <span className={`text-sm font-bold ${ans.points > 0 ? 'text-green-400' : 'text-red-400'}`}>
                     {ans.points} Pts
                   </span>
                </div>
                <div className="bg-black/30 p-3 rounded-lg text-slate-200 font-mono text-sm">
                   {typeof ans.answer === 'object' ? JSON.stringify(ans.answer) : ans.answer}
                </div>
             </div>
           ))}
        </div>

      </div>
    </div>
  );
}