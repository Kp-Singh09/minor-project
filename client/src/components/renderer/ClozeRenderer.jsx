import { useState, useEffect } from 'react';

const ClozeRenderer = ({ question, onAnswerChange, theme, savedAnswer }) => {
  const content = question.content || {};
  const passage = content.passage || '';
  const options = content.options || [];
  
  const [userSelections, setUserSelections] = useState(savedAnswer || {});

  // Split passage by [BLANK]
  const parts = passage.split('[BLANK]');

  const handleDrop = (e, index) => {
    e.preventDefault();
    const data = e.dataTransfer.getData("text");
    const newSelections = { ...userSelections, [index]: data };
    setUserSelections(newSelections);
    onAnswerChange(question._id, newSelections);
  };

  const allowDrop = (e) => e.preventDefault();

  const handleDragStart = (e, option) => {
    e.dataTransfer.setData("text", option);
  };

  return (
    <div className={`p-6 rounded-lg shadow-md border ${theme.cardBg} border-white/10`}>
      <p className={`font-semibold text-lg mb-6 ${theme.text}`}>Drag words to fill the blanks</p>
      
      {/* Passage Area */}
      <div className="leading-loose text-lg text-gray-300 mb-8">
        {parts.map((part, index) => (
          <span key={index}>
            {part}
            {index < parts.length - 1 && (
              <span 
                onDrop={(e) => handleDrop(e, index)}
                onDragOver={allowDrop}
                className="inline-block min-w-[100px] border-b-2 border-indigo-500 mx-2 text-center text-indigo-400 font-bold bg-indigo-500/10 px-2 rounded cursor-pointer"
              >
                {userSelections[index] || "_______"}
              </span>
            )}
          </span>
        ))}
      </div>

      {/* Options Pool */}
      <div className="flex flex-wrap gap-3 p-4 bg-black/20 rounded-xl">
        {options.map((opt, i) => (
          <div
            key={i}
            draggable
            onDragStart={(e) => handleDragStart(e, opt)}
            className="px-4 py-2 bg-indigo-600 text-white rounded-lg cursor-grab hover:bg-indigo-500 active:cursor-grabbing shadow-lg"
          >
            {opt}
          </div>
        ))}
      </div>
    </div>
  );
};
export default ClozeRenderer;