// src/components/renderer/ClozeRenderer.jsx
import { useState, useEffect } from 'react';
import { DndContext, useDraggable, useDroppable } from '@dnd-kit/core';
import React from 'react';

// --- UPDATED to accept theme ---
function Draggable({ id, children, theme }) {
  const { attributes, listeners, setNodeRef, transform } = useDraggable({ id });
  const style = transform ? { transform: `translate3d(${transform.x}px, ${transform.y}px, 0)`, zIndex: 100 } : undefined;
  return (
    // --- APPLY THEME INPUT and TEXT ---
    <div ref={setNodeRef} style={style} {...listeners} {...attributes} className={`py-1 px-3 rounded-md shadow border cursor-grab ${theme.input} ${theme.text}`}>
      {children}
    </div>
  );
}

// --- UPDATED to accept theme ---
function Droppable({ id, children, isFilled, theme }) {
  const { setNodeRef } = useDroppable({ id });
  // --- UPDATED classes to use theme ---
  const baseClasses = "p-2 min-w-[120px] min-h-[44px] border-2 border-dashed rounded-md flex items-center justify-center transition-colors";
  const filledClasses = `border-green-400 ${theme.input} bg-opacity-30`;
  const emptyClasses = `border-gray-500/30 ${theme.input} bg-opacity-10 hover:border-blue-500`;
  
  return <div ref={setNodeRef} className={`${baseClasses} ${isFilled ? filledClasses : emptyClasses}`}>{children}</div>;
}

const ClozeRenderer = ({ question, onAnswerChange, theme }) => {
  const [availableOptions, setAvailableOptions] = useState(question.options);
  const [filledBlanks, setFilledBlanks] = useState({});

  useEffect(() => {
    onAnswerChange(question._id, filledBlanks);
  }, [filledBlanks, question._id, onAnswerChange]);

  const passageParts = question.passage.split(/\[BLANK\]/g);
  const blankCount = passageParts.length - 1;

  const handleDragEnd = (event) => {
    const { over, active } = event;
    const word = active.id;
    const blankId = over ? over.id : null;

    if (!blankId) return;

    const sourceList = Object.keys(filledBlanks).find(key => filledBlanks[key] === word) ? 'blanks' : 'options';
    const sourceBlankId = sourceList === 'blanks' ? Object.keys(filledBlanks).find(key => filledBlanks[key] === word) : null;
    
    if (blankId.startsWith('blank_')) {
      setFilledBlanks(prev => {
        const newBlanks = {...prev};
        if (prev[blankId]) {
          setAvailableOptions(opts => [...opts, prev[blankId]]);
        }
        if (sourceBlankId) {
          delete newBlanks[sourceBlankId];
        }
        newBlanks[blankId] = word;
        return newBlanks;
      });
      setAvailableOptions(opts => opts.filter(opt => opt !== word));
    }
  };

  return (
    <DndContext onDragEnd={handleDragEnd}>
      {/* --- APPLY THEME CARD --- */}
      <div className={`p-6 rounded-lg shadow-md border ${theme.cardBg}`}>
      {question.image && <img src={question.image} alt="Question visual" className="w-full h-48 object-cover rounded-md mb-6" />}
        {/* --- APPLY THEME TEXT --- */}
        <h3 className={`text-2xl font-bold mb-6 ${theme.text}`}>Fill in the Blanks</h3>
        
        {/* --- APPLY THEME SECONDARY TEXT --- */}
        <div className={`text-lg flex flex-wrap items-center gap-4 mb-8 ${theme.secondaryText}`}>
          {passageParts.map((part, index) => (
            <React.Fragment key={`cloze-part-${index}`}>
              <span>{part}</span>
              {index < blankCount && (
                  // --- PASS THEME PROP ---
                  <Droppable id={`blank_${index}`} isFilled={!!filledBlanks[`blank_${index}`]} theme={theme}>
                      {filledBlanks[`blank_${index}`] && <Draggable id={filledBlanks[`blank_${index}`]} theme={theme}>{filledBlanks[`blank_${index}`]}</Draggable>}
                  </Droppable>
              )}
            </React.Fragment>
          ))}
        </div>

        {/* --- APPLY THEME INPUT (faded) and SECONDARY TEXT --- */}
        <div className={`p-4 rounded-lg min-h-[80px] ${theme.input} bg-opacity-30 border border-gray-500/20`}>
          <h4 className={`font-semibold mb-3 ${theme.secondaryText}`}>Drag these words:</h4>
          <div className="flex flex-wrap gap-3">
            {/* --- PASS THEME PROP --- */}
            {availableOptions.map(option => <Draggable key={option} id={option} theme={theme}>{option}</Draggable>)}
          </div>
        </div>
      </div>
    </DndContext>
  );
};

export default ClozeRenderer;