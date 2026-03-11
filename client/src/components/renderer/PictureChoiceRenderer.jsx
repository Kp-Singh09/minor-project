import { useState, useEffect } from 'react';

const PictureChoiceRenderer = ({ question, onAnswerChange, theme, savedAnswer }) => {
  const [selected, setSelected] = useState(savedAnswer || null);
  
  const content = question.content || {};
  const text = content.question || content.text || 'Question';
  const options = content.options || [];

  useEffect(() => {
    if (savedAnswer) setSelected(savedAnswer);
  }, [savedAnswer]);

  const handleSelect = (imgUrl) => {
    setSelected(imgUrl);
    onAnswerChange(question._id, imgUrl);
  };

  return (
    <div className={`p-6 rounded-lg shadow-md border ${theme.cardBg} border-white/10`}>
      <p className={`font-semibold text-lg mb-6 ${theme.text}`}>{text}</p>
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        {options.map((imgUrl, index) => (
          <div 
            key={index}
            onClick={() => handleSelect(imgUrl)}
            className={`relative rounded-xl overflow-hidden cursor-pointer border-2 transition-all group ${
                selected === imgUrl ? 'border-indigo-500 scale-105 shadow-lg shadow-indigo-500/20' : 'border-transparent hover:border-white/20'
            }`}
          >
            <img src={imgUrl} alt={`Option ${index + 1}`} className="w-full h-40 object-cover" />
            <div className={`absolute inset-0 bg-black/40 flex items-center justify-center transition-opacity ${selected === imgUrl ? 'opacity-100' : 'opacity-0 group-hover:opacity-100'}`}>
                {selected === imgUrl && <div className="w-8 h-8 bg-indigo-500 rounded-full flex items-center justify-center text-white">✓</div>}
            </div>
          </div>
        ))}
      </div>
    </div>
  );
};
export default PictureChoiceRenderer;