// client/src/components/FormCreator/ChooseTheme.jsx
import React, { useState } from 'react';
import { motion } from 'framer-motion';
import { themesArray } from '../../themes';

const ThemeCard = ({ theme, isSelected, onClick }) => (
    <motion.div
        whileHover={{ scale: 1.02, x: 5 }}
        whileTap={{ scale: 0.98 }}
        className={`w-full h-24 rounded-lg shadow-md cursor-pointer overflow-hidden relative flex-shrink-0
            ${isSelected ? 'ring-4 ring-blue-500 ring-offset-2' : 'border border-gray-300'}`}
        onClick={onClick}
    >
        <div className={`absolute inset-0 ${theme.preview}`}></div>
        <div className="relative p-3">
            <p className={`font-semibold ${theme.previewText}`}>{theme.name}</p>
        </div>
    </motion.div>
);

const ChooseTheme = ({ onSelectTheme, onBack, onClose, submitText }) => {
    const [currentTheme, setCurrentTheme] = useState(themesArray[0]);

    const handleCreateForm = () => {
        onSelectTheme(currentTheme);
    };

    const getPreviewButtonText = (themeName) => {
        switch(themeName) {
            case 'Navy Pop': return 'text-blue-900';
            default: return 'text-white';
        }
    };
    
     const getPreviewButtonBg = (themeName) => {
        switch(themeName) {
            case 'Default': return 'bg-blue-600';
            case 'Charcoal': return 'bg-blue-600';
            case 'Bold': return 'bg-red-600';
            case 'Navy Pop': return 'bg-yellow-400';
            case 'Forest Green': return 'bg-green-600';
            case 'Sunset': return 'bg-gradient-to-r from-orange-500 to-pink-600';
            case 'Lavender': return 'bg-purple-600';
            case 'Minimal': return 'bg-gray-800';
            default: return 'bg-blue-600';
        }
    };

    // Force label color to Black (text-gray-900) for ALL themes
    const getPreviewLabelColor = (themeName) => {
        return 'text-gray-900';
    };

    return (
        <div className="bg-white rounded-xl shadow-2xl w-full max-w-5xl max-h-[90vh] flex flex-col overflow-hidden relative">
            
            {onClose && (
                 <button
                    onClick={onClose}
                    className="absolute top-4 right-4 text-gray-400 hover:text-gray-600 text-2xl z-10"
                >
                    &times;
                </button>
            )}

            <div className="flex-grow flex overflow-hidden"> 
                
                {/* Theme Selector Sidebar */}
                <div className="w-72 p-6 border-r border-gray-200 overflow-y-auto flex-shrink-0 flex flex-col">
                    <h3 className="text-2xl font-bold text-gray-900 mb-6 text-center w-full">
                        Choose a theme
                    </h3>
                    <div className="space-y-5 w-full">
                        {themesArray.map((theme) => (
                            <ThemeCard
                                key={theme.name}
                                theme={theme}
                                isSelected={currentTheme.name === theme.name}
                                onClick={() => setCurrentTheme(theme)}
                            />
                        ))}
                    </div>
                </div>

                {/* --- DYNAMIC THEME PREVIEW AREA --- */}
                {/* CHANGED: justify-center -> justify-start AND p-8 -> p-6 to align headers */}
                <div className={`flex-grow p-6 flex flex-col items-center justify-start overflow-y-auto transition-all duration-300 ${currentTheme.preview}`}>
                    <h4 className={`text-3xl font-bold mb-6 text-center w-full ${currentTheme.previewText}`}>
                        Example form with theme
                    </h4>
                    
                    {/* Mockup Card */}
                    <div className={`p-6 rounded-lg w-full max-w-md shadow-lg
                        ${currentTheme.name === 'Minimal' ? 'bg-white border border-gray-300' : 'bg-white bg-opacity-20 backdrop-filter backdrop-blur-sm border border-white border-opacity-30'}
                    `}>
                        {/* Always Black Text for this Label */}
                        <label className={`block text-md font-medium mb-1 ${getPreviewLabelColor(currentTheme.name)}`}>
                            What is your email?
                        </label>
                        
                        <input 
                            type="email" 
                            placeholder="email@example.com" 
                            className={`w-full p-3 rounded-md focus:outline-none
                                ${currentTheme.name === 'Minimal' 
                                    ? 'bg-gray-100 border-gray-300 text-gray-900' 
                                    : `bg-white bg-opacity-10 border border-white border-opacity-30 ${getPreviewLabelColor(currentTheme.name)} placeholder-gray-300`
                                }
                            `} 
                            disabled 
                        />
                        <button 
                            className={`mt-6 w-full font-bold py-3 rounded-lg shadow-md ${getPreviewButtonBg(currentTheme.name)} ${getPreviewButtonText(currentTheme.name)}`} 
                            disabled
                        >
                            Submit form
                        </button>
                    </div>
                </div>
            </div>

            <div className="flex-shrink-0 p-6 flex justify-between items-center border-t border-gray-200 bg-white">
                <motion.button
                    whileHover={{ scale: 1.05 }}
                    whileTap={{ scale: 0.95 }}
                    onClick={onBack}
                    className={`px-6 py-3 rounded-lg bg-gray-200 text-gray-700 font-semibold hover:bg-gray-300 transition-colors ${!onBack ? 'invisible' : ''}`}
                >
                    Back
                </motion.button>
                <motion.button
                    whileHover={{ scale: 1.05 }}
                    whileTap={{ scale: 0.95 }}
                    onClick={handleCreateForm}
                    className="px-8 py-3 rounded-lg bg-blue-600 text-white font-semibold shadow-md hover:bg-blue-700 transition-colors"
                >
                    {submitText || 'Create form →'}
                </motion.button>
            </div>
        </div>
    );
};

export default ChooseTheme;