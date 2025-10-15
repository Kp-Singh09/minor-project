// src/components/renderer/ComprehensionRenderer.jsx
import { useState } from 'react';

const ComprehensionRenderer = ({ question, onAnswerChange }) => {
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
    <div className="bg-white p-6 rounded-lg shadow-md border border-gray-200">
      {question.image && <img src={question.image} alt="Question visual" className="w-full h-48 object-cover rounded-md mb-6" />}
      <h3 className="text-2xl font-bold mb-4 text-gray-900">Reading Comprehension</h3>
      
      <div className="prose max-w-none bg-gray-50 p-4 rounded-md border border-gray-200 mb-6">
        <p className="text-gray-700">{question.comprehensionPassage}</p>
      </div>

      <div className="space-y-6">
        {question.mcqs.map((mcq) => (
          <div key={mcq._id} className="border-t border-gray-200 pt-4">
            <p className="font-semibold text-lg mb-3 text-gray-800">{mcq.questionText}</p>
            <div className="space-y-2">
              {mcq.options.map((optionText, optIndex) => {
                const uniqueId = `mcq-option-${mcq._id}-${optIndex}`;
                return (
                  <label key={uniqueId} htmlFor={uniqueId} className="flex items-center p-3 rounded-md hover:bg-gray-100 cursor-pointer transition-colors">
                    <input
                      id={uniqueId}
                      type="radio"
                      name={`mcq-${mcq._id}`}
                      value={optIndex}
                      checked={selectedAnswerIndices[mcq._id] === optIndex}
                      onChange={() => handleSelection(mcq._id, optIndex, optionText)}
                      className="mr-4 h-5 w-5 bg-gray-100 border-gray-300 text-blue-600 focus:ring-blue-500"
                    />
                    <span className="text-gray-700">{optionText}</span>
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