// client/src/components/builder/DropdownBuilder.jsx
import { useState, useEffect } from 'react';

const DropdownBuilder = ({ onSave, onCancel, initialData = null }) => {
  const [questionText, setQuestionText] = useState('');
  const [options, setOptions] = useState(['Option 1', 'Option 2']);
  const [correctAnswer, setCorrectAnswer] = useState('Option 1');

  useEffect(() => {
    if (initialData) {
      const data = initialData.content || initialData;
      setQuestionText(data.question || data.text || 'Your Question Here');
      setOptions(data.options || ['Option 1', 'Option 2']);
      setCorrectAnswer(data.correctAnswer || data.options?.[0]);
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
    if (correctAnswer === removedOption) setCorrectAnswer(options[0] || '');
  };

  const handleSave = () => {
    onSave({ 
      _id: initialData?._id, type: 'Dropdown', 
      content: { question: questionText, options, correctAnswer }
    });
  };

  return (
    <div className="p-8 shadow-2xl animate-fadeIn bg-slate-900 text-white rounded-xl border border-indigo-500/20 relative">
      <div className="absolute top-0 left-0 w-full h-1 bg-gradient-to-r from-indigo-500 to-blue-500 rounded-t-xl"></div>
      <h3 className="text-xl font-bold mb-6 pb-4 border-b border-white/10 text-white tracking-tight">Edit Dropdown</h3>
      
      <label className="block font-medium mb-2 text-white/70 text-sm uppercase tracking-wider">Question Text</label>
      <input
        type="text"
        className="w-full p-4 rounded-xl focus:ring-2 focus:ring-indigo-500 focus:border-transparent focus:outline-none mb-8 bg-white/5 border border-white/10 text-white placeholder-white/30 transition-all font-medium"
        placeholder="Enter your question"
        value={questionText}
        onChange={(e) => setQuestionText(e.target.value)}
      />

      <label className="block font-medium mb-3 text-white/70 text-sm uppercase tracking-wider">Options</label>
      <div className="space-y-4">
        {options.map((option, index) => (
          <div key={index} className="flex items-center gap-4 bg-white/[0.02] p-2 rounded-xl border border-white/5 hover:border-indigo-500/30 transition-colors">
            <input
              type="text"
              className="flex-grow p-3 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:outline-none bg-white/5 border border-white/10 text-white transition-all"
              value={option}
              onChange={(e) => handleOptionChange(index, e.target.value)}
            />
            <button onClick={() => removeOption(index)} className="p-3 mr-1 rounded-lg transition-colors text-white/40 hover:text-red-400 hover:bg-red-500/10">✕</button>
          </div>
        ))}
      </div>
      <button onClick={addOption} className="mt-6 text-sm font-medium py-3 px-6 rounded-xl transition-colors border border-dashed border-white/20 text-indigo-400 hover:bg-indigo-500/10 hover:border-indigo-500/50">
        + Add Option
      </button>

      <label className="block font-medium mt-8 mb-3 text-white/70 text-sm uppercase tracking-wider">Correct Answer</label>
      <select 
        value={correctAnswer} 
        onChange={e => setCorrectAnswer(e.target.value)}
        className="w-full p-4 rounded-xl focus:ring-2 focus:ring-indigo-500 focus:outline-none bg-slate-800 border border-white/10 text-white transition-all cursor-pointer"
      >
        {options.map(opt => <option key={opt} value={opt} className="bg-slate-800 text-white">{opt}</option>)}
      </select>

      <div className="flex justify-end gap-4 mt-10 pt-6 border-t border-white/10">
        <button onClick={onCancel} className="px-6 py-3 rounded-xl font-medium transition-colors bg-white/5 text-white/80 hover:bg-white/10 border border-white/10">Cancel</button>
        <button onClick={handleSave} className="bg-indigo-600 text-white font-semibold py-3 px-8 rounded-xl hover:bg-indigo-500 shadow-lg shadow-indigo-500/25 transition-all">Save Question</button>
      </div>
    </div>
  );
};
export default DropdownBuilder;