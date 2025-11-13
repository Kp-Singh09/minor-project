// client/src/components/renderer/MultipleChoiceRenderer.jsx
import { useState } from 'react';

const MultipleChoiceRenderer = ({ question, onAnswerChange, theme }) => {
  const [selected, setSelected] = useState(null);

  const handleSelection = (option) => {
    setSelected(option);
    onAnswerChange(question._id, option);
  };

  return (
    <div className={`p-6 rounded-lg shadow-md border ${theme.cardBg}`}>
      <p className={`font-semibold text-lg mb-3 ${theme.text}`}>{question.text}</p>
      <div className="space-y-2">
        {question.options.map((option, index) => (
          <label 
            key={index} 
            className={`flex items-center p-3 rounded-md hover:bg-gray-500/10 cursor-pointer transition-colors ${selected === option ? 'bg-gray-500/20' : ''}`}
          >
            <input
              type="radio"
              name={`mcq-${question._id}`}
              checked={selected === option}
              onChange={() => handleSelection(option)}
              className={`mr-4 h-5 w-5 ${theme.radio}`}
            />
            <span className={theme.secondaryText}>{option}</span>
          </label>
        ))}
      </div>
    </div>
  );
};
export default MultipleChoiceRenderer;