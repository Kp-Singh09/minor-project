// client/src/components/FormCreator/ChooseImportType.jsx
import React from 'react';
import { motion } from 'framer-motion';

const ImportCard = ({ title, icon, onClick }) => (
    <motion.div
        whileHover={{ scale: 1.03 }}
        whileTap={{ scale: 0.98 }}
        className="w-48 h-48 bg-gray-50 rounded-xl shadow border-2 border-gray-200 hover:border-blue-500 cursor-pointer flex flex-col items-center justify-center transition-colors"
        onClick={onClick}
    >
        <div className="text-5xl mb-3">{icon}</div>
        <h3 className="text-lg font-semibold text-gray-700">{title}</h3>
    </motion.div>
);

const ChooseImportType = ({ onSelectType, onBack, onCancel }) => {
    return (
        <div className="bg-white rounded-xl shadow-2xl p-8 w-full max-w-2xl mx-auto relative">
            <button onClick={onCancel} className="absolute top-4 right-4 text-gray-400 text-2xl">&times;</button>
            
            <h2 className="text-2xl font-bold text-gray-900 mb-8 text-center">Import Source</h2>
            
            <div className="flex justify-center gap-8 mb-8">
                <ImportCard 
                    title="From Image" 
                    icon="🖼️" 
                    onClick={() => onSelectType('image')} 
                />
                <ImportCard 
                    title="From File(Excel/CSV)" 
                    icon="📊" 
                    onClick={() => onSelectType('file')} 
                />
            </div>

            <div className="flex justify-center">
                <button onClick={onBack} className="text-gray-500 hover:text-gray-700 underline">
                    Back
                </button>
            </div>
        </div>
    );
};

export default ChooseImportType;