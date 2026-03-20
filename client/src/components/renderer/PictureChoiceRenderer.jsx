import { useState, useEffect } from 'react';

const PictureChoiceRenderer = ({ question, onAnswerChange, savedAnswer }) => {
  const [selected, setSelected] = useState(savedAnswer || null);
  const content = question.content || {};
  const text = content.question || content.text || 'Question';
  const options = content.options || [];

  useEffect(() => { if (savedAnswer) setSelected(savedAnswer); }, [savedAnswer]);

  const handleSelect = (imgUrl) => { setSelected(imgUrl); onAnswerChange(question._id, imgUrl); };

  return (
    <div className="p-8 rounded-2xl shadow-xl border bg-slate-900 border-indigo-500/20 relative overflow-hidden">
      <div className="absolute top-0 left-0 w-full h-1 bg-gradient-to-r from-indigo-500 to-blue-500"></div>
      <p className="font-semibold text-2xl mb-8 text-white">{text}</p>
      <div className="grid grid-cols-2 md:grid-cols-4 gap-6">
        {options.map((imgUrl, index) => (
          <div 
            key={index} onClick={() => handleSelect(imgUrl)}
            className={`relative rounded-xl overflow-hidden cursor-pointer border-4 transition-all group ${
                selected === imgUrl ? 'border-indigo-500 scale-105 shadow-2xl shadow-indigo-500/40' : 'border-white/10 hover:border-white/30'
            }`}
          >
            <img src={imgUrl} alt={`Option ${index + 1}`} className="w-full h-48 object-cover" />
            <div className={`absolute inset-0 bg-black/40 flex items-center justify-center transition-opacity ${selected === imgUrl ? 'opacity-100' : 'opacity-0 group-hover:opacity-100'}`}>
                {selected === imgUrl && <div className="w-10 h-10 bg-indigo-500 rounded-full flex items-center justify-center text-white shadow-lg">✓</div>}
            </div>
          </div>
        ))}
      </div>
    </div>
  );
};
export default PictureChoiceRenderer;