// client/src/components/renderer/CheckboxRenderer.jsx
import { useState, useEffect } from 'react';

const CheckboxRenderer = ({ question, onAnswerChange, theme }) => {
  const [selected, setSelected] = useState([]);

  useEffect(() => {
    onAnswerChange(question._id, selected);
  }, [selected, onAnswerChange, question._id]);

  const handleSelection = (option) => {
    setSelected(prev =>
      prev.includes(option)
        ? prev.filter(item => item !== option)
        : [...prev, option]
    );
  };

  return (
    <div className={`p-6 rounded-lg shadow-md border ${theme.cardBg}`}>
      <p className={`font-semibold text-lg mb-3 ${theme.text}`}>{question.text}</p>
      <div className="space-y-2">
        {question.options.map((option, index) => (
          <label 
            key={index} 
            className="flex items-center p-3 rounded-md hover:bg-gray-500/10 cursor-pointer transition-colors"
          >
            <input
              type="checkbox"
              checked={selected.includes(option)}
              onChange={() => handleSelection(option)}
              className={`mr-4 h-5 w-5 rounded ${theme.radio}`}
            />
            <span className={theme.secondaryText}>{option}</span>
          </label>
        ))}
      </div>
    </div>
  );
};
export default CheckboxRenderer;