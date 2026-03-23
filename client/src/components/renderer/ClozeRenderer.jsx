// client/src/components/renderer/ClozeRenderer.jsx
import { useState } from 'react';

const ClozeRenderer = ({ question, onAnswerChange, savedAnswer }) => {
  const content = question.content || {};
  const passage = content.passage || '';
  const options = content.options || [];
  const [userSelections, setUserSelections] = useState(savedAnswer || {});
  const parts = passage.split('[BLANK]');

  const handleDrop = (e, index) => {
    e.preventDefault();
    const data = e.dataTransfer.getData("text");
    const newSelections = { ...userSelections, [index]: data };
    setUserSelections(newSelections);
    onAnswerChange(question._id, newSelections);
  };

  const handleDragStart = (e, option) => e.dataTransfer.setData("text", option);

  // Allow users to click a filled blank to remove the answer and put it back in the options pool
  const handleRemoveBlank = (index) => {
    if (!userSelections[index]) return;
    const newSelections = { ...userSelections };
    delete newSelections[index];
    setUserSelections(newSelections);
    onAnswerChange(question._id, newSelections);
  };

  // Filter out options that the user has already placed in a blank
  const availableOptions = options.filter(opt => !Object.values(userSelections).includes(opt));

  return (
    <div className="p-8 rounded-2xl shadow-xl border bg-slate-900 border-emerald-500/20 relative">
      <div className="absolute top-0 left-0 w-full h-1 bg-gradient-to-r from-emerald-500 to-teal-500"></div>
      <p className="font-semibold text-2xl mb-8 text-white">Drag words to fill the blanks</p>
      
      <div className="leading-loose text-xl text-white/80 mb-10 bg-white/5 p-8 rounded-xl border border-white/10">
        {parts.map((part, index) => (
          <span key={index}>
            {part}
            {index < parts.length - 1 && (
              <span 
                onDrop={(e) => handleDrop(e, index)} 
                onDragOver={(e) => e.preventDefault()}
                onClick={() => handleRemoveBlank(index)} // Click to put word back
                title={userSelections[index] ? "Click to remove" : ""}
                className={`inline-block min-w-[120px] pb-1 border-b-2 mx-2 text-center font-bold px-3 rounded transition-colors ${
                    userSelections[index] ? 'cursor-pointer border-emerald-500 text-emerald-400 bg-emerald-500/10 hover:bg-red-500/20 hover:text-red-400 hover:border-red-500' : 'border-white/30 text-white/30 bg-black/20'
                }`}
              >
                {userSelections[index] || "Drop Here"}
              </span>
            )}
          </span>
        ))}
      </div>

      <div className="flex flex-wrap gap-4 p-6 bg-black/40 border border-white/5 rounded-xl min-h-[80px]">
        {availableOptions.length === 0 ? (
          <span className="text-white/30 italic m-auto">All blanks filled!</span>
        ) : (
          availableOptions.map((opt, i) => (
            <div 
              key={`${opt}-${i}`} 
              draggable 
              onDragStart={(e) => handleDragStart(e, opt)} 
              className="px-5 py-2.5 bg-emerald-600/20 border border-emerald-500/30 text-emerald-300 rounded-lg cursor-grab hover:bg-emerald-600/40 active:cursor-grabbing font-bold tracking-wide"
            >
              {opt}
            </div>
          ))
        )}
      </div>
    </div>
  );
};
export default ClozeRenderer;