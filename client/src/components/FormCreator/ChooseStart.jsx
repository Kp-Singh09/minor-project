// client/src/components/FormCreator/ChooseStart.jsx
import React from 'react';
import { motion } from 'framer-motion';

const ChoiceCard = ({ title, description, icon, onClick }) => (
    <motion.div
        whileHover={{ scale: 1.03, boxShadow: "0 10px 15px -3px rgba(0, 0, 0, 0.1), 0 4px 6px -2px rgba(0, 0, 0, 0.05)" }}
        whileTap={{ scale: 0.98 }}
        className="w-56 h-56 bg-white rounded-xl shadow-lg flex flex-col items-center justify-center p-6 cursor-pointer border-2 border-transparent hover:border-blue-500 transition-all duration-200"
        onClick={onClick}
    >
        <div className="text-6xl mb-4">{icon}</div>
        <h3 className="text-xl font-semibold text-gray-800 mb-2">{title}</h3>
        <p className="text-gray-500 text-center text-sm">{description}</p>
    </motion.div>
);

const ChooseStart = ({ onSelect, onCancel }) => {
    return (
        <div className="bg-white rounded-xl shadow-2xl p-8 max-w-3xl mx-auto relative">
            {/* Close Button */}
            <button
                onClick={onCancel}
                className="absolute top-4 right-4 text-gray-400 hover:text-gray-600 text-2xl"
            >
                &times;
            </button>
            
            <h2 className="text-3xl font-bold text-gray-900 mb-8 text-center">Choose how to get started</h2>
            <div className="flex flex-wrap justify-center gap-8">
                <ChoiceCard
                    title="Blank form"
                    description="Start from scratch"
                    icon="📄"
                    onClick={() => onSelect('blank')}
                />
                <ChoiceCard
                    title="Create with AI"
                    description="Generate with a prompt"
                    icon="✨"
                    onClick={() => onSelect('ai')}
                />
                <ChoiceCard
                    title="Template"
                    description="Pre-built designs"
                    icon="📋"
                    onClick={() => onSelect('template')}
                />
            </div>
        </div>
    );
};

export default ChooseStart;