// client/src/components/FormCreator/FormEditorUI.jsx
import React, { useRef, useState } from 'react';
import { motion } from 'framer-motion';
import { useOutletContext } from 'react-router-dom';
import axios from 'axios';

// --- DnD Imports ---
import {
  DndContext, 
  closestCenter,
  KeyboardSensor,
  PointerSensor,
  useSensor,
  useSensors,
} from '@dnd-kit/core';
import {
  arrayMove,
  SortableContext,
  sortableKeyboardCoordinates,
  verticalListSortingStrategy,
  useSortable,
} from '@dnd-kit/sortable';
import { CSS } from '@dnd-kit/utilities';

// --- Card for Simple Text (Heading, Paragraph, ShortAnswer, Email, Switch, LongAnswer) ---
const SimpleTextCard = ({ question, onEdit, onDelete, theme }) => {
  let content = null;
  switch (question.type) {
    case 'Heading':
      content = <h2 className={`text-3xl font-bold ${theme.text}`}>{question.text}</h2>;
      break;
    case 'Paragraph':
      content = <p className={`text-base ${theme.secondaryText}`}>{question.text}</p>;
      break;
    case 'ShortAnswer':
      content = (
        <div>
          <p className={`font-semibold text-lg mb-2 ${theme.text}`}>{question.text}</p>
          <input type="text" disabled className={`w-full p-2 rounded-md ${theme.input} bg-opacity-50 border-none`} placeholder="Answer..." />
        </div>
      );
      break;
    case 'LongAnswer':
      content = (
        <div>
          <p className={`font-semibold text-lg mb-2 ${theme.text}`}>{question.text}</p>
          <textarea disabled className={`w-full p-2 rounded-md ${theme.input} bg-opacity-50 border-none`} rows="3" placeholder="Long answer..."></textarea>
        </div>
      );
      break;
    case 'Email':
      content = (
        <div>
          <p className={`font-semibold text-lg mb-2 ${theme.text}`}>{question.text}</p>
          <input type="email" disabled className={`w-full p-2 rounded-md ${theme.input} bg-opacity-50 border-none`} placeholder="name@example.com" />
        </div>
      );
      break;
    case 'Switch':
       content = (
         <div className="flex items-center justify-between">
            <p className={`font-semibold text-lg ${theme.text}`}>{question.text}</p>
            <div className="w-11 h-6 bg-gray-400 rounded-full relative">
                <div className="absolute top-0.5 left-0.5 w-5 h-5 bg-white rounded-full"></div>
            </div>
         </div>
       );
       break;
    default:
      content = <p>{question.text}</p>;
  }

  return (
    <div className={`p-6 rounded-lg w-full max-w-2xl ${theme.input} bg-opacity-30 border border-gray-500/20`}>
      <div className="flex justify-between items-start">
        <div className="flex-grow pr-4">{content}</div>
        <div className="flex gap-2 flex-shrink-0 ml-4">
          <button onClick={() => onEdit(question)} className="text-sm bg-blue-100 text-blue-700 hover:bg-blue-200 py-1 px-3 rounded-md">Edit</button>
          <button onClick={() => onDelete(question._id)} className="text-sm bg-red-100 text-red-700 hover:bg-red-200 py-1 px-3 rounded-md">Delete</button>
        </div>
      </div>
    </div>
  );
};

// --- Card for Options (MultipleChoice, Checkbox, Dropdown) ---
const OptionsCard = ({ question, onEdit, onDelete, theme }) => {
  const icon = question.type === 'Checkbox' ? '☑' : (question.type === 'Dropdown' ? '🔽' : '🔘');
  return (
    <div className={`p-6 rounded-lg w-full max-w-2xl ${theme.input} bg-opacity-30 border border-gray-500/20`}>
      <div className="flex justify-between items-start mb-3">
        <p className={`font-semibold text-lg ${theme.text}`}>{question.text}</p>
        <div className="flex gap-2 flex-shrink-0 ml-4">
          <button onClick={() => onEdit(question)} className="text-sm bg-blue-100 text-blue-700 hover:bg-blue-200 py-1 px-3 rounded-md">Edit</button>
          <button onClick={() => onDelete(question._id)} className="text-sm bg-red-100 text-red-700 hover:bg-red-200 py-1 px-3 rounded-md">Delete</button>
        </div>
      </div>
      <div className="space-y-2">
        {question.options.map((opt, i) => (
          <div key={i} className="flex items-center gap-2">
            <span className="text-xl">{icon}</span>
            <span className={theme.secondaryText}>{opt}</span>
            {opt === question.correctAnswer && <span className="text-xs text-green-600 font-bold">(Correct)</span>}
            {question.correctAnswers?.includes(opt) && <span className="text-xs text-green-600 font-bold">(Correct)</span>}
          </div>
        ))}
      </div>
    </div>
  );
};

