// client/src/pages/SubmissionDetail.jsx
import { useState, useEffect } from 'react';
import { useParams } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';
import { BrainCircuit, CheckCircle, Loader2, Award, Download, ArrowLeft } from 'lucide-react';
import api from '../api/axiosConfig';
import ReportTemplate from '../components/Analytics/ReportTemplate';

export default function SubmissionDetail() {
  const { id } = useParams();
  const [data, setData] = useState(null);
  const [isEvaluating, setIsEvaluating] = useState(false);

  useEffect(() => {
    const fetchDetail = async () => {
      try {
        const res = await api.get(`/responses/${id}`);
        setData(res.data);
      } catch (err) { console.error(err); }
    };
    fetchDetail();
  }, [id]);

  const handlePrint = () => {
    window.print();
  };

  if (!data) return <div className="h-screen flex items-center justify-center"><Loader2 className="animate-spin text-indigo-500" /></div>;

  return (
    <div className="max-w-4xl mx-auto pb-24 relative">
      {/* HIDDEN REPORT FOR PRINTING */}
      <ReportTemplate data={data} />

      {/* UI HEADER */}
      <header className="flex justify-between items-end mb-12 print:hidden">
        <div>
          <button onClick={() => window.history.back()} className="text-white/20 hover:text-white mb-4 flex items-center gap-2 transition-colors">
            <ArrowLeft size={16} /> Back to Feed
          </button>
          <h2 className="text-5xl font-extrabold tracking-tighter text-white">Analysis Terminal</h2>
          <p className="text-white/40 font-mono text-[10px] mt-2 uppercase tracking-widest">Secure Handshake: {id}</p>
        </div>

        <button 
          onClick={handlePrint}
          className="p-4 rounded-2xl bg-white/5 border border-white/10 text-white hover:bg-white/10 transition-all flex items-center gap-2"
        >
          <Download size={18} /> <span className="text-xs font-bold uppercase tracking-widest">Export PDF</span>
        </button>
      </header>

      {/* ANALYSIS CARDS */}
      <div className="grid gap-8 print:hidden">
        <div className="glass-card p-12 border-white/5">
          <div className="flex justify-between items-start mb-8">
            <div>
              <p className="text-[10px] font-mono text-white/20 uppercase tracking-widest mb-1">Participant</p>
              <h3 className="text-3xl font-bold text-white">{data.respondentName}</h3>
            </div>
            <div className="text-right">
              <p className="text-[10px] font-mono text-white/20 uppercase tracking-widest mb-1">Status</p>
              <span className="px-3 py-1 rounded-full bg-green-500/10 text-green-400 text-[10px] font-bold border border-green-500/20">
                VERIFIED
              </span>
            </div>
          </div>

          <div className="h-px bg-white/5 w-full mb-8" />

          <div className="flex items-center gap-8">
            <div className="flex flex-col">
              <span className="text-5xl font-black text-indigo-500">{data.score}%</span>
              <span className="text-[10px] font-mono text-white/20 uppercase mt-2">Accuracy Rate</span>
            </div>
            <div className="w-px h-16 bg-white/5" />
            <div className="flex flex-col">
              <span className="text-5xl font-black text-white">{data.violations?.length || 0}</span>
              <span className="text-[10px] font-mono text-white/20 uppercase mt-2">Integrity Flags</span>
            </div>
          </div>
        </div>

        {/* AI EVALUATION SECTION */}
        <div className="glass-card p-1 border-indigo-500/20 bg-indigo-500/5">
          <div className="p-12">
            <div className="flex items-center gap-4 mb-8">
              <div className="p-3 rounded-2xl bg-indigo-500/20 text-indigo-400">
                <BrainCircuit size={24} />
              </div>
              <h3 className="text-xl font-bold text-white">Neural Feedback</h3>
            </div>
            <p className="text-lg text-white/70 leading-relaxed italic mb-8">
              "{data.aiFeedback || 'Semantic evaluation pending. Initialize AI to analyze the depth of responses.'}"
            </p>
            {!data.aiFeedback && (
              <button 
                className="w-full py-4 rounded-xl bg-white text-black font-black uppercase tracking-widest text-xs hover:bg-indigo-50 transition-all flex items-center justify-center gap-2"
              >
                <BrainCircuit size={16} /> Run Neural Assessment
              </button>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}