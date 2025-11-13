// client/src/components/FormCreator/AiPromptModal.jsx
import React from 'react';
import { motion } from 'framer-motion';

const AiPromptModal = ({ prompt, setPrompt, isLoading, onSubmit, onBack, onCancel }) => {
    return (
        <div className="bg-white rounded-xl shadow-2xl p-8 w-full max-w-lg mx-auto relative">
            {/* Close Button */}
            <button
                onClick={onCancel}
                className="absolute top-4 right-4 text-gray-400 hover:text-gray-600 text-2xl"
            >
                &times;
            </button>
            
            <h2 className="text-3xl font-bold text-gray-900 mb-6 text-center">Create with AI ✨</h2>
            <p className="text-gray-600 text-center mb-6">
                Describe the quiz you want to create. For example:
                <br />
                <em className="text-sm">"A 5-question quiz about the solar system"</em>
                <br />
                <em className="text-sm">"A simple trivia quiz about 90s movies"</em>
            </p>

            <textarea
                value={prompt}
                onChange={(e) => setPrompt(e.target.value)}
                className="w-full h-32 p-3 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                placeholder="Enter your prompt here..."
                disabled={isLoading}
            />

            <div className="flex justify-between items-center mt-8">
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
                    onClick={onSubmit}
                    disabled={isLoading || !prompt}
                    className="px-8 py-3 rounded-lg bg-blue-600 text-white font-semibold shadow-md hover:bg-blue-700 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
                >
                    {isLoading ? 'Generating...' : 'Generate →'}
                </motion.button>
            </div>
        </div>
    );
};

export default AiPromptModal;