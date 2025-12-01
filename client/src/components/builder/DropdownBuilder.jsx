// client/src/components/builder/DropdownBuilder.jsx
import { useState, useEffect } from 'react';

const DropdownBuilder = ({ onSave, onCancel, initialData = null, theme }) => {
  const [questionText, setQuestionText] = useState('');
  const [options, setOptions] = useState(['Option 1', 'Option 2']);
  const [correctAnswer, setCorrectAnswer] = useState('Option 1');

  // Default theme fallback
  const currentTheme = theme || { 
    name: 'Light',
    cardBg: 'bg-white', 
    text: 'text-gray-900', 
    secondaryText: 'text-gray-500', 
    input: 'bg-white border-gray-300 text-gray-900' 
  };

  const isDark = ['Dark', 'Navy Pop', 'Futuristic', 'Cyber Dawn'].includes(currentTheme.name);

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
    <div className={`p-6 rounded-lg shadow-md animate-fadeIn border ${currentTheme.cardBg} ${isDark ? 'border-gray-600' : 'border-gray-200'}`}>
      <h3 className={`text-xl font-bold mb-4 pb-4 border-b ${currentTheme.text} ${isDark ? 'border-gray-600' : 'border-gray-100'}`}>
        Edit Dropdown
      </h3>
      
      <label className={`block font-semibold mb-2 ${currentTheme.text}`}>Question Text</label>
      <input
        type="text"
        className={`w-full p-3 rounded-md focus:ring-2 focus:ring-blue-500 focus:outline-none mb-4 ${currentTheme.input}`}
        placeholder="Enter your question"
        value={questionText}
        onChange={(e) => setQuestionText(e.target.value)}
      />

      <label className={`block font-semibold mb-2 ${currentTheme.text}`}>Options</label>
      <div className="space-y-3">
        {options.map((option, index) => (
          <div key={index} className="flex items-center gap-2">
            <input
              type="text"
              className={`w-full p-2 rounded-md focus:ring-2 focus:ring-blue-500 focus:outline-none ${currentTheme.input}`}
              value={option}
              onChange={(e) => handleOptionChange(index, e.target.value)}
            />
            <button 
              onClick={() => removeOption(index)} 
              className={`p-2 rounded-full transition-colors ${isDark ? 'text-gray-400 hover:text-red-400 hover:bg-white/10' : 'text-gray-400 hover:text-red-600 hover:bg-gray-100'}`}
              title="Remove option"
            >
              ✕
            </button>
          </div>
        ))}
      </div>
      <button 
        onClick={addOption} 
        className={`mt-4 text-sm font-medium py-2 px-4 rounded-md transition-colors border border-dashed ${isDark ? 'border-gray-500 text-blue-400 hover:bg-white/5' : 'border-gray-300 text-blue-600 hover:bg-blue-50'}`}
      >
        + Add Option
      </button>

      <label className={`block font-semibold mt-6 mb-2 ${currentTheme.text}`}>Correct Answer</label>
      <select 
        value={correctAnswer} 
        onChange={e => setCorrectAnswer(e.target.value)}
        className={`w-full p-3 rounded-md focus:ring-2 focus:ring-blue-500 focus:outline-none cursor-pointer ${currentTheme.input}`}
      >
        {options.map(opt => <option key={opt} value={opt}>{opt}</option>)}
      </select>

      <div className={`flex justify-end gap-4 mt-8 pt-4 border-t ${isDark ? 'border-gray-600' : 'border-gray-200'}`}>
        <button onClick={onCancel} className={`px-6 py-2.5 rounded-lg font-medium transition-colors ${isDark ? 'bg-gray-700 text-white hover:bg-gray-600' : 'bg-gray-100 text-gray-700 hover:bg-gray-200'}`}>Cancel</button>
        <button onClick={handleSave} className="bg-green-600 text-white font-semibold py-2.5 px-6 rounded-lg hover:bg-green-700 shadow-md transition-colors">Save Question</button>
      </div>
    </div>
  );
};
export default DropdownBuilder;