// client/src/components/FormCreator/AdvancedShareModal.jsx
import { useState, useEffect } from 'react';
import { DragDropContext, Droppable, Draggable } from '@hello-pangea/dnd';
import { motion, AnimatePresence } from 'framer-motion';
// FIXED: Added ShieldAlert to the import list
import { MessageSquareText, AlignCenter, AlignJustify, Copy, X, ShieldAlert } from 'lucide-react';
import toast from 'react-hot-toast';

const MODES = [
    { id: 'chat', label: 'Conversational', icon: <MessageSquareText size={16} />, color: 'bg-pink-500' },
    { id: 'focus', label: 'Focus Flow', icon: <AlignCenter size={16} />, color: 'bg-indigo-500' },
    { id: 'scroll', label: 'Document View', icon: <AlignJustify size={16} />, color: 'bg-emerald-500' }
];

export default function AdvancedShareModal({ isOpen, onClose, formId }) {
    // Columns configuration
    const [columns, setColumns] = useState({
        forced: { id: 'forced', title: 'Forced', desc: 'User goes directly here.', items: [] },
        recommended: { id: 'recommended', title: 'Recommended', desc: 'Default selection.', items: [MODES[1]] },
        allowed: { id: 'allowed', title: 'Allowed', desc: 'Can be chosen.', items: [MODES[0], MODES[2]] },
        disabled: { id: 'disabled', title: 'Disabled', desc: 'Not available.', items: [] }
    });

    const [generatedLink, setGeneratedLink] = useState('');

    useEffect(() => {
        generateLink();
    }, [columns]);

    const onDragEnd = (result) => {
        const { source, destination } = result;
        if (!destination) return;

        const sourceColId = source.droppableId;
        const destColId = destination.droppableId;

        // Constraint: Forced and Recommended can only hold 1 item.
        if ((destColId === 'forced' || destColId === 'recommended') && columns[destColId].items.length >= 1) {
            if (sourceColId !== destColId) {
                toast.error(`${columns[destColId].title} can only have 1 mode.`);
                return;
            }
        }

        const sourceCol = columns[sourceColId];
        const destCol = columns[destColId];
        const sourceItems = [...sourceCol.items];
        const destItems = [...destCol.items];

        const [removed] = sourceItems.splice(source.index, 1);

        if (sourceColId === destColId) {
            sourceItems.splice(destination.index, 0, removed);
            setColumns({ ...columns, [sourceColId]: { ...sourceCol, items: sourceItems } });
        } else {
            destItems.splice(destination.index, 0, removed);
            setColumns({
                ...columns,
                [sourceColId]: { ...sourceCol, items: sourceItems },
                [destColId]: { ...destCol, items: destItems }
            });
        }
    };

    const generateLink = () => {
        const baseUrl = `${window.location.origin}/form/${formId}`;
        const params = new URLSearchParams();

        if (columns.forced.items.length > 0) {
            params.append('forced', columns.forced.items[0].id);
        } else {
            if (columns.recommended.items.length > 0) {
                params.append('recommended', columns.recommended.items[0].id);
            }
            if (columns.allowed.items.length > 0) {
                params.append('allowed', columns.allowed.items.map(i => i.id).join(','));
            }
        }

        const queryString = params.toString();
        setGeneratedLink(queryString ? `${baseUrl}?${queryString}` : baseUrl);
    };

    const handleCopy = () => {
        navigator.clipboard.writeText(generatedLink);
        toast.success("Advanced Link Copied!");
    };

    if (!isOpen) return null;

    return (
        <AnimatePresence>
            <motion.div 
                initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
                className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-sm"
            >
                <motion.div 
                    initial={{ scale: 0.95, opacity: 0 }} animate={{ scale: 1, opacity: 1 }} exit={{ scale: 0.95, opacity: 0 }}
                    className="bg-slate-900 border border-white/10 rounded-2xl w-full max-w-4xl shadow-2xl overflow-hidden relative"
                >
                    <div className="p-6 border-b border-white/10 flex justify-between items-center bg-white/5">
                        <div>
                            <h2 className="text-2xl font-bold text-white tracking-tight">Access Matrix Configuration</h2>
                            <p className="text-sm text-white/50 font-mono mt-1">Drag and drop rendering modes to set user permissions.</p>
                        </div>
                        <button onClick={onClose} className="text-white/40 hover:text-white transition-colors">
                            <X size={24} />
                        </button>
                    </div>

                    <div className="p-8">
                        <DragDropContext onDragEnd={onDragEnd}>
                            <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
                                {Object.entries(columns).map(([id, col]) => (
                                    <div key={id} className="flex flex-col">
                                        <div className="mb-3">
                                            <h3 className="font-bold text-white text-sm uppercase tracking-wider">{col.title}</h3>
                                            <p className="text-[10px] text-white/40 uppercase font-mono">{col.desc}</p>
                                        </div>
                                        
                                        <Droppable droppableId={id}>
                                            {(provided, snapshot) => (
                                                <div 
                                                    ref={provided.innerRef} {...provided.droppableProps} 
                                                    className={`flex-grow min-h-[200px] p-3 rounded-xl border-2 transition-colors ${
                                                        snapshot.isDraggingOver ? 'bg-white/10 border-indigo-500/50' : 'bg-black/40 border-dashed border-white/10'
                                                    }`}
                                                >
                                                    {col.items.map((item, index) => (
                                                        <Draggable key={item.id} draggableId={item.id} index={index}>
                                                            {(provided, snapshot) => (
                                                                <div
                                                                    ref={provided.innerRef} {...provided.draggableProps} {...provided.dragHandleProps}
                                                                    className={`p-3 mb-3 rounded-lg flex items-center gap-3 text-sm font-bold text-white shadow-lg transition-transform ${item.color} ${snapshot.isDragging ? 'scale-105 rotate-2' : ''}`}
                                                                >
                                                                    <div className="bg-black/20 p-1.5 rounded-md">{item.icon}</div>
                                                                    {item.label}
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

                        <div className="mt-8 pt-6 border-t border-white/10">
                            <label className="block text-xs uppercase tracking-widest font-bold text-white/50 mb-2">Generated Matrix Link</label>
                            <div className="flex gap-3">
                                <input 
                                    type="text" readOnly value={generatedLink}
                                    className="flex-grow bg-black/40 border border-white/10 rounded-xl px-4 text-sm text-white/80 font-mono focus:outline-none"
                                />
                                <button onClick={handleCopy} className="bg-indigo-600 hover:bg-indigo-500 text-white px-6 py-3 rounded-xl font-bold flex items-center gap-2 transition-colors">
                                    <Copy size={16} /> Copy
                                </button>
                            </div>
                            
                            {/* This is what was causing the crash because ShieldAlert wasn't imported! */}
                            {columns.forced.items.length > 0 && (
                                <p className="mt-3 text-xs text-amber-400 flex items-center gap-1">
                                    <ShieldAlert size={14} /> 
                                    Warning: Forced mode is active. Users will bypass the selection screen.
                                </p>
                            )}
                        </div>
                    </div>
                </motion.div>
            </motion.div>
        </AnimatePresence>
    );
}