// client/src/pages/FormCreatorPage.jsx
import React, { useState } from 'react';
import ChooseStart from '../components/FormCreator/ChooseStart';
import ChooseTheme from '../components/FormCreator/ChooseTheme';
import FormEditorUI from '../components/FormCreator/FormEditorUI';

const FormCreatorPage = () => {
    // State to manage the current stage of form creation
    // 'start': Choose how to get started (Blank form, Template)
    // 'theme': Choose a theme
    // 'editor': Main form editor
    const [stage, setStage] = useState('start');
    const [formType, setFormType] = useState(null); // 'blank' or 'template'
    const [selectedTheme, setSelectedTheme] = useState(null); // Stores the selected theme

    const handleSelectStart = (type) => {
        setFormType(type);
        setStage('theme'); // Move to theme selection after choosing start type
    };

    const handleSelectTheme = (theme) => {
        setSelectedTheme(theme);
        setStage('editor'); // Move to editor after selecting a theme
    };

    const handleBackToStart = () => {
        setStage('start');
        setFormType(null);
    };

    const handleBackToTheme = () => {
        setStage('theme');
        setSelectedTheme(null);
    };

    return (
        <div className="min-h-screen bg-gray-100 flex flex-col items-center justify-center p-4">
            {stage === 'start' && (
                <ChooseStart onSelect={handleSelectStart} />
            )}

            {stage === 'theme' && (
                <ChooseTheme onSelectTheme={handleSelectTheme} onBack={handleBackToStart} />
            )}

            {stage === 'editor' && (
                <FormEditorUI selectedTheme={selectedTheme} onBack={handleBackToTheme} />
            )}
        </div>
    );
};

export default FormCreatorPage;