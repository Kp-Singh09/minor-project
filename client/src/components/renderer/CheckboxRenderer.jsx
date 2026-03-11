import { useState, useEffect } from 'react';

const CheckboxRenderer = ({ question, onAnswerChange, theme, savedAnswer }) => {
  const [selected, setSelected] = useState(savedAnswer || []);
  
  const content = question.content || {};
  const text = content.question || content.text || 'Question';
  const options = content.options || [];

  useEffect(() => {
    if (Array.isArray(savedAnswer)) setSelected(savedAnswer);
  }, [savedAnswer]);

  const toggleOption = (option) => {
    const newSelection = selected.includes(option)
      ? selected.filter(item => item !== option)
      : [...selected, option];
    
    setSelected(newSelection);
    onAnswerChange(question._id, newSelection);
  };

  return (
    <div className={`p-6 rounded-lg shadow-md border ${theme.cardBg} border-white/10`}>
      <p className={`font-semibold text-lg mb-4 ${theme.text}`}>{text}</p>
      <div className="space-y-2">
        {options.map((option, index) => (
          <label 
            key={index} 
            className={`flex items-center p-3 rounded-md hover:bg-white/5 cursor-pointer transition-colors`}
          >
            <input
              type="checkbox"
              checked={selected.includes(option)}
              onChange={() => toggleOption(option)}
              className="mr-4 h-5 w-5 accent-indigo-500 rounded"
            />
            <span className={theme.text}>{option}</span>
          </label>
        ))}
      </div>
    </div>
  );
};
export default CheckboxRenderer;