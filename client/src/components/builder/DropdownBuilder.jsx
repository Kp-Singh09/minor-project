// client/src/components/builder/DropdownBuilder.jsx
import { useState, useEffect } from 'react';

const DropdownBuilder = ({ onSave, onCancel, initialData = null }) => {
  const [questionText, setQuestionText] = useState('');
  const [options, setOptions] = useState(['Option 1', 'Option 2']);
  const [correctAnswer, setCorrectAnswer] = useState('Option 1');

  useEffect(() => {
    if (initialData) {
      setQuestionText(initialData.text || 'Your Question Here');
      setOptions(initialData.options || ['Option 1', 'Option 2']);
      setCorrectAnswer(initialData.correctAnswer || initialData.options[0]);
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
    const removedOption = options[index];
    setOptions(prev => prev.filter((_, i) => i !== index));
    if (correctAnswer === removedOption) {
      setCorrectAnswer(options[0] || '');
    }
  };

  const handleSave = () => {
    onSave({ 
      ...initialData, 
      type: 'Dropdown', 
      text: questionText, 
      options, 
      correctAnswer 
    });
  };

  return (
    <div className="bg-white p-6 rounded-lg border border-gray-200 shadow-md mt-6 animate-fadeIn">
      <h3 className="text-xl font-bold text-gray-900 mb-4">Edit Dropdown</h3>
      
      <label className="block text-gray-700 font-semibold mb-2">Question Text</label>
      <input
        type="text"
        className="w-full p-3 bg-gray-50 border border-gray-300 rounded-md text-gray-900 mb-4 focus:ring-2 focus:ring-blue-500 focus:outline-none"
        placeholder="Enter your question"
        value={questionText}
        onChange={(e) => setQuestionText(e.target.value)}
      />

      <label className="block text-gray-700 font-semibold mb-2">Options</label>
      <div className="space-y-2">
        {options.map((option, index) => (
          <div key={index} className="flex items-center gap-2">
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

      <label className="block text-gray-700 font-semibold mt-4 mb-2">Correct Answer</label>
      <select 
        value={correctAnswer} 
        onChange={e => setCorrectAnswer(e.target.value)}
        className="w-full p-3 bg-white border border-gray-300 rounded-md text-gray-900 focus:ring-2 focus:ring-blue-500 focus:outline-none"
      >
        {options.map(opt => <option key={opt} value={opt}>{opt}</option>)}
      </select>


      <div className="flex justify-end gap-4 mt-8 border-t border-gray-200 pt-4">
        <button onClick={onCancel} className="bg-gray-200 text-gray-800 py-2 px-5 rounded-md hover:bg-gray-300">Cancel</button>
        <button onClick={handleSave} className="bg-green-600 text-white py-2 px-5 rounded-md hover:bg-green-700">Save</button>
      </div>
    </div>
  );
};
export default DropdownBuilder;