// --- Card for PictureChoice ---
const PictureChoiceCard = ({ question, onEdit, onDelete, theme }) => (
  <div className={`p-6 rounded-lg w-full max-w-2xl ${theme.input} bg-opacity-30 border border-gray-500/20`}>
    <div className="flex justify-between items-start mb-3">
        <p className={`font-semibold text-lg ${theme.text}`}>{question.text}</p>
        <div className="flex gap-2 flex-shrink-0 ml-4">
          <button onClick={() => onEdit(question)} className="text-sm bg-blue-100 text-blue-700 hover:bg-blue-200 py-1 px-3 rounded-md">Edit</button>
          <button onClick={() => onDelete(question._id)} className="text-sm bg-red-100 text-red-700 hover:bg-red-200 py-1 px-3 rounded-md">Delete</button>
        </div>
    </div>
    <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        {question.options.map((image, index) => (
          <div key={index} className={`rounded-lg overflow-hidden border-2 ${image === question.correctAnswer ? 'border-green-500' : 'border-transparent'}`}>
            {image ? (
              <img src={image} alt={`Option ${index+1}`} className="w-full h-24 object-cover" />
            ) : (
              <div className="w-full h-24 bg-gray-200 flex items-center justify-center text-gray-500 text-xs">No Image</div>
            )}
          </div>
        ))}
    </div>
  </div>
);


// --- Card for Banner ---
const BannerCard = ({ question, onEdit, onDelete, theme }) => (
  <div className={`p-6 rounded-lg w-full max-w-2xl ${theme.input} bg-opacity-30 border border-gray-500/20`}>
    <div className="flex justify-between items-center mb-4">
      <p className={`text-lg font-semibold ${theme.text}`}>Banner Image</p>
      <div className="flex gap-2">
        <button onClick={() => onEdit(question)} className="text-sm bg-blue-100 text-blue-700 hover:bg-blue-200 py-1 px-3 rounded-md">Edit</button>
        <button onClick={() => onDelete(question._id)} className="text-sm bg-red-100 text-red-700 hover:bg-red-200 py-1 px-3 rounded-md">Delete</button>
      </div>
    </div>
    {question.image ? (
      <img src={question.image} alt="Banner" className="w-full h-auto object-cover rounded-md" />
    ) : (
      <div className="text-center p-4 border-2 border-dashed border-gray-400 rounded-md">
        <p className={theme.secondaryText}>No image uploaded. Click 'Edit' to add one.</p>
      </div>
    )}
  </div>
);

// --- Card for Complex Questions (Cloze, Comprehension, Categorize) ---
const QuestionCard = ({ question, index, onEdit, onDelete, theme }) => {
    return (
        <div className={`p-6 rounded-lg w-full max-w-2xl ${theme.input} bg-opacity-30 border border-gray-500/20`}>
            <div className="flex justify-between items-center">
                <p className={`text-lg font-semibold ${theme.text}`}>
                    Question {index + 1}: {question.type}
                </p>
                <div className="flex gap-2">
                    <button 
                        onClick={() => onEdit(question)} 
                        className="text-sm bg-blue-100 text-blue-700 hover:bg-blue-200 py-1 px-3 rounded-md"
                    >
                        Edit
                    </button>
                    <button 
                        onClick={() => onDelete(question._id)} 
                        className="text-sm bg-red-100 text-red-700 hover:bg-red-200 py-1 px-3 rounded-md"
                    >
                        Delete
                    </button>
                </div>
            </div>
        </div>
    );
};

