import { useState, useEffect } from 'react';

const CheckboxRenderer = ({ question, onAnswerChange, savedAnswer }) => {
  const [selected, setSelected] = useState(savedAnswer || []);
  const content = question.content || {};
  const text = content.question || content.text || 'Question';
  const options = content.options || [];

  useEffect(() => { if (Array.isArray(savedAnswer)) setSelected(savedAnswer); }, [savedAnswer]);

  const toggleOption = (option) => {
    const newSelection = selected.includes(option) ? selected.filter(item => item !== option) : [...selected, option];
    setSelected(newSelection);
    onAnswerChange(question._id, newSelection);
  };

  return (
    <div className="p-8 rounded-2xl shadow-xl border bg-slate-900 border-indigo-500/20 relative overflow-hidden">
      <div className="absolute top-0 left-0 w-full h-1 bg-gradient-to-r from-indigo-500 to-blue-500"></div>
      <p className="font-semibold text-2xl mb-8 text-white">{text}</p>
      <div className="space-y-4">
        {options.map((option, index) => (
          <label key={index} className="flex items-center p-5 rounded-xl bg-white/5 hover:bg-white/10 border border-white/10 cursor-pointer transition-colors">
            <input type="checkbox" checked={selected.includes(option)} onChange={() => toggleOption(option)} className="mr-5 h-6 w-6 accent-indigo-500 rounded" />
            <span className="text-white text-lg">{option}</span>
          </label>
        ))}
      </div>
    </div>
  );
};
export default CheckboxRenderer;