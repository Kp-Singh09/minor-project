// src/components/renderer/CategorizeRenderer.jsx
import { useState, useEffect } from 'react';
import { DndContext, useDraggable, useDroppable } from '@dnd-kit/core';

function DraggableItem({ id, children }) {
  const { attributes, listeners, setNodeRef, transform } = useDraggable({ id });
  const style = transform ? { transform: `translate3d(${transform.x}px, ${transform.y}px, 0)`, zIndex: 100 } : undefined;

  return (
    <div ref={setNodeRef} style={style} {...listeners} {...attributes} className="bg-white p-3 rounded-md shadow border border-gray-300 cursor-grab text-gray-800">
      {children}
    </div>
  );
}

function DroppableCategory({ id, children, title }) {
  const { setNodeRef } = useDroppable({ id });
  return (
    <div ref={setNodeRef} className="bg-gray-50 p-4 rounded-lg border-2 border-dashed border-gray-300 min-h-[150px]">
      <h4 className="font-bold mb-4 text-center text-gray-600">{title}</h4>
      <div className="space-y-3">{children}</div>
    </div>
  );
}

const CategorizeRenderer = ({ question, onAnswerChange }) => {
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
      <div className="bg-white p-6 rounded-lg shadow-md border border-gray-200">
        {question.image && <img src={question.image} alt="Question visual" className="w-full h-48 object-cover rounded-md mb-6" />}
        <h3 className="text-2xl font-bold mb-4 text-gray-900">Categorize These Items</h3>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          <DroppableCategory id="unassigned" title="Items to Sort">
            {itemLists.unassigned.map(item => <DraggableItem key={item} id={item}>{item}</DraggableItem>)}
          </DroppableCategory>
          <div className="md:col-span-2 grid grid-cols-1 sm:grid-cols-2 gap-4">
            {question.categories.map(cat => (
              <DroppableCategory key={cat} id={cat} title={cat}>
                {itemLists[cat].map(item => <DraggableItem key={item} id={item}>{item}</DraggableItem>)}
              </DroppableCategory>
            ))}
          </div>
        </div>
      </div>
    </DndContext>
  );
};

export default CategorizeRenderer;