// client/src/components/builder/HeadingBuilder.jsx
import { useState, useEffect } from 'react';

const HeadingBuilder = ({ onSave, onCancel, initialData = null }) => {
  const [text, setText] = useState('');

  useEffect(() => {
    if (initialData) {
      const data = initialData.content || initialData;
      setText(data.question || data.text || 'New Heading');
    } else { setText('New Heading'); }
  }, [initialData]);

  const handleSave = () => {
    onSave({ _id: initialData?._id, type: 'Heading', content: { question: text } });
  };

  return (
    <div className="p-8 shadow-2xl animate-fadeIn bg-slate-900 text-white rounded-xl border border-amber-500/20 relative">
      <div className="absolute top-0 left-0 w-full h-1 bg-gradient-to-r from-amber-500 to-orange-500 rounded-t-xl"></div>
      <h3 className="text-xl font-bold mb-6 pb-4 border-b border-white/10 text-white tracking-tight">Edit Heading</h3>
      
      <label className="block font-medium mb-2 text-white/70 text-sm uppercase tracking-wider">Heading Text</label>
      <input
        type="text"
        className="w-full p-4 rounded-xl focus:ring-2 focus:ring-amber-500 focus:border-transparent focus:outline-none bg-white/5 border border-white/10 text-white placeholder-white/30 transition-all font-medium"
        placeholder="Enter your heading"
        value={text}
        onChange={(e) => setText(e.target.value)}
      />

      <div className="flex justify-end gap-4 mt-10 pt-6 border-t border-white/10">
        <button onClick={onCancel} className="px-6 py-3 rounded-xl font-medium transition-colors bg-white/5 text-white/80 hover:bg-white/10 border border-white/10">Cancel</button>
        <button onClick={handleSave} className="bg-amber-600 text-white font-semibold py-3 px-8 rounded-xl hover:bg-amber-500 shadow-lg shadow-amber-500/25 transition-all">Save Question</button>
      </div>
    </div>
  );
};
export default HeadingBuilder;