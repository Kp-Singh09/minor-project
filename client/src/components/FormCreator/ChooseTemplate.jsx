// client/src/components/FormCreator/ChooseTemplate.jsx
import React from 'react';
import { motion } from 'framer-motion';
import { templatesArray } from '../../templates';

const TemplateCard = ({ title, description, icon, onClick }) => (
    <motion.div
        whileHover={{ scale: 1.03, boxShadow: "0 10px 15px -3px rgba(0, 0, 0, 0.1), 0 4px 6px -2px rgba(0, 0, 0, 0.05)" }}
        whileTap={{ scale: 0.98 }}
        // REDUCED HEIGHT AND WIDTH slightly for a tighter fit
        className="w-72 h-60 bg-white rounded-xl shadow-lg flex flex-col items-center justify-center p-5 cursor-pointer border-2 border-transparent hover:border-blue-500 transition-all duration-200"
        onClick={onClick}
    >
        <div className="text-5xl mb-4">{icon}</div>
        <h3 className="text-lg font-bold text-gray-900 mb-2 text-center leading-tight">{title}</h3>
        <p className="text-gray-500 text-center text-xs line-clamp-3 leading-relaxed">{description}</p>
    </motion.div>
);

const ChooseTemplate = ({ onSelectTemplate, onBack, onCancel }) => {
    return (
        // REDUCED MAX-WIDTH to bring columns closer
        <div className="bg-white rounded-xl shadow-2xl w-full max-w-3xl mx-auto relative flex flex-col h-[85vh]">
            
            {/* 1. Header Section */}
            <div className="p-6 border-b border-gray-200 flex-shrink-0 relative bg-white rounded-t-xl z-10">
                <button
                    onClick={onCancel}
                    className="absolute top-6 right-6 text-gray-400 hover:text-gray-600 text-3xl leading-none transition-colors"
                >
                    &times;
                </button>
                <h2 className="text-3xl font-extrabold text-gray-900 text-center">Select a Template</h2>
                <p className="text-gray-500 text-center mt-2">Choose a starting point for your new form</p>
            </div>
            
            {/* 2. Scrollable Content Area */}
            <div className="flex-grow overflow-y-auto p-6 bg-gray-50">
                {/* REDUCED GAP from gap-8 to gap-4 */}
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4 justify-items-center pb-6">
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
            
             {/* 3. Footer Section */}
             <div className="flex-shrink-0 p-6 border-t border-gray-200 bg-white rounded-b-xl">
                <motion.button
                    whileHover={{ scale: 1.05 }}
                    whileTap={{ scale: 0.95 }}
                    onClick={onBack}
                    className="px-6 py-2.5 rounded-lg bg-gray-100 text-gray-700 font-semibold hover:bg-gray-200 transition-colors border border-gray-300"
                >
                    Back
                </motion.button>
            </div>
        </div>
    );
};

export default ChooseTemplate;