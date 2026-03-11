import { useState, useEffect } from 'react';

const SwitchRenderer = ({ question, onAnswerChange, theme, savedAnswer }) => {
  const [isChecked, setIsChecked] = useState(savedAnswer === 'true' || savedAnswer === true);
  
  const content = question.content || {};
  const text = content.question || content.text || 'Question';

  useEffect(() => {
    setIsChecked(savedAnswer === 'true' || savedAnswer === true);
  }, [savedAnswer]);

  const toggle = () => {
    const newVal = !isChecked;
    setIsChecked(newVal);
    onAnswerChange(question._id, newVal);
  };

  return (
    <div className={`p-6 rounded-lg shadow-md border ${theme.cardBg} border-white/10 flex items-center justify-between`}>
      <p className={`font-semibold text-lg ${theme.text}`}>{text}</p>
      
      <button 
        onClick={toggle}
        className={`relative w-14 h-8 rounded-full transition-colors ${isChecked ? 'bg-green-500' : 'bg-gray-600'}`}
      >
        <div className={`absolute top-1 left-1 bg-white w-6 h-6 rounded-full transition-transform ${isChecked ? 'translate-x-6' : 'translate-x-0'}`} />
      </button>
    </div>
  );
};
export default SwitchRenderer;