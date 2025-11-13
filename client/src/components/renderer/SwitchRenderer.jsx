// client/src/components/renderer/SwitchRenderer.jsx
import { useState } from 'react';

const SwitchRenderer = ({ question, onAnswerChange, theme }) => {
  const [isChecked, setIsChecked] = useState(false);

  const handleChange = (e) => {
    const checked = e.target.checked;
    setIsChecked(checked);
    onAnswerChange(question._id, checked);
  };

  return (
    <div className={`p-6 rounded-lg shadow-md border ${theme.cardBg}`}>
      <div className="flex items-center justify-between">
        <label className={`text-lg font-semibold ${theme.text}`}>{question.text}</label>
        <label className="relative inline-flex items-center cursor-pointer">
          <input
            type="checkbox"
            checked={isChecked}
            onChange={handleChange}
            className="sr-only peer"
          />
          <div className="w-11 h-6 bg-gray-200 peer-focus:outline-none peer-focus:ring-4 peer-focus:ring-blue-300 dark:peer-focus:ring-blue-800 rounded-full peer dark:bg-gray-700 peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all dark:border-gray-600 peer-checked:bg-blue-600"></div>
        </label>
      </div>
    </div>
  );
};
export default SwitchRenderer;