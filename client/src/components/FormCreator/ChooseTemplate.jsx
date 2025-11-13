// client/src/components/FormCreator/ChooseTemplate.jsx
import React from 'react';
import { motion } from 'framer-motion';
import { templatesArray } from '../../templates'; // Import the templates

// --- THIS IS THE ORIGINAL CARD STYLE YOU LIKED ---
const TemplateCard = ({ title, description, icon, onClick }) => (
    <motion.div
        whileHover={{ scale: 1.03, boxShadow: "0 10px 15px -3px rgba(0, 0, 0, 0.1), 0 4px 6px -2px rgba(0, 0, 0, 0.05)" }}
        whileTap={{ scale: 0.98 }}
        // Using the original styling from your screenshot (w-56, h-56, etc.)
        className="w-56 h-56 bg-white rounded-xl shadow-lg flex flex-col items-center justify-center p-6 cursor-pointer border-2 border-transparent hover:border-blue-500 transition-all duration-200"
        onClick={onClick}
    >
        <div className="text-6xl mb-4">{icon}</div>
        <h3 className="text-xl font-semibold text-gray-800 mb-2">{title}</h3>
        <p className="text-gray-500 text-center text-sm">{description}</p>
    </motion.div>
);

const ChooseTemplate = ({ onSelectTemplate, onBack, onCancel }) => {
    
    return (
        // --- THIS IS THE SCROLLING MODAL FIX ---
        // 1. Use flex-col and max-h on the main modal container.
        //    max-w-3xl is wider to fit two cards, as in your screenshot.
        <div className="bg-white rounded-xl shadow-2xl w-full max-w-3xl mx-auto relative flex flex-col max-h-[90vh]">
            
            {/* 2. HEADER SECTION (static) */}
            <div className="p-8 pb-6 flex-shrink-0 relative">
                <button
                    onClick={onCancel}
                    className="absolute top-4 right-4 text-gray-400 hover:text-gray-600 text-2xl"
                >
                    &times;
                </button>
                <h2 className="text-3xl font-bold text-gray-900 text-center">Select a Template</h2>
            </div>
            
            {/* 3. CONTENT SECTION (scrollable) */}
            <div className="flex-grow overflow-y-auto px-8">
                {/* We use flex-wrap and justify-center for the grid layout */}
                <div className="flex flex-wrap justify-center gap-8">
                    {templatesArray.map(template => (
                        <TemplateCard
                            key={template.id}
                            title={template.name}
                            description={template.description}
                            icon={template.icon}
                            onClick={() => onSelectTemplate(template.id)}
                        />
                    ))}
                </div>
            </div>
            
             {/* 4. FOOTER SECTION (static) */}
             <div className="flex-shrink-0 flex justify-start items-center p-8 pt-6 mt-2 border-t border-gray-200">
                <motion.button
                    whileHover={{ scale: 1.05 }}
                    whileTap={{ scale: 0.95 }}
                    onClick={onBack}
                    className="px-6 py-3 rounded-lg bg-gray-200 text-gray-700 font-semibold hover:bg-gray-300 transition-colors"
                >
                    Back
                </motion.button>
            </div>
        </div>
    );
};

export default ChooseTemplate;