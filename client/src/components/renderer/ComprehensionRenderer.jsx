import { useState, useEffect } from 'react';

const ComprehensionRenderer = ({ question, onAnswerChange, theme, savedAnswer }) => {
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
    <div className={`rounded-lg overflow-hidden border ${theme.cardBg} border-white/10`}>
      {/* Split View */}
      <div className="grid grid-cols-1 md:grid-cols-2">
        {/* Passage (Left) */}
        <div className="p-6 bg-white/5 border-r border-white/10 max-h-[500px] overflow-y-auto">
            <h4 className="text-sm font-bold text-indigo-400 uppercase mb-3">Reading Passage</h4>
            <p className={`whitespace-pre-wrap leading-relaxed ${theme.text}`}>{passage}</p>
        </div>

        {/* Questions (Right) */}
        <div className="p-6 space-y-8 max-h-[500px] overflow-y-auto">
            {mcqs.map((mcq, idx) => (
                <div key={idx}>
                    <p className={`font-semibold mb-3 ${theme.text}`}>
                        {idx + 1}. {mcq.questionText}
                    </p>
                    <div className="space-y-2">
                        {mcq.options.map((opt, oIdx) => (
                            <label 
                                key={oIdx} 
                                className={`flex items-center p-3 rounded-lg border cursor-pointer transition-colors ${
                                    answers[idx] === opt 
                                        ? 'bg-indigo-500/20 border-indigo-500/50' 
                                        : 'bg-black/20 border-transparent hover:bg-white/5'
                                }`}
                            >
                                <input 
                                    type="radio" 
                                    name={`comp-${question._id}-${idx}`}
                                    checked={answers[idx] === opt}
                                    onChange={() => handleSelect(idx, opt)}
                                    className="mr-3 accent-indigo-500"
                                />
                                <span className="text-sm text-slate-300">{opt}</span>
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