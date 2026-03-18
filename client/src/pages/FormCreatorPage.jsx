// client/src/pages/FormCreatorPage.jsx
import React, { useState } from 'react';
import ChooseStart from '../components/FormCreator/ChooseStart';
import ChooseTheme from '../components/FormCreator/ChooseTheme';
import FormEditorUI from '../components/FormCreator/FormEditorUI';

const FormCreatorPage = () => {
    const [stage, setStage] = useState('start');
    const [formType, setFormType] = useState(null); 
    const [selectedTheme, setSelectedTheme] = useState(null); 

    const handleSelectStart = (type) => {
        setFormType(type);
        setStage('theme'); 
    };

    const handleSelectTheme = (theme) => {
        setSelectedTheme(theme);
        setStage('editor'); 
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
        <div className="min-h-screen bg-slate-950 flex flex-col items-center justify-center p-4 relative overflow-hidden">
            {/* Dark Mode Ambient Background matching Dashboard */}
            <div className="absolute inset-0 z-0 pointer-events-none">
                <div className="absolute top-1/4 left-1/4 w-[500px] h-[500px] bg-indigo-600/10 rounded-full blur-[120px]" />
                <div className="absolute bottom-1/4 right-1/4 w-[500px] h-[500px] bg-purple-600/10 rounded-full blur-[120px]" />
            </div>

            <div className="relative z-10 w-full flex flex-col items-center">
                {stage === 'start' && (
                    <ChooseStart onSelect={handleSelectStart} onCancel={() => window.history.back()} />
                )}

                {stage === 'theme' && (
                    <ChooseTheme onSelectTheme={handleSelectTheme} onBack={handleBackToStart} />
                )}

                {stage === 'editor' && (
                    <FormEditorUI selectedTheme={selectedTheme} onBack={handleBackToTheme} />
                )}
            </div>
        </div>
    );
};

export default FormCreatorPage;