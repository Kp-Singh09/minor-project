// client/src/components/renderer/DropdownRenderer.jsx
import React from 'react';

const DropdownRenderer = ({ question, onAnswerChange, theme }) => {
  return (
    <div className={`p-6 rounded-lg shadow-md border ${theme.cardBg}`}>
      <label className={`block text-lg font-semibold mb-3 ${theme.text}`}>{question.text}</label>
      <select
        onChange={(e) => onAnswerChange(question._id, e.target.value)}
        className={`w-full p-3 border rounded-md ${theme.input} focus:outline-none focus:ring-2`}
        defaultValue=""
      >
        <option value="" disabled>Select an option...</option>
        {question.options.map((option, index) => (
          <option key={index} value={option}>{option}</option>
        ))}
      </select>
    </div>
  );
};
export default DropdownRenderer;