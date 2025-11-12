// client/src/components/FormCreator/FormEditorUI.jsx
import React from 'react';
import { motion } from 'framer-motion';
import { useOutletContext } from 'react-router-dom';

// --- A new component to render the question cards ---
const QuestionCard = ({ question, index, onEdit, onDelete }) => {
    return (
        <div className="bg-white p-6 rounded-lg border border-gray-200 shadow-md w-full">
            <div className="flex justify-between items-center">
                <p className="text-lg font-semibold text-gray-800">
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


const FormEditorUI = () => {
    // --- Get all state and functions from EditorLayout ---
    const { 
        form, 
        loading, 
        themes, 
        activeBuilder, 
        editingQuestion, 
        renderBuilder, 
        setEditingQuestion,
        handleDeleteQuestion
    } = useOutletContext();

    if (loading) {
        return <div className="p-8 text-center text-gray-600">Loading Editor...</div>;
    }

    if (!form) {
        return <div className="p-8 text-center text-red-500">Could not load form.</div>;
    }

    // Find the theme details
    const selectedTheme = themes[form.theme] || themes['Default'];

    // --- DEFINE GRID BACKGROUND ---
    const gridBackground = "bg-[length:80px_80px] bg-[linear-gradient(transparent_78px,rgba(59,130,246,0.3)_80px),linear-gradient(90deg,transparent_78px,rgba(59,130,246,0.3)_80px)]";

    return (
        // The parent div now applies the grid background
        <motion.div 
            initial={{ opacity: 0 }} 
            animate={{ opacity: 1 }} 
            className={`p-8 min-h-full ${gridBackground}`} // Apply grid to the parent
        >
            {/* --- Main Canvas --- */}
            <div 
                // --- CORRECTED STYLING ---
                // Set the background to 'bg-white' explicitly.
                // The theme's background (blue, etc.) will be applied to
                // elements *inside* the form later, not the canvas itself.
                className="w-full max-w-2xl min-h-[600px] rounded-lg shadow-xl border border-gray-300 flex flex-col items-center gap-6 p-8 mx-auto bg-white"
                // No style tag is needed
            >
                {/* Form Title */}
                <h3 className={`text-3xl font-bold ${selectedTheme.text} text-center`}>
                    {form.title}
                </h3>

                {/* --- Render Existing Questions --- */}
                {form.questions && form.questions.length > 0 ? (
                    form.questions.map((q, index) => (
                        <QuestionCard 
                            key={q._id}
                            question={q}
                            index={index}
                            onEdit={setEditingQuestion}
                            onDelete={handleDeleteQuestion}
                        />
                    ))
                ) : (
                    // Use the theme's text color, but force it to be slightly transparent
                    <p className={`text-center ${selectedTheme.text} opacity-60`}>
                        Drag and drop questions from the left-hand side.
                    </p>
                )}

                {/* --- RENDER THE ACTIVE BUILDER --- */}
                {(activeBuilder || editingQuestion) && (
                    <div className="w-full">
                        {renderBuilder()}
                    </div>
                )}

            </div>
        </motion.div>
    );
};

export default FormEditorUI;