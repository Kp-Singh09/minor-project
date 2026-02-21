// client/src/pages/SubmissionDetail.jsx
import { useState, useEffect } from 'react';
import { useParams } from 'react-router-dom';
import { motion } from 'framer-motion';
import { BrainCircuit, CheckCircle, AlertCircle, Loader2, Award } from 'lucide-react';
import api from '../api/axiosConfig';

export default function SubmissionDetail() {
  const { id } = useParams();
  const [data, setData] = useState(null);
  const [isEvaluating, setIsEvaluating] = useState(false);

  const runAIEvaluation = async () => {
    setIsEvaluating(true);
    try {
      const res = await api.post(`/responses/${id}/evaluate`);
      setData({ ...data, aiScore: res.data.score, aiFeedback: res.data.feedback });
    } catch (err) {
      console.error("AI Analysis failed");
    } finally {
      setIsEvaluating(false);
    }
  };

  return (
    <div className="max-w-4xl mx-auto pb-24">
      <header className="mb-12">
        <h2 className="text-4xl font-bold text-white mb-2">Analysis Terminal</h2>
        <p className="text-white/40 font-mono text-xs uppercase tracking-widest">ID: {id}</p>
      </header>

      <div className="grid gap-8">
        {/* Student Response Card */}
        <div className="glass-card p-8 border-white/5">
          <p className="text-[10px] font-mono text-white/20 uppercase tracking-widest mb-4">Original Response</p>
          <p className="text-xl text-white leading-relaxed">"The quick brown fox jumps over the lazy dog..."</p>
        </div>

        {/* AI Action Area */}
        <div className="flex justify-center">
          <button 
            onClick={runAIEvaluation}
            disabled={isEvaluating}
            className="px-10 py-4 rounded-2xl bg-indigo-500 text-white font-bold flex items-center gap-3 hover:bg-indigo-400 transition-all shadow-lg shadow-indigo-500/20 disabled:opacity-50"
          >
            {isEvaluating ? <Loader2 className="animate-spin" size={20} /> : <BrainCircuit size={20} />}
            {data?.aiScore ? "Re-evaluate with AI" : "Initialize Semantic Analysis"}
          </button>
        </div>

        {/* Results Card */}
        <AnimatePresence>
          {data?.aiScore && (
            <motion.div 
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              className="glass-card p-12 border-indigo-500/30 bg-indigo-500/5 relative overflow-hidden"
            >
              <div className="absolute top-0 right-0 p-8 opacity-10">
                <Award size={120} className="text-indigo-400" />
              </div>
              
              <div className="flex items-center gap-4 mb-8">
                <div className="text-5xl font-black text-indigo-400">{data.aiScore}%</div>
                <div className="h-10 w-px bg-white/10" />
                <div className="text-xs font-mono text-white/40 uppercase tracking-widest">Neural Accuracy Score</div>
              </div>

              <div className="space-y-6">
                <div className="flex gap-4">
                  <CheckCircle className="text-green-500 shrink-0" size={20} />
                  <p className="text-white/70 leading-relaxed">{data.aiFeedback}</p>
                </div>
              </div>
            </motion.div>
          )}
        </AnimatePresence>
      </div>
    </div>
  );
}