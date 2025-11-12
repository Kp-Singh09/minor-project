// client/src/components/FormCreator/ChooseTheme.jsx
import React, { useState } from 'react';
import { motion } from 'framer-motion';

// Mock themes
const themes = [
    { name: 'Default', preview: 'bg-gradient-to-br from-blue-400 to-indigo-600', text: 'text-white' },
    { name: 'Charcoal', preview: 'bg-gray-800', text: 'text-gray-200' },
    { name: 'Bold', preview: 'bg-red-500', text: 'text-white' },
    { name: 'Navy Pop', preview: 'bg-blue-900', text: 'text-yellow-300' },
    { name: 'Forest Green', preview: 'bg-green-700', text: 'text-green-100' },
    { name: 'Sunset', preview: 'bg-gradient-to-br from-orange-400 to-pink-500', text: 'text-white' },
    { name: 'Lavender', preview: 'bg-purple-200', text: 'text-purple-800' },
    { name: 'Minimal', preview: 'bg-white border-2 border-gray-300', text: 'text-gray-800' },
];

// --- UPDATED ThemeCard ---
// Made this wider (w-full) and a bit shorter (h-24) to match the new sidebar
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
            <p className={`font-semibold ${theme.text}`}>{theme.name}</p>
        </div>
    </motion.div>
);

const ChooseTheme = ({ onSelectTheme, onBack }) => {
    const [currentTheme, setCurrentTheme] = useState(themes[0]);

    const handleCreateForm = () => {
        onSelectTheme(currentTheme);
    };

    return (
        // --- UPDATED MAIN CONTAINER ---
        // 1. Set max width and height for the modal
        // 2. Use flex-col to separate main content from buttons
        <div className="bg-white rounded-xl shadow-2xl w-full max-w-5xl max-h-[90vh] flex flex-col overflow-hidden">
            
            {/* --- TOP CONTENT AREA (SCROLLABLE) --- */}
            <div className="flex-grow flex overflow-hidden"> 
                
                {/* Theme Selector Sidebar */}
                <div className="w-72 p-6 border-r border-gray-200 overflow-y-auto flex-shrink-0">
                    <h3 className="text-2xl font-bold text-gray-900 mb-6">Choose a theme</h3>
                    <div className="space-y-5">
                        {themes.map((theme) => (
                            <ThemeCard
                                key={theme.name}
                                theme={theme}
                                isSelected={currentTheme.name === theme.name}
                                onClick={() => setCurrentTheme(theme)}
                            />
                        ))}
                    </div>
                </div>

                {/* Theme Preview Area */}
                <div className="flex-grow p-8 flex flex-col justify-between overflow-y-auto" style={{ background: currentTheme.preview }}>
                    {/* Mockup Preview */}
                    <div className="flex flex-col items-center justify-center p-8 rounded-xl min-h-[400px]">
                        <h4 className={`text-3xl font-bold mb-6 ${currentTheme.text}`}>Example form with theme</h4>
                        <div className="bg-white bg-opacity-20 backdrop-filter backdrop-blur-sm p-6 rounded-lg w-full max-w-md shadow-inner">
                            <label className={`block text-md font-medium mb-1 ${currentTheme.text}`}>What is your email?</label>
                            <input type="email" placeholder="email@example.com" className="w-full p-3 rounded-md bg-white bg-opacity-10 border border-white border-opacity-30 text-white placeholder-gray-300 focus:outline-none" disabled />
                            {/* ... other example fields ... */}
                            <button className="mt-6 w-full bg-yellow-400 text-blue-900 font-bold py-3 rounded-lg shadow-md" disabled>
                                Submit form
                            </button>
                        </div>
                    </div>
                </div>
            </div>

            {/* --- BOTTOM BUTTONS AREA (FIXED) --- */}
            <div className="flex-shrink-0 p-6 flex justify-between items-center border-t border-gray-200 bg-white">
                <motion.button
                    whileHover={{ scale: 1.05 }}
                    whileTap={{ scale: 0.95 }}
                    onClick={onBack}
                    className="px-6 py-3 rounded-lg bg-gray-200 text-gray-700 font-semibold hover:bg-gray-300 transition-colors"
                >
                    Back
                </motion.button>
                <motion.button
                    whileHover={{ scale: 1.05 }}
                    whileTap={{ scale: 0.95 }}
                    onClick={handleCreateForm}
                    className="px-8 py-3 rounded-lg bg-blue-600 text-white font-semibold shadow-md hover:bg-blue-700 transition-colors"
                >
                    Create form &rarr;
                </motion.button>
            </div>
        </div>
    );
};

export default ChooseTheme;