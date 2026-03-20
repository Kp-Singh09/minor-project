import { useState, useEffect } from 'react';

const MultipleChoiceRenderer = ({ question, onAnswerChange, savedAnswer }) => {
  const [selected, setSelected] = useState(savedAnswer || null);
  const content = question.content || {};
  const text = content.question || content.text || 'Question Text';
  const options = content.options || [];

  useEffect(() => { if (savedAnswer) setSelected(savedAnswer); }, [savedAnswer]);

  const handleSelection = (option) => {
    setSelected(option);
    onAnswerChange(question._id, option);
  };

  return (
    <div className="p-8 rounded-2xl shadow-xl border bg-slate-900 border-indigo-500/20 relative overflow-hidden">
      <div className="absolute top-0 left-0 w-full h-1 bg-gradient-to-r from-indigo-500 to-blue-500"></div>
      <p className="font-semibold text-2xl mb-8 text-white">{text}</p>
      <div className="space-y-4">
        {options.map((option, index) => (
          <label 
            key={index} 
            className={`flex items-center p-5 rounded-xl cursor-pointer transition-all border ${
              selected === option ? 'bg-indigo-500/20 border-indigo-500/50 shadow-lg shadow-indigo-500/10' : 'bg-white/5 hover:bg-white/10 border-white/10'
            }`}
          >
            <input
              type="radio" name={`mcq-${question._id}`} checked={selected === option} onChange={() => handleSelection(option)}
              className="mr-5 h-6 w-6 accent-indigo-500"
            />
            <span className="text-white text-lg">{option}</span>
          </label>
        ))}
      </div>
    </div>
  );
};
export default MultipleChoiceRenderer;