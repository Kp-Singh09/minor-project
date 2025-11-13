// src/components/renderer/ComprehensionRenderer.jsx
import { useState } from 'react';

const ComprehensionRenderer = ({ question, onAnswerChange, theme }) => {
  const [selectedAnswerIndices, setSelectedAnswerIndices] = useState({});

  const handleSelection = (mcqId, optionIndex, optionText) => {
    const newSelectedIndices = { ...selectedAnswerIndices, [mcqId]: optionIndex };
    setSelectedAnswerIndices(newSelectedIndices);
    
    const newAnswersForParent = {};
    for (const id in newSelectedIndices) {
        const questionForMcq = question.mcqs.find(mcq => mcq._id === id);
        if (questionForMcq) {
            newAnswersForParent[id] = questionForMcq.options[newSelectedIndices[id]];
        }
    }
    
    onAnswerChange(question._id, newAnswersForParent);
  };

  return (
    // --- APPLY THEME CARD ---
    <div className={`p-6 rounded-lg shadow-md border ${theme.cardBg}`}>
      {question.image && <img src={question.image} alt="Question visual" className="w-full h-48 object-cover rounded-md mb-6" />}
      {/* --- APPLY THEME TEXT --- */}
      <h3 className={`text-2xl font-bold mb-4 ${theme.text}`}>Reading Comprehension</h3>
      
      {/* --- Use theme.input for passage background, theme.secondaryText for text --- */}
      <div className={`prose max-w-none p-4 rounded-md border border-gray-500/20 mb-6 ${theme.input} bg-opacity-30`}>
        <p className={theme.secondaryText}>{question.comprehensionPassage}</p>
      </div>

      <div className="space-y-6">
        {question.mcqs.map((mcq) => (
          <div key={mcq._id} className="border-t border-gray-500/20 pt-4">
            {/* --- APPLY THEME TEXT --- */}
            <p className={`font-semibold text-lg mb-3 ${theme.text}`}>{mcq.questionText}</p>
            <div className="space-y-2">
              {mcq.options.map((optionText, optIndex) => {
                const uniqueId = `mcq-option-${mcq._id}-${optIndex}`;
                return (
                  <label key={uniqueId} htmlFor={uniqueId} className="flex items-center p-3 rounded-md hover:bg-gray-500/10 cursor-pointer transition-colors">
                    <input
                      id={uniqueId}
                      type="radio"
                      name={`mcq-${mcq._id}`}
                      value={optIndex}
                      checked={selectedAnswerIndices[mcq._id] === optIndex}
                      onChange={() => handleSelection(mcq._id, optIndex, optionText)}
                      // --- APPLY THEME RADIO ---
                      className={`mr-4 h-5 w-5 ${theme.radio}`}
                    />
                    {/* --- APPLY THEME SECONDARY TEXT --- */}
                    <span className={theme.secondaryText}>{optionText}</span>
                  </label>
                );
              })}
            </div>
          </div>
        ))}
      </div>
    </div>
  );
};

export default ComprehensionRenderer;