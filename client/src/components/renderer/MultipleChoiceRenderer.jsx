import { useState, useEffect } from 'react';

const MultipleChoiceRenderer = ({ question, onAnswerChange, theme, savedAnswer }) => {
  const [selected, setSelected] = useState(savedAnswer || null);
  
  // Safe extraction
  const content = question.content || {};
  const text = content.question || content.text || 'Question Text';
  const options = content.options || [];

  useEffect(() => {
    if (savedAnswer) setSelected(savedAnswer);
  }, [savedAnswer]);

  const handleSelection = (option) => {
    setSelected(option);
    onAnswerChange(question._id, option);
  };

  return (
    <div className={`p-6 rounded-lg shadow-md border ${theme.cardBg} border-white/10`}>
      <p className={`font-semibold text-lg mb-4 ${theme.text}`}>{text}</p>
      <div className="space-y-3">
        {options.map((option, index) => (
          <label 
            key={index} 
            className={`flex items-center p-4 rounded-lg cursor-pointer transition-all border ${
              selected === option 
                ? 'bg-indigo-500/20 border-indigo-500/50' 
                : 'hover:bg-white/5 border-transparent'
            }`}
          >
            <input
              type="radio"
              name={`mcq-${question._id}`}
              checked={selected === option}
              onChange={() => handleSelection(option)}
              className={`mr-4 h-5 w-5 accent-indigo-500`}
            />
            <span className={theme.text}>{option}</span>
          </label>
        ))}
      </div>
    </div>
  );
};
export default MultipleChoiceRenderer;