// --- Sortable Wrapper ---
const SortableItem = ({ id, children, disabled }) => {
  const {
    attributes,
    listeners,
    setNodeRef,
    transform,
    transition,
    isDragging
  } = useSortable({ id, disabled });

  const style = {
    transform: CSS.Transform.toString(transform),
    transition,
    zIndex: isDragging ? 10 : 1,
    opacity: isDragging ? 0.5 : 1,
    position: 'relative'
  };

  return (
    <div ref={setNodeRef} style={style} {...attributes} {...listeners} className="w-full flex justify-center">
        {/* Overlay to prevent clicking buttons while reordering */}
        {!disabled && <div className="absolute inset-0 z-20 cursor-grab active:cursor-grabbing rounded-lg bg-transparent" title="Drag to reorder" />}
        {children}
    </div>
  );
};


const FormEditorUI = () => {
    const { 
        form: originalForm, // Rename to avoid confusion with local state if needed, but we modify context state
        loading, 
        themes, 
        activeBuilder, 
        editingQuestion, 
        renderBuilder, 
        setEditingQuestion,
        handleDeleteQuestion,
        isNewForm,
        handleSaveAndGoToDashboard,
        handleSaveAndPreview,
        setIsThemeModalOpen,
        refetchForm 
    } = useOutletContext();
    
    // We need local state for form questions to handle instant drag updates
    // The 'form' from context is the source of truth, but for drag we need mutable local state
    // Actually, let's trust that we can update the form object in the parent context or just force update here
    // Ideally refetchForm updates the context. For smooth drag, we need local state.
    
    // NOTE: In the current setup, 'form' is passed from EditorLayout. 
    // We can't mutate it directly. We should probably have a local copy of questions.
    const form = originalForm; // Short alias
    
    // We need to locally manage questions state for drag and drop to work smoothly
    // without waiting for API response on every pixel move.
    // However, EditorLayout controls the 'form' state.
    // A quick fix: We will use a local variable for the list rendering that syncs with form.
    
    // Better: We assume 'form' object is what we render. But we can't setForm from here easily 
    // unless we lift that state or pass a setter.
    // 'refetchForm' fetches from server.
    
    // Workaround: We'll modify the array locally in the event handler and assume
    // that a subsequent fetch will normalize it. 
    // But modifying props is bad. 
    // Let's create a local state for the sorted questions.
    const [sortedQuestions, setSortedQuestions] = useState([]);
    
    React.useEffect(() => {
        if (form && form.questions) {
            setSortedQuestions(form.questions);
        }
    }, [form]);

    const [isReordering, setIsReordering] = useState(false);
    const fileInputRef = useRef(null);

    const sensors = useSensors(
        useSensor(PointerSensor, { activationConstraint: { distance: 5 } }), // 5px movement required to start drag
        useSensor(KeyboardSensor, { coordinateGetter: sortableKeyboardCoordinates })
    );

    const handleDragEnd = async (event) => {
        const { active, over } = event;
        
        if (active.id !== over.id) {
            const oldIndex = sortedQuestions.findIndex((q) => q._id === active.id);
            const newIndex = sortedQuestions.findIndex((q) => q._id === over.id);
            
            const newOrder = arrayMove(sortedQuestions, oldIndex, newIndex);
            setSortedQuestions(newOrder);

            // Save new order to backend
            try {
                const newQuestionIds = newOrder.map(q => q._id);
                await axios.put(`${import.meta.env.VITE_API_BASE_URL}/api/forms/${form._id}`, { questions: newQuestionIds });
                // We don't need to refetch immediately as local state is updated, but good for consistency
                // refetchForm(form._id); 
            } catch (err) {
                console.error("Failed to save reordered questions", err);
                alert("Failed to save new order.");
                // Revert on error
                setSortedQuestions(form.questions);
            }
        }
    };

    const handleHeaderImageUpload = async (event) => {
        const file = event.target.files[0];
        if (!file || isNewForm || !form) return;

        try {
            const authResponse = await axios.get(`${import.meta.env.VITE_API_BASE_URL}/api/imagekit/auth`);
            const formData = new FormData();
            formData.append('file', file);
            formData.append('fileName', file.name);
            formData.append('publicKey', import.meta.env.VITE_IMAGEKIT_PUBLIC_KEY);
            formData.append('signature', authResponse.data.signature);
            formData.append('expire', authResponse.data.expire);
            formData.append('token', authResponse.data.token);

            const uploadResponse = await axios.post('https://upload.imagekit.io/api/v1/files/upload', formData);
            const imageUrl = uploadResponse.data.url;

            await axios.put(`${import.meta.env.VITE_API_BASE_URL}/api/forms/${form._id}`, { headerImage: imageUrl });
      
            if(refetchForm) refetchForm(form._id);
            
        } catch (err) {
            alert('Failed to upload header image.');
            console.error(err);
        }
    };

    const handleRemoveHeaderImage = async () => {
        if (!form) return;
        if (window.confirm("Are you sure you want to remove the header image?")) {
            try {
                await axios.put(`${import.meta.env.VITE_API_BASE_URL}/api/forms/${form._id}`, { headerImage: null });
                if (refetchForm) refetchForm(form._id);
            } catch (err) {
                console.error("Failed to remove header image", err);
                alert("Could not remove header image.");
            }
        }
    };


    if (loading) {
        return <div className="p-8 text-center text-gray-600">Loading Editor...</div>;
    }

    if (!form) {
        return <div className="p-8 text-center text-red-500">Could not load form.</div>;
    }

    const selectedTheme = themes[form.theme] || themes['Light'] || Object.values(themes)[0];

    return (
        <motion.div 
            initial={{ opacity: 0 }} 
            animate={{ opacity: 1 }} 
            className="p-8 min-h-full" 
        >
            <input 
                type="file" 
                ref={fileInputRef} 
                onChange={handleHeaderImageUpload} 
                style={{ display: 'none' }} 
                accept="image/*" 
            />

            <div className="w-full max-w-5xl mx-auto flex justify-start gap-4 mb-4 ml-2">
                 <motion.button
                    whileHover={{ scale: 1.05 }}
                    whileTap={{ scale: 0.95 }}
                    onClick={() => setIsThemeModalOpen(true)}
                    disabled={isNewForm}
                    className="flex items-center gap-2 px-5 py-2 rounded-lg bg-white text-gray-700 font-semibold shadow-md hover:bg-gray-100 transition-colors disabled:opacity-50 disabled:cursor-not-allowed border border-gray-300"
                >
                    <span className="text-xl">🖌️</span>
                    Theme
                </motion.button>
                
                <div className="flex gap-2">
                    <motion.button
                        whileHover={{ scale: 1.05 }}
                        whileTap={{ scale: 0.95 }}
                        onClick={() => fileInputRef.current.click()}
                        disabled={isNewForm}
                        className="flex items-center gap-2 px-5 py-2 rounded-lg bg-white text-gray-700 font-semibold shadow-md hover:bg-gray-100 transition-colors disabled:opacity-50 disabled:cursor-not-allowed border border-gray-300"
                    >
                        <span className="text-xl">🖼️</span>
                        {form.headerImage ? 'Change Header' : 'Add Header'}
                    </motion.button>

                    {form.headerImage && !isNewForm && (
                        <motion.button
                            whileHover={{ scale: 1.05 }}
                            whileTap={{ scale: 0.95 }}
                            onClick={handleRemoveHeaderImage}
                            className="flex items-center justify-center w-12 rounded-lg bg-red-50 text-red-600 font-semibold shadow-md hover:bg-red-100 transition-colors border border-red-200"
                            title="Remove Header Image"
                        >
                            <span className="text-lg">🗑️</span>
                        </motion.button>
                    )}
                </div>

                {/* --- Reorder Button --- */}
                {!isNewForm && sortedQuestions.length > 1 && (
                    <motion.button
                        whileHover={{ scale: 1.05 }}
                        whileTap={{ scale: 0.95 }}
                        onClick={() => setIsReordering(!isReordering)}
                        className={`flex items-center gap-2 px-5 py-2 rounded-lg font-semibold shadow-md transition-colors border ${
                            isReordering 
                            ? 'bg-blue-600 text-white border-blue-700' 
                            : 'bg-white text-gray-700 hover:bg-gray-100 border-gray-300'
                        }`}
                    >
                        <span className="text-xl">{isReordering ? '✓' : '↕️'}</span>
                        {isReordering ? 'Done' : 'Reorder'}
                    </motion.button>
                )}
            </div>

            {/* --- Main Canvas --- */}
            <div 
                className={`w-full max-w-5xl min-h-[600px] rounded-lg shadow-xl border border-gray-300 flex flex-col items-center gap-6 p-8 mx-auto ${selectedTheme.cardBg} ${selectedTheme.text}`}
            >
                {form.headerImage && (
                    <div className="w-full max-w-2xl rounded-md overflow-hidden relative group">
                        <img src={form.headerImage} alt="Form Header" className="w-full h-auto object-cover" />
                    </div>
                )}

                {/* --- RENDER LOOP --- */}
                <DndContext 
                    sensors={sensors} 
                    collisionDetection={closestCenter} 
                    onDragEnd={handleDragEnd}
                >
                    <SortableContext 
                        items={sortedQuestions.map(q => q._id)} 
                        strategy={verticalListSortingStrategy}
                        disabled={!isReordering}
                    >
                        {sortedQuestions && sortedQuestions.length > 0 ? (
                            sortedQuestions.map((q, index) => {
                                if (!q) return null;

                                let QuestionComponent = null;

                                switch (q.type) {
                                    case 'Heading':
                                    case 'Paragraph':
                                    case 'ShortAnswer':
                                    case 'Email':
                                    case 'Switch':
                                    case 'LongAnswer':
                                        QuestionComponent = <SimpleTextCard key={q._id} question={q} onEdit={setEditingQuestion} onDelete={handleDeleteQuestion} theme={selectedTheme} />;
                                        break;
                                    
                                    case 'MultipleChoice':
                                    case 'Checkbox':
                                    case 'Dropdown':
                                        QuestionComponent = <OptionsCard key={q._id} question={q} onEdit={setEditingQuestion} onDelete={handleDeleteQuestion} theme={selectedTheme} />;
                                        break;

                                    case 'PictureChoice':
                                        QuestionComponent = <PictureChoiceCard key={q._id} question={q} onEdit={setEditingQuestion} onDelete={handleDeleteQuestion} theme={selectedTheme} />;
                                        break;

                                    case 'Banner':
                                        QuestionComponent = <BannerCard key={q._id} question={q} onEdit={setEditingQuestion} onDelete={handleDeleteQuestion} theme={selectedTheme} />;
                                        break;
                                    
                                    case 'Comprehension':
                                    case 'Cloze':
                                    case 'Categorize':
                                        QuestionComponent = <QuestionCard key={q._id} question={q} index={index} onEdit={setEditingQuestion} onDelete={handleDeleteQuestion} theme={selectedTheme} />;
                                        break;
                                        
                                    default:
                                        QuestionComponent = (
                                            <div key={q._id || `unknown-${index}`} className="p-4 bg-red-100 text-red-700 rounded-md w-full max-w-2xl">
                                                Unsupported field type: {q.type || "Unknown"}
                                            </div>
                                        );
                                }

                                // --- Render Component + Inline Builder if editing ---
                                return (
                                    <SortableItem key={q._id} id={q._id} disabled={!isReordering}>
                                        {QuestionComponent}
                                        {editingQuestion && editingQuestion._id === q._id && !isReordering && (
                                            <div className="w-full max-w-2xl mt-1 animate-fadeIn">
                                                <div className="w-full">
                                                    {renderBuilder()}
                                                </div>
                                            </div>
                                        )}
                                    </SortableItem>
                                );
                            })
                        ) : (
                            <p className={`text-center ${selectedTheme.secondaryText} opacity-60`}>
                                {activeBuilder ? 'Building new question...' : 'Drag and drop questions from the left-hand side.'}
                            </p>
                        )}
                    </SortableContext>
                </DndContext>

                {/* --- Bottom Builder: Only for NEW questions --- */}
                {(activeBuilder && !editingQuestion && !isReordering) && (
                    <div className="w-full max-w-2xl mt-6">
                        {renderBuilder()}
                    </div>
                )}
            </div>

            {/* --- Buttons container --- */}
            <div className="w-full max-w-5xl mx-auto flex justify-end gap-4 mt-8">
                <motion.button
                    whileHover={{ scale: 1.05 }}
                    whileTap={{ scale: 0.95 }}
                    onClick={handleSaveAndPreview}
                    disabled={isNewForm}
                    className="px-6 py-3 rounded-lg bg-blue-600 text-white font-semibold shadow-md hover:bg-blue-700 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
                >
                    Preview
                </motion.button>
                <motion.button
                    whileHover={{ scale: 1.05 }}
                    whileTap={{ scale: 0.95 }}
                    onClick={handleSaveAndGoToDashboard}
                    disabled={isNewForm}
                    className="px-6 py-3 rounded-lg bg-green-600 text-white font-semibold shadow-md hover:bg-green-700 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
                >
                    Save Form
                </motion.button>
            </div>
        </motion.div>
    );
};

export default FormEditorUI;