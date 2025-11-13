// client/src/components/renderer/EmailRenderer.jsx
import React from 'react';

const EmailRenderer = ({ question, onAnswerChange, theme }) => {
  return (
    <div className={`p-6 rounded-lg shadow-md border ${theme.cardBg}`}>
      <label className={`block text-lg font-semibold mb-3 ${theme.text}`}>
        {question.text}
        <span className="text-red-500 ml-1">*</span>
      </label>
      <input
        type="email"
        onChange={(e) => onAnswerChange(question._id, e.target.value)}
        className={`w-full p-3 border rounded-md ${theme.input} focus:outline-none focus:ring-2`}
        placeholder="name@example.com"
      />
    </div>
  );
};
export default EmailRenderer;