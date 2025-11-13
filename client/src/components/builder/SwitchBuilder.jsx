// client/src/components/builder/SwitchBuilder.jsx
import { useState, useEffect } from 'react';

const SwitchBuilder = ({ onSave, onCancel, initialData = null }) => {
  const [text, setText] = useState('');

  useEffect(() => {
    if (initialData) {
      setText(initialData.text || 'Do you agree?');
    } else {
      setText('Do you agree?');
    }
  }, [initialData]);

  const handleSave = () => {
    // Switch is not typically a "scorable" question, so we just save the text
    onSave({ ...initialData, type: 'Switch', text });
  };

  return (
    <div className="bg-white p-6 rounded-lg border border-gray-200 shadow-md mt-6 animate-fadeIn">
      <h3 className="text-xl font-bold text-gray-900 mb-4">Edit Switch / Toggle</h3>
      
      <label className="block text-gray-700 font-semibold mb-2">Label Text</label>
      <input
        type="text"
        className="w-full p-3 bg-gray-50 border border-gray-300 rounded-md text-gray-900 focus:ring-2 focus:ring-blue-500 focus:outline-none"
        placeholder="Enter your question or label"
        value={text}
        onChange={(e) => setText(e.target.value)}
      />
      
      <p className="text-sm text-gray-500 mt-4">This component is for simple Yes/No or On/Off inputs and is not scorable.</p>

      <div className="flex justify-end gap-4 mt-8 border-t border-gray-200 pt-4">
        <button onClick={onCancel} className="bg-gray-200 text-gray-800 py-2 px-5 rounded-md hover:bg-gray-300">Cancel</button>
        <button onClick={handleSave} className="bg-green-600 text-white py-2 px-5 rounded-md hover:bg-green-700">Save</button>
      </div>
    </div>
  );
};
export default SwitchBuilder;