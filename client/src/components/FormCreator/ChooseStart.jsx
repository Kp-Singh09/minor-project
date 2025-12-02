// client/src/components/FormCreator/ChooseStart.jsx
import React from 'react';
import { motion } from 'framer-motion';

const ChoiceCard = ({ title, description, icon, onClick }) => (
    <motion.div
        whileHover={{ 
            scale: 1.05, 
            boxShadow: "0 20px 25px -5px rgba(0, 0, 0, 0.1), 0 10px 10px -5px rgba(0, 0, 0, 0.04)",
            borderColor: "#3B82F6" 
        }}
        whileTap={{ scale: 0.95 }}
        className="w-56 h-56 bg-white rounded-xl shadow-md border-2 border-gray-100 flex flex-col items-center justify-center p-6 cursor-pointer transition-all duration-300 group"
        onClick={onClick}
    >
        {/* Added group-hover effect to the icon for extra polish */}
        <div className="text-6xl mb-5 drop-shadow-sm transition-transform duration-300 group-hover:scale-110 group-hover:rotate-3">{icon}</div>
        <h3 className="text-xl font-bold text-gray-800 mb-2">{title}</h3>
        <p className="text-gray-500 text-center text-sm font-medium">{description}</p>
    </motion.div>
);

const ChooseStart = ({ onSelect, onCancel }) => {
    return (
        // Changed max-w-2xl to max-w-fit to help center the tight grid
        <div className="bg-white rounded-2xl shadow-2xl p-10 max-w-fit mx-auto relative animate-fadeIn">
            <button
                onClick={onCancel}
                className="absolute top-4 right-4 text-gray-400 hover:text-gray-600 text-3xl transition-colors leading-none"
            >
                &times;
            </button>
            
            <h2 className="text-3xl font-extrabold text-gray-900 mb-10 text-center tracking-tight">Choose how to get started</h2>
            
            {/* Geometry Fix:
               1. 'w-fit mx-auto': Forces the grid to hug the cards, removing extra side spacing.
               2. 'gap-6': Ensures the vertical and horizontal gaps are visually identical.
            */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6 w-fit mx-auto">
                
                {/* --- TOP ROW --- */}
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

                {/* --- BOTTOM ROW --- */}
                <ChoiceCard
                    title="Import Questions"
                    description="From Excel or Images"
                    icon="📤"
                    onClick={() => onSelect('import')}
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