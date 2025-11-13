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
        handleDeleteQuestion,
        isNewForm, // 👈 NEW
        handleSaveAndGoToDashboard, // 👈 NEW
        handleSaveAndPreview // 👈 NEW
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
        // 👈 REMOVED pb-24, padding is now on the canvas itself
        <motion.div 
            initial={{ opacity: 0 }} 
            animate={{ opacity: 1 }} 
            className={`p-8 min-h-full ${gridBackground}`} 
        >
            {/* --- Main Canvas --- */}
            {/* 👈 ADDED pb-8 to canvas for internal spacing */}
            <div 
                className="w-full max-w-2xl min-h-[600px] rounded-lg shadow-xl border border-gray-300 flex flex-col items-center gap-6 p-8 mx-auto bg-white pb-8"
            >
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

            {/* --- 👈 NEW: Buttons container --- */}
            {/* This is now INSIDE the scrolling grid div, but AFTER the white canvas div */}
            <div className="w-full max-w-2xl mx-auto flex justify-end gap-4 mt-8">
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