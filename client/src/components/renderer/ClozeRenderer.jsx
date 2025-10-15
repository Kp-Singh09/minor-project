// src/components/renderer/ClozeRenderer.jsx
import { useState, useEffect } from 'react';
import { DndContext, useDraggable, useDroppable } from '@dnd-kit/core';
import React from 'react';

function Draggable({ id, children }) {
  const { attributes, listeners, setNodeRef, transform } = useDraggable({ id });
  const style = transform ? { transform: `translate3d(${transform.x}px, ${transform.y}px, 0)`, zIndex: 100 } : undefined;
  return <div ref={setNodeRef} style={style} {...listeners} {...attributes} className="bg-white py-1 px-3 rounded-md shadow border border-gray-300 cursor-grab text-gray-800">{children}</div>;
}

function Droppable({ id, children, isFilled }) {
  const { setNodeRef } = useDroppable({ id });
  const baseClasses = "p-2 min-w-[120px] min-h-[44px] border-2 border-dashed rounded-md flex items-center justify-center transition-colors";
  const filledClasses = "border-green-400 bg-green-50";
  const emptyClasses = "border-gray-300 bg-gray-50 hover:border-blue-500";
  
  return <div ref={setNodeRef} className={`${baseClasses} ${isFilled ? filledClasses : emptyClasses}`}>{children}</div>;
}

const ClozeRenderer = ({ question, onAnswerChange }) => {
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
      <div className="bg-white p-6 rounded-lg shadow-md border border-gray-200">
      {question.image && <img src={question.image} alt="Question visual" className="w-full h-48 object-cover rounded-md mb-6" />}
        <h3 className="text-2xl font-bold mb-6 text-gray-900">Fill in the Blanks</h3>
        
        <div className="text-lg flex flex-wrap items-center gap-4 mb-8 text-gray-700">
          {passageParts.map((part, index) => (
            <React.Fragment key={`cloze-part-${index}`}>
              <span>{part}</span>
              {index < blankCount && (
                  <Droppable id={`blank_${index}`} isFilled={!!filledBlanks[`blank_${index}`]}>
                      {filledBlanks[`blank_${index}`] && <Draggable id={filledBlanks[`blank_${index}`]}>{filledBlanks[`blank_${index}`]}</Draggable>}
                  </Droppable>
              )}
            </React.Fragment>
          ))}
        </div>

        <div className="p-4 bg-gray-50 border border-gray-200 rounded-lg min-h-[80px]">
          <h4 className="font-semibold mb-3 text-gray-600">Drag these words:</h4>
          <div className="flex flex-wrap gap-3">
            {availableOptions.map(option => <Draggable key={option} id={option}>{option}</Draggable>)}
          </div>
        </div>
      </div>
    </DndContext>
  );
};

export default ClozeRenderer;