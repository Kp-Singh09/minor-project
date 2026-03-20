import { useState } from 'react';

const ComprehensionRenderer = ({ question, onAnswerChange, savedAnswer }) => {
  const content = question.content || {};
  const passage = content.comprehensionPassage || '';
  const mcqs = content.mcqs || [];
  const [answers, setAnswers] = useState(savedAnswer || {});

  const handleSelect = (qIndex, option) => {
    const newAnswers = { ...answers, [qIndex]: option };
    setAnswers(newAnswers);
    onAnswerChange(question._id, newAnswers);
  };

  return (
    <div className="rounded-2xl overflow-hidden shadow-2xl border bg-slate-900 border-emerald-500/20 relative">
      <div className="absolute top-0 left-0 w-full h-1 bg-gradient-to-r from-emerald-500 to-teal-500 z-10"></div>
      <div className="grid grid-cols-1 md:grid-cols-2 relative mt-1">
        {/* Passage */}
        <div className="p-8 bg-white/[0.02] border-r border-white/10 max-h-[600px] overflow-y-auto">
            <h4 className="text-xs font-bold text-emerald-400 uppercase tracking-widest mb-6">Reading Passage</h4>
            <p className="whitespace-pre-wrap leading-relaxed text-lg text-white/90">{passage}</p>
        </div>
        {/* Questions */}
        <div className="p-8 space-y-10 max-h-[600px] overflow-y-auto">
            {mcqs.map((mcq, idx) => (
                <div key={idx} className="bg-white/5 p-6 rounded-xl border border-white/10">
                    <p className="font-semibold text-xl mb-6 text-white">{idx + 1}. {mcq.questionText}</p>
                    <div className="space-y-3">
                        {mcq.options.map((opt, oIdx) => (
                            <label key={oIdx} className={`flex items-center p-4 rounded-xl border cursor-pointer transition-colors ${
                                answers[idx] === opt ? 'bg-emerald-500/20 border-emerald-500/50 shadow-inner' : 'bg-black/20 border-white/5 hover:bg-white/10'
                            }`}>
                                <input type="radio" name={`comp-${question._id}-${idx}`} checked={answers[idx] === opt} onChange={() => handleSelect(idx, opt)} className="mr-4 h-5 w-5 accent-emerald-500" />
                                <span className="text-lg text-white/80">{opt}</span>
                            </label>
                        ))}
                    </div>
                </div>
            ))}
        </div>
      </div>
    </div>
  );
};
export default ComprehensionRenderer;