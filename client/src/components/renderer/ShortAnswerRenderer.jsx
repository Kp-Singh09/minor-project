// client/src/components/renderer/ShortAnswerRenderer.jsx
import React from 'react';

const ShortAnswerRenderer = ({ question, onAnswerChange, theme }) => {
  return (
    <div className={`p-6 rounded-lg shadow-md border ${theme.cardBg}`}>
      <label className={`block text-lg font-semibold mb-3 ${theme.text}`}>{question.text}</label>
      <input
        type="text"
        onChange={(e) => onAnswerChange(question._id, e.target.value)}
        className={`w-full p-3 border rounded-md ${theme.input} focus:outline-none focus:ring-2`}
        placeholder="Type your answer here..."
      />
    </div>
  );
};
export default ShortAnswerRenderer;