// client/src/components/builder/SwitchBuilder.jsx
import { useState, useEffect } from 'react';

const SwitchBuilder = ({ onSave, onCancel, initialData = null, theme }) => {
  const [text, setText] = useState('');

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
      setText(initialData.text || 'Do you agree?');
    } else {
      setText('Do you agree?');
    }
  }, [initialData]);

  const handleSave = () => {
    onSave({ ...initialData, type: 'Switch', text });
  };

  return (
    <div className={`p-6 rounded-lg shadow-md animate-fadeIn border ${currentTheme.cardBg} ${isDark ? 'border-gray-600' : 'border-gray-200'}`}>
      <h3 className={`text-xl font-bold mb-4 pb-4 border-b ${currentTheme.text} ${isDark ? 'border-gray-600' : 'border-gray-100'}`}>Edit Switch / Toggle</h3>
      
      <label className={`block font-semibold mb-2 ${currentTheme.text}`}>Label Text</label>
      <input
        type="text"
        className={`w-full p-3 rounded-md focus:ring-2 focus:ring-blue-500 focus:outline-none ${currentTheme.input}`}
        placeholder="Enter your question or label"
        value={text}
        onChange={(e) => setText(e.target.value)}
      />
      
      <p className={`text-sm mt-4 ${currentTheme.secondaryText} opacity-70`}>This component is for simple Yes/No or On/Off inputs and is not scorable.</p>

      <div className={`flex justify-end gap-4 mt-8 pt-4 border-t ${isDark ? 'border-gray-600' : 'border-gray-200'}`}>
        <button onClick={onCancel} className={`px-6 py-2.5 rounded-lg font-medium transition-colors ${isDark ? 'bg-gray-700 text-white hover:bg-gray-600' : 'bg-gray-100 text-gray-700 hover:bg-gray-200'}`}>Cancel</button>
        <button onClick={handleSave} className="bg-green-600 text-white font-semibold py-2.5 px-6 rounded-lg hover:bg-green-700 shadow-md transition-colors">Save Question</button>
      </div>
    </div>
  );
};
export default SwitchBuilder;