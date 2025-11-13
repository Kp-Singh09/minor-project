// client/src/components/builder/MultipleChoiceBuilder.jsx
import { useState, useEffect } from 'react';

const MultipleChoiceBuilder = ({ onSave, onCancel, initialData = null }) => {
  const [questionText, setQuestionText] = useState('');
  const [options, setOptions] = useState(['Option 1', 'Option 2']);
  const [correctAnswerIndex, setCorrectAnswerIndex] = useState(0);

  useEffect(() => {
    if (initialData) {
      setQuestionText(initialData.text || 'Your Question Here');
      setOptions(initialData.options || ['Option 1', 'Option 2']);
      setCorrectAnswerIndex(initialData.options?.indexOf(initialData.correctAnswer) || 0);
    } else {
      setQuestionText('Your Question Here');
    }
  }, [initialData]);

  const handleOptionChange = (index, value) => {
    const newOptions = [...options];
    newOptions[index] = value;
    setOptions(newOptions);
  };

  const addOption = () => setOptions([...options, 'New Option']);

  const removeOption = (index) => {
    if (options.length <= 2) return alert('Must have at least two options');
    const newOptions = options.filter((_, i) => i !== index);
    setOptions(newOptions);
    if (correctAnswerIndex === index) {
      setCorrectAnswerIndex(0);
    }
  };

  const handleSave = () => {
    onSave({ 
      ...initialData, 
      type: 'MultipleChoice', 
      text: questionText, 
      options, 
      correctAnswer: options[correctAnswerIndex] 
    });
  };

  return (
    <div className="bg-white p-6 rounded-lg border border-gray-200 shadow-md mt-6 animate-fadeIn">
      <h3 className="text-xl font-bold text-gray-900 mb-4">Edit Multiple Choice</h3>
      
      <label className="block text-gray-700 font-semibold mb-2">Question Text</label>
      <input
        type="text"
        className="w-full p-3 bg-gray-50 border border-gray-300 rounded-md text-gray-900 mb-4 focus:ring-2 focus:ring-blue-500 focus:outline-none"
        placeholder="Enter your question"
        value={questionText}
        onChange={(e) => setQuestionText(e.target.value)}
      />

      <label className="block text-gray-700 font-semibold mb-2">Options (Select the correct one)</label>
      <div className="space-y-2">
        {options.map((option, index) => (
          <div key={index} className="flex items-center gap-2">
            <input
              type="radio"
              name="correct-answer"
              checked={correctAnswerIndex === index}
              onChange={() => setCorrectAnswerIndex(index)}
              className="h-5 w-5 text-blue-600 focus:ring-blue-500 border-gray-300"
            />
            <input
              type="text"
              className="w-full p-2 bg-white border border-gray-300 rounded-md text-gray-900 focus:ring-2 focus:ring-blue-500 focus:outline-none"
              value={option}
              onChange={(e) => handleOptionChange(index, e.target.value)}
            />
            <button onClick={() => removeOption(index)} className="text-red-500 hover:text-red-700 p-1" title="Remove option">
              &#x2715;
            </button>
          </div>
        ))}
      </div>
      <button onClick={addOption} className="mt-3 text-sm text-blue-600 hover:underline">
        + Add Option
      </button>

      <div className="flex justify-end gap-4 mt-8 border-t border-gray-200 pt-4">
        <button onClick={onCancel} className="bg-gray-200 text-gray-800 py-2 px-5 rounded-md hover:bg-gray-300">Cancel</button>
        <button onClick={handleSave} className="bg-green-600 text-white py-2 px-5 rounded-md hover:bg-green-700">Save</button>
      </div>
    </div>
  );
};
export default MultipleChoiceBuilder;