// src/components/renderer/CategorizeRenderer.jsx
import { useState, useEffect } from 'react';
import { DndContext, useDraggable, useDroppable } from '@dnd-kit/core';

// --- UPDATED to accept theme ---
function DraggableItem({ id, children, theme }) {
  const { attributes, listeners, setNodeRef, transform } = useDraggable({ id });
  const style = transform ? { transform: `translate3d(${transform.x}px, ${transform.y}px, 0)`, zIndex: 100 } : undefined;

  return (
    // --- APPLY THEME INPUT AND TEXT ---
    <div ref={setNodeRef} style={style} {...listeners} {...attributes} className={`p-3 rounded-md shadow border cursor-grab ${theme.input} ${theme.text}`}>
      {children}
    </div>
  );
}

// --- UPDATED to accept theme ---
function DroppableCategory({ id, children, title, theme }) {
  const { setNodeRef } = useDroppable({ id });
  return (
    // --- APPLY THEME INPUT (with opacity) and SECONDARY TEXT ---
    <div ref={setNodeRef} className={`p-4 rounded-lg border-2 border-dashed border-gray-500/30 min-h-[150px] ${theme.input} bg-opacity-30`}>
      <h4 className={`font-bold mb-4 text-center ${theme.secondaryText}`}>{title}</h4>
      <div className="space-y-3">{children}</div>
    </div>
  );
}

const CategorizeRenderer = ({ question, onAnswerChange, theme }) => {
  const [itemLists, setItemLists] = useState({
    unassigned: question.items.map(item => item.text),
    ...Object.fromEntries(question.categories.map(cat => [cat, []]))
  });

  useEffect(() => {
    onAnswerChange(question._id, itemLists);
  }, [itemLists, question._id, onAnswerChange]);

  const handleDragEnd = (event) => {
    const { over, active } = event;
    const activeId = active.id;
    const overId = over ? over.id : null;
    const originalListKey = Object.keys(itemLists).find(key => itemLists[key].includes(activeId));

    if (originalListKey && overId && originalListKey !== overId) {
      setItemLists(prev => {
        const updatedLists = { ...prev };
        updatedLists[originalListKey] = updatedLists[originalListKey].filter(item => item !== activeId);
        updatedLists[overId] = [...updatedLists[overId], activeId];
        return updatedLists;
      });
    }
  };

  return (
    <DndContext onDragEnd={handleDragEnd}>
      {/* --- APPLY THEME CARD --- */}
      <div className={`p-6 rounded-lg shadow-md border ${theme.cardBg}`}>
        {question.image && <img src={question.image} alt="Question visual" className="w-full h-48 object-cover rounded-md mb-6" />}
        {/* --- APPLY THEME TEXT --- */}
        <h3 className={`text-2xl font-bold mb-4 ${theme.text}`}>Categorize These Items</h3>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          {/* --- PASS THEME PROP --- */}
          <DroppableCategory id="unassigned" title="Items to Sort" theme={theme}>
            {itemLists.unassigned.map(item => <DraggableItem key={item} id={item} theme={theme}>{item}</DraggableItem>)}
          </DroppableCategory>
          <div className="md:col-span-2 grid grid-cols-1 sm:grid-cols-2 gap-4">
            {question.categories.map(cat => (
              // --- PASS THEME PROP ---
              <DroppableCategory key={cat} id={cat} title={cat} theme={theme}>
                {itemLists[cat].map(item => <DraggableItem key={item} id={item} theme={theme}>{item}</DraggableItem>)}
              </DroppableCategory>
            ))}
          </div>
        </div>
      </div>
    </DndContext>
  );
};

export default CategorizeRenderer;