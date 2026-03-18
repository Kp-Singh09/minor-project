// client/src/components/FormCreator/ChooseStart.jsx
import React from 'react';
import { motion } from 'framer-motion';

const ChoiceCard = ({ title, description, icon, onClick }) => (
    <motion.div
        whileHover={{ 
            scale: 1.05, 
            boxShadow: "0 20px 25px -5px rgba(0, 0, 0, 0.5), 0 10px 10px -5px rgba(0, 0, 0, 0.2)",
            borderColor: "#6366f1" // indigo-500
        }}
        whileTap={{ scale: 0.95 }}
        className="w-56 h-56 bg-white/5 backdrop-blur-md rounded-xl shadow-md border-2 border-white/10 flex flex-col items-center justify-center p-6 cursor-pointer transition-all duration-300 group"
        onClick={onClick}
    >
        <div className="text-6xl mb-5 drop-shadow-lg transition-transform duration-300 group-hover:scale-110 group-hover:rotate-3">{icon}</div>
        <h3 className="text-xl font-bold text-white mb-2 tracking-tight">{title}</h3>
        <p className="text-white/50 text-center text-sm font-medium">{description}</p>
    </motion.div>
);

const ChooseStart = ({ onSelect, onCancel }) => {
    return (
        <div className="bg-white/5 backdrop-blur-xl rounded-2xl shadow-2xl p-10 max-w-fit mx-auto relative animate-fadeIn border border-white/10">
            {onCancel && (
                <button
                    onClick={onCancel}
                    className="absolute top-4 right-4 text-white/40 hover:text-white/80 text-3xl transition-colors leading-none"
                >
                    &times;
                </button>
            )}
            
            <h2 className="text-3xl font-extrabold text-white mb-10 text-center tracking-tight">Initialize Module</h2>
            
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6 w-fit mx-auto">
                <ChoiceCard
                    title="Blank Core"
                    description="Start from scratch"
                    icon="📄"
                    onClick={() => onSelect('blank')}
                />
                <ChoiceCard
                    title="Neural AI"
                    description="Generate with a prompt"
                    icon="✨"
                    onClick={() => onSelect('ai')}
                />
                <ChoiceCard
                    title="Import Data"
                    description="From Excel or Images"
                    icon="📤"
                    onClick={() => onSelect('import')}
                />
                <ChoiceCard
                    title="Template Hub"
                    description="Pre-built configurations"
                    icon="📋"
                    onClick={() => onSelect('template')}
                />
            </div>
        </div>
    );
};

export default ChooseStart;