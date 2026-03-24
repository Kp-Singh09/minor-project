// client/src/pages/SubmissionDetail.jsx
import { useEffect, useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import axios from '../api/axiosConfig';
import { motion } from 'framer-motion';
import { ArrowLeft, Clock, Award, ShieldAlert, Download, FileText, CheckCircle2, XCircle, AlertCircle } from 'lucide-react';
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
        console.error(err);
        toast.error('Failed to load submission.');
      } finally {
        setLoading(false);
      }
    };
    if (responseId) fetchResponse();
  }, [responseId]);

  const handleDownloadPDF = async () => {
    try {
      setDownloading(true);
      const API_BASE = import.meta.env.VITE_API_BASE_URL || 'http://localhost:5000';
      const res = await fetch(`${API_BASE}/api/reports/download/${responseId}`);
      
      if (!res.ok) throw new Error("Download failed");

      const blob = await res.blob();
      const url = window.URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.href = url;
      a.download = `Report-${response.username || 'Candidate'}.pdf`;
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

  if (loading) return (
    <div className="h-screen w-full flex items-center justify-center bg-slate-950 text-white">
      <Clock className="animate-spin text-indigo-500 mr-3" /> Loading details...
    </div>
  );
  
  if (!response) return (
    <div className="h-screen w-full flex items-center justify-center bg-slate-950 text-white">
      Submission not found.
    </div>
  );

  const percentage = response.totalMarks > 0 
    ? ((response.score / response.totalMarks) * 100).toFixed(2) 
    : 0;

  // Render logic for different question types
  const renderAnswerDetails = (type, content, userAnswer, isCorrect) => {
    if (!content) return null;

    // --- CLOZE RENDERER ---
    if (type === 'Cloze') {
      const passage = content.passage || '';
      const parts = passage.split('[BLANK]');
      const correctClozeAnswers = content.options || [];

      return (
        <div className="mt-4 space-y-4 text-sm text-slate-300 leading-loose bg-white/5 p-6 rounded-lg border border-white/5">
          {parts.map((part, index) => {
            const uAns = userAnswer ? userAnswer[index] : null;
            const cAns = correctClozeAnswers[index];
            const isBlankCorrect = String(uAns).trim().toLowerCase() === String(cAns).trim().toLowerCase();

            return (
              <span key={index}>
                {part}
                {index < parts.length - 1 && (
                  <span className={`inline-flex items-center gap-1 px-2 py-0.5 mx-1 rounded border-b-2 font-bold ${
                    !uAns ? 'border-slate-500 text-slate-500 bg-black/20' :
                    isBlankCorrect ? 'border-emerald-500 text-emerald-400 bg-emerald-500/10' :
                    'border-rose-500 text-rose-400 bg-rose-500/10'
                  }`}>
                    {uAns || "No Answer"}
                    {!isBlankCorrect && uAns && (
                       <span className="text-emerald-400 ml-1">
                          (Correct: {cAns})
                       </span>
                    )}
                  </span>
                )}
              </span>
            );
          })}
        </div>
      );
    }

    if (['MultipleChoice', 'Dropdown', 'PictureChoice', 'ShortAnswer', 'Email', 'LongAnswer'].includes(type)) {
      return (
        <div className="mt-4 space-y-3 text-sm">
          <div className="bg-white/5 p-3 rounded-lg border border-white/5">
            <span className="text-slate-400 block mb-1 font-mono text-xs uppercase tracking-wider">Your Answer:</span>
            <span className="text-white font-medium">{String(userAnswer || 'No Answer Provided')}</span>
          </div>
          {!isCorrect && content.correctAnswer && (
            <div className="bg-emerald-500/10 p-3 rounded-lg border border-emerald-500/20">
              <span className="text-emerald-400 block mb-1 font-mono text-xs uppercase tracking-wider">Correct Answer:</span>
              <span className="text-emerald-300 font-medium">{String(content.correctAnswer)}</span>
            </div>
          )}
        </div>
      );
    }

    if (type === 'Checkbox') {
      const userArr = Array.isArray(userAnswer) ? userAnswer : [];
      const correctArr = Array.isArray(content.correctAnswers) ? content.correctAnswers : [];
      
      return (
        <div className="mt-4 space-y-3 text-sm">
          <div className="bg-white/5 p-3 rounded-lg border border-white/5">
            <span className="text-slate-400 block mb-1 font-mono text-xs uppercase tracking-wider">Your Answer:</span>
            <span className="text-white font-medium">{userArr.length > 0 ? userArr.join(', ') : 'No Answer Provided'}</span>
          </div>
          {!isCorrect && correctArr.length > 0 && (
            <div className="bg-emerald-500/10 p-3 rounded-lg border border-emerald-500/20">
              <span className="text-emerald-400 block mb-1 font-mono text-xs uppercase tracking-wider">Correct Answer:</span>
              <span className="text-emerald-300 font-medium">{correctArr.join(', ')}</span>
            </div>
          )}
        </div>
      );
    }

    if (type === 'Categorize') {
      const correctMapping = {};
      if (content.items) {
        content.items.forEach(item => {
          if (!correctMapping[item.category]) correctMapping[item.category] = [];
          correctMapping[item.category].push(item.text);
        });
      }

      return (
        <div className="mt-4 grid grid-cols-1 md:grid-cols-2 gap-4 text-sm">
          <div className="bg-white/5 p-4 rounded-lg border border-white/5">
            <span className="text-slate-400 block mb-3 font-mono text-xs uppercase tracking-wider border-b border-white/10 pb-2">Your Answer:</span>
            {userAnswer ? Object.entries(userAnswer).map(([cat, items]) => (
              <div key={cat} className="mb-3 last:mb-0">
                <span className="text-indigo-300 font-bold block">{cat}:</span>
                <span className="text-white">{Array.isArray(items) ? items.join(', ') : items}</span>
              </div>
            )) : <span className="text-white">No Answer Provided</span>}
          </div>
          
          {!isCorrect && (
            <div className="bg-emerald-500/10 p-4 rounded-lg border border-emerald-500/20">
              <span className="text-emerald-400 block mb-3 font-mono text-xs uppercase tracking-wider border-b border-emerald-500/20 pb-2">Correct Answer:</span>
              {Object.entries(correctMapping).map(([cat, items]) => (
                <div key={cat} className="mb-3 last:mb-0">
                  <span className="text-emerald-400 font-bold block">{cat}:</span>
                  <span className="text-emerald-200">{items.join(', ')}</span>
                </div>
              ))}
            </div>
          )}
        </div>
      );
    }

    if (type === 'Comprehension') {
      const passage = content.comprehensionPassage || content.text || '';
      return (
        <div className="mt-4 space-y-4">
          <div className="p-4 bg-white/5 rounded-lg border border-white/10 text-slate-300 text-sm italic">
            {passage}
          </div>
          {content.mcqs && content.mcqs.map((mcq, i) => {
            // BUG FIX: Intelligently check for both the MongoDB _id AND the array index (0, 1, 2)
            const uAns = userAnswer ? (userAnswer[mcq._id?.toString()] || userAnswer[i?.toString()] || userAnswer[i]) : null;
            
            // Safe, case-insensitive string comparison
            const isMcqCorrect = String(uAns || '').trim().toLowerCase() === String(mcq.correctAnswer || '').trim().toLowerCase();
            
            return (
              <div key={mcq._id || i} className="bg-black/20 p-4 rounded-lg border border-white/5 text-sm">
                <p className="text-white font-medium mb-3">Q{i+1}: {mcq.question || mcq.questionText}</p>
                <div className="flex flex-col gap-2">
                  <div className="flex items-center gap-2">
                     <span className="text-slate-400 w-24">Your Answer:</span>
                     <span className={isMcqCorrect ? "text-emerald-400" : "text-rose-400"}>
                        {uAns || "No Answer"}
                     </span>
                  </div>
                  {!isMcqCorrect && (
                    <div className="flex items-center gap-2">
                       <span className="text-slate-400 w-24">Correct:</span>
                       <span className="text-emerald-400">{mcq.correctAnswer}</span>
                    </div>
                  )}
                </div>
              </div>
            );
          })}
        </div>
      );
    }

    return (
      <div className="mt-4 bg-white/5 p-3 rounded-lg border border-white/5 text-sm font-mono overflow-x-auto text-slate-300">
        <span className="text-xs text-slate-500 block mb-1">Raw Output:</span>
        {typeof userAnswer === 'object' ? JSON.stringify(userAnswer, null, 2) : String(userAnswer)}
      </div>
    );
  };

  return (
    <div className="min-h-screen bg-slate-950 text-white p-6 md:p-12 font-sans relative z-10">
      <div className="max-w-4xl mx-auto space-y-8">
        
        {/* Navigation Header */}
        <div className="flex justify-between items-center">
          <button 
            onClick={() => navigate(-1)} 
            className="flex items-center gap-2 text-slate-400 hover:text-white transition-colors"
          >
            <ArrowLeft size={18} /> Back
          </button>
          
          <GlassButton 
            onClick={handleDownloadPDF}
            disabled={downloading}
            className="flex items-center gap-2 bg-indigo-600/20 text-indigo-300 border-indigo-500/50 hover:bg-indigo-600/30"
          >
            {downloading ? <Clock size={18} className="animate-spin" /> : <Download size={18} />}
            {downloading ? "Generating..." : "Download Report"}
          </GlassButton>
        </div>

        {/* Results Header */}
        <div className="text-center pb-8 border-b border-white/10">
           <h2 className="text-slate-400 mb-2 font-mono uppercase tracking-widest text-sm">
             Results for <span className="text-white">{response.userEmail}</span>
           </h2>
           <h1 className="text-6xl font-black text-transparent bg-clip-text bg-gradient-to-r from-indigo-400 to-purple-400 mb-4">
             {percentage}%
           </h1>
           <p className="text-xl text-slate-300">
              Score: <span className="font-bold text-white">{response.score}</span> / {response.totalMarks}
           </p>
        </div>

        {/* Answer Breakdown Title */}
        <h2 className="text-2xl font-bold text-white mb-6 flex items-center gap-3">
          <FileText className="text-indigo-400" /> Answer Breakdown
        </h2>

        {/* Dynamic Question Mapping */}
        <div className="space-y-6">
           {response.answers.map((ans, idx) => {
             const question = ans.questionId;
             if (!question || ['Heading', 'Paragraph', 'Banner'].includes(question.type)) return null;

             const content = question.content || {};
             const qText = content.question || content.text || `Question ${idx + 1}`;
             
             const maxPoints = 10; 
             const isCorrect = ans.points >= maxPoints;
             const isPartiallyCorrect = ans.points > 0 && ans.points < maxPoints;
             const isUnscorable = !['Comprehension', 'Categorize', 'Cloze', 'MultipleChoice', 'Checkbox', 'Dropdown', 'PictureChoice'].includes(question.type);

             return (
               <div key={idx} className="glass-card p-6 border border-white/5 rounded-2xl bg-white/[0.02]">
                  {/* Question Header */}
                  <div className="flex justify-between items-start gap-4 mb-4">
                     <h3 className="text-lg font-medium text-white leading-relaxed">
                       <span className="text-slate-500 mr-2 font-mono text-sm">Question #{idx + 1}:</span> 
                       {qText}
                     </h3>
                     <span className="text-slate-400 font-mono text-sm whitespace-nowrap bg-black/30 px-3 py-1 rounded-full">
                       ({ans.points}/{isUnscorable ? '-' : maxPoints} pts)
                     </span>
                  </div>

                  {/* Status Badge */}
                  {!isUnscorable && (
                    <div className="mb-4">
                      {isCorrect ? (
                        <div className="inline-flex items-center gap-1.5 text-emerald-400 bg-emerald-400/10 px-3 py-1 rounded-full text-xs font-bold uppercase tracking-wider border border-emerald-400/20">
                           <CheckCircle2 size={14} /> Correct
                        </div>
                      ) : isPartiallyCorrect ? (
                        <div className="inline-flex items-center gap-1.5 text-amber-400 bg-amber-400/10 px-3 py-1 rounded-full text-xs font-bold uppercase tracking-wider border border-amber-400/20">
                           <AlertCircle size={14} /> Partially Correct
                        </div>
                      ) : (
                        <div className="inline-flex items-center gap-1.5 text-rose-400 bg-rose-400/10 px-3 py-1 rounded-full text-xs font-bold uppercase tracking-wider border border-rose-400/20">
                           <XCircle size={14} /> Incorrect
                        </div>
                      )}
                    </div>
                  )}

                  {/* Dynamic Answer Renderer */}
                  {renderAnswerDetails(question.type, content, ans.answer, isCorrect)}
               </div>
             );
           })}
        </div>

      </div>
    </div>
  );
}