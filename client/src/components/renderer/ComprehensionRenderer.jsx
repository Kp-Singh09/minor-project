// client/src/components/renderer/ComprehensionRenderer.jsx
import { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';

const ComprehensionRenderer = ({ question, onAnswerChange, savedAnswer, isChatMode = false }) => {
  const content = question.content || {};
  const passage = content.comprehensionPassage || '';
  const mcqs = content.mcqs || [];
  const [answers, setAnswers] = useState(savedAnswer || {});

  const handleSelect = (qIndex, option) => {
    const newAnswers = { ...answers, [qIndex]: option };
    setAnswers(newAnswers);
    onAnswerChange(question._id, newAnswers);
  };

  // If in chat mode, only show the next question if the current one is answered.
  // This sends the questions to the user one by one dynamically.
  const visibleQuestionsCount = isChatMode ? Object.keys(answers).length + 1 : mcqs.length;
  const visibleMcqs = mcqs.slice(0, visibleQuestionsCount);

  return (
    <div className="rounded-2xl overflow-hidden shadow-2xl border bg-slate-900 border-emerald-500/20 relative w-full">
      <div className="absolute top-0 left-0 w-full h-1 bg-gradient-to-r from-emerald-500 to-teal-500 z-10"></div>
      
      <div className="flex flex-col relative mt-1">
        {/* Passage Section - Now spans full width on top */}
        <div className="p-6 md:p-8 bg-white/[0.02] border-b border-white/10">
            <h4 className="text-xs font-bold text-emerald-400 uppercase tracking-widest mb-4">Reading Passage</h4>
            <div className="bg-black/20 p-5 rounded-xl border border-white/5">
                <p className="whitespace-pre-wrap leading-relaxed text-[1.05rem] text-white/90">{passage}</p>
            </div>
        </div>

        {/* Questions Section - Stacks vertically below the passage */}
        <div className="p-6 md:p-8 space-y-8">
            <AnimatePresence>
                {visibleMcqs.map((mcq, idx) => (
                    <motion.div 
                        key={idx} 
                        initial={isChatMode ? { opacity: 0, y: 20 } : false}
                        animate={{ opacity: 1, y: 0 }}
                        className="bg-white/5 p-6 rounded-xl border border-white/10"
                    >
                        <p className="font-semibold text-xl mb-6 text-white">{idx + 1}. {mcq.questionText}</p>
                        <div className="space-y-3">
                            {mcq.options.map((opt, oIdx) => (
                                <label key={oIdx} className={`flex items-center p-4 rounded-xl border cursor-pointer transition-colors ${
                                    answers[idx] === opt ? 'bg-emerald-500/20 border-emerald-500/50 shadow-inner' : 'bg-black/20 border-white/5 hover:bg-white/10'
                                }`}>
                                    <input 
                                        type="radio" 
                                        name={`comp-${question._id}-${idx}`} 
                                        checked={answers[idx] === opt} 
                                        onChange={() => handleSelect(idx, opt)} 
                                        className="mr-4 h-5 w-5 accent-emerald-500 cursor-pointer" 
                                    />
                                    <span className="text-lg text-white/80">{opt}</span>
                                </label>
                            ))}
                        </div>
                    </motion.div>
                ))}
            </AnimatePresence>
        </div>
      </div>
    </div>
  );
};

export default ComprehensionRenderer;