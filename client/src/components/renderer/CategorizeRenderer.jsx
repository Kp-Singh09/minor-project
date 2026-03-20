import { useState, useEffect } from 'react';
import { DragDropContext, Droppable, Draggable } from '@hello-pangea/dnd';

const CategorizeRenderer = ({ question, onAnswerChange, savedAnswer }) => {
  const content = question.content || {};
  const categories = content.categories || [];
  const items = content.items || [];
  const [columns, setColumns] = useState({});

  useEffect(() => {
    const initialColumns = { uncategorized: { id: 'uncategorized', title: 'Items Base', items: items.map((item, idx) => ({ id: `item-${idx}`, content: item.text })) } };
    categories.forEach((cat, idx) => { initialColumns[`cat-${idx}`] = { id: `cat-${idx}`, title: cat, items: [] }; });
    setColumns(initialColumns);
  }, [question]);

  const onDragEnd = (result) => {
    const { source, destination } = result;
    if (!destination) return;
    const sourceCol = columns[source.droppableId];
    const destCol = columns[destination.droppableId];
    const sourceItems = [...sourceCol.items];
    const destItems = [...destCol.items];
    const [removed] = sourceItems.splice(source.index, 1);

    if (source.droppableId === destination.droppableId) {
      sourceItems.splice(destination.index, 0, removed);
      setColumns({ ...columns, [source.droppableId]: { ...sourceCol, items: sourceItems } });
    } else {
      destItems.splice(destination.index, 0, removed);
      setColumns({ ...columns, [source.droppableId]: { ...sourceCol, items: sourceItems }, [destination.droppableId]: { ...destCol, items: destItems } });
    }
    const answerSnapshot = {};
    Object.keys(columns).forEach(key => {
        if(key !== 'uncategorized') {
            const newColItems = (key === source.droppableId) ? sourceItems : (key === destination.droppableId ? destItems : columns[key].items);
            answerSnapshot[columns[key].title] = newColItems.map(i => i.content);
        }
    });
    onAnswerChange(question._id, answerSnapshot);
  };

  return (
    <div className="p-8 rounded-2xl shadow-xl border bg-slate-900 border-emerald-500/20 relative">
      <div className="absolute top-0 left-0 w-full h-1 bg-gradient-to-r from-emerald-500 to-teal-500"></div>
      <p className="font-semibold text-2xl mb-8 text-white">Drag items to correct categories</p>
      
      <DragDropContext onDragEnd={onDragEnd}>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          <div className="md:col-span-3 mb-6">
             <Droppable droppableId="uncategorized" direction="horizontal">
                {(provided) => (
                  <div ref={provided.innerRef} {...provided.droppableProps} className="p-6 bg-white/[0.02] border border-white/10 rounded-xl min-h-[100px] flex flex-wrap gap-3">
                    {columns.uncategorized?.items.map((item, index) => (
                      <Draggable key={item.id} draggableId={item.id} index={index}>
                        {(provided) => (
                          <div ref={provided.innerRef} {...provided.draggableProps} {...provided.dragHandleProps} className="px-5 py-3 bg-emerald-600/20 border border-emerald-500/30 text-emerald-300 rounded-lg shadow-lg text-sm font-bold tracking-wide">
                            {item.content}
                          </div>
                        )}
                      </Draggable>
                    ))}
                    {provided.placeholder}
                  </div>
                )}
             </Droppable>
          </div>
          {Object.entries(columns).filter(([key]) => key !== 'uncategorized').map(([id, col]) => (
             <div key={id} className="bg-white/5 border border-white/10 rounded-xl overflow-hidden flex flex-col">
                <h4 className="p-4 bg-black/40 font-bold text-center text-white border-b border-white/10">{col.title}</h4>
                <Droppable droppableId={id}>
                  {(provided) => (
                    <div ref={provided.innerRef} {...provided.droppableProps} className="p-4 flex-grow min-h-[200px] space-y-3 bg-white/[0.01]">
                       {col.items.map((item, index) => (
                         <Draggable key={item.id} draggableId={item.id} index={index}>
                           {(provided) => (
                             <div ref={provided.innerRef} {...provided.draggableProps} {...provided.dragHandleProps} className="px-4 py-3 bg-slate-800 border border-white/5 text-white rounded-lg text-sm font-medium shadow-md">
                               {item.content}
                             </div>
                           )}
                         </Draggable>
                       ))}
                       {provided.placeholder}
                    </div>
                  )}
                </Droppable>
             </div>
          ))}
        </div>
      </DragDropContext>
    </div>
  );
};
export default CategorizeRenderer;