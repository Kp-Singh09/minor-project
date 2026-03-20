import { useState, useEffect } from 'react';

const SwitchRenderer = ({ question, onAnswerChange, savedAnswer }) => {
  const [isChecked, setIsChecked] = useState(savedAnswer === 'true' || savedAnswer === true);
  const content = question.content || {};
  const text = content.question || content.text || 'Question';

  useEffect(() => { setIsChecked(savedAnswer === 'true' || savedAnswer === true); }, [savedAnswer]);

  const toggle = () => {
    const newVal = !isChecked;
    setIsChecked(newVal);
    onAnswerChange(question._id, newVal);
  };

  return (
    <div className="p-8 rounded-2xl shadow-xl border bg-slate-900 border-emerald-500/20 relative flex items-center justify-between">
      <div className="absolute top-0 left-0 w-full h-1 bg-gradient-to-r from-emerald-500 to-teal-500"></div>
      <p className="font-semibold text-2xl text-white">{text}</p>
      <button onClick={toggle} className={`relative w-20 h-10 rounded-full transition-colors ${isChecked ? 'bg-emerald-500' : 'bg-white/20'}`}>
        <div className={`absolute top-1 left-1 bg-white w-8 h-8 rounded-full transition-transform ${isChecked ? 'translate-x-10 shadow-[0_0_15px_rgba(255,255,255,0.8)]' : 'translate-x-0'}`} />
      </button>
    </div>
  );
};
export default SwitchRenderer;