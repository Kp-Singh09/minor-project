// client/src/components/FormCreator/FormEditorUI.jsx
import React, { useRef } from 'react';
import { motion } from 'framer-motion';
import { useOutletContext } from 'react-router-dom';
import axios from 'axios';

// --- Simple Card for Heading ---
const HeadingCard = ({ question, onEdit, onDelete, theme }) => (
  <div className={`p-6 rounded-lg w-full ${theme.input} bg-opacity-30 border border-gray-500/20`}>
    <div className="flex justify-between items-start">
      <h2 className={`text-3xl font-bold ${theme.text}`}>{question.text}</h2>
      <div className="flex gap-2 flex-shrink-0 ml-4">
        <button onClick={() => onEdit(question)} className="text-sm bg-blue-100 text-blue-700 hover:bg-blue-200 py-1 px-3 rounded-md">Edit</button>
        <button onClick={() => onDelete(question._id)} className="text-sm bg-red-100 text-red-700 hover:bg-red-200 py-1 px-3 rounded-md">Delete</button>
      </div>
    </div>
  </div>
);

// --- Simple Card for Paragraph ---
const ParagraphCard = ({ question, onEdit, onDelete, theme }) => (
  <div className={`p-6 rounded-lg w-full ${theme.input} bg-opacity-30 border border-gray-500/20`}>
    <div className="flex justify-between items-start">
      <p className={`text-base ${theme.secondaryText}`}>{question.text}</p>
      <div className="flex gap-2 flex-shrink-0 ml-4">
        <button onClick={() => onEdit(question)} className="text-sm bg-blue-100 text-blue-700 hover:bg-blue-200 py-1 px-3 rounded-md">Edit</button>
        <button onClick={() => onDelete(question._id)} className="text-sm bg-red-100 text-red-700 hover:bg-red-200 py-1 px-3 rounded-md">Delete</button>
      </div>
    </div>
  </div>
);

// --- Simple Card for Banner ---
const BannerCard = ({ question, onEdit, onDelete, theme }) => (
  <div className={`p-6 rounded-lg w-full ${theme.input} bg-opacity-30 border border-gray-500/20`}>
    <div className="flex justify-between items-center mb-4">
      <p className={`text-lg font-semibold ${theme.text}`}>Banner Image</p>
      <div className="flex gap-2">
        <button onClick={() => onEdit(question)} className="text-sm bg-blue-100 text-blue-700 hover:bg-blue-200 py-1 px-3 rounded-md">Edit</button>
        <button onClick={() => onDelete(question._id)} className="text-sm bg-red-100 text-red-700 hover:bg-red-200 py-1 px-3 rounded-md">Delete</button>
      </div>
    </div>
    {question.image ? (
      <img src={question.image} alt="Banner" className="w-full h-auto object-cover rounded-md" />
    ) : (
      <div className="text-center p-4 border-2 border-dashed border-gray-400 rounded-md">
        <p className={theme.secondaryText}>No image uploaded. Click 'Edit' to add one.</p>
      </div>
    )}
  </div>
);

// --- Card for Complex Questions (existing) ---
const QuestionCard = ({ question, index, onEdit, onDelete, theme }) => {
    return (
        <div className={`p-6 rounded-lg w-full ${theme.input} bg-opacity-30 border border-gray-500/20`}>
            <div className="flex justify-between items-center">
                <p className={`text-lg font-semibold ${theme.text}`}>
                    Question {index + 1}: {question.type}
                </p>
                <div className="flex gap-2">
                    <button 
                        onClick={() => onEdit(question)} 
                        className="text-sm bg-blue-100 text-blue-700 hover:bg-blue-200 py-1 px-3 rounded-md"
                    >
                        Edit
                    </button>
                    <button 
                        onClick={() => onDelete(question._id)} 
                        className="text-sm bg-red-100 text-red-700 hover:bg-red-200 py-1 px-3 rounded-md"
                    >
                        Delete
                    </button>
                </div>
            </div>
        </div>
    );
};


const FormEditorUI = () => {
    const { 
        form, 
        loading, 
        themes, 
        activeBuilder, 
        editingQuestion, 
        renderBuilder, 
        setEditingQuestion,
        handleDeleteQuestion,
        isNewForm,
        handleSaveAndGoToDashboard,
        handleSaveAndPreview,
        setIsThemeModalOpen,
        refetchForm 
    } = useOutletContext();
    
    const fileInputRef = useRef(null);

    const handleHeaderImageUpload = async (event) => {
        const file = event.target.files[0];
        if (!file || isNewForm || !form) return;

        try {
            const authResponse = await axios.get(`${import.meta.env.VITE_API_BASE_URL}/api/imagekit/auth`);
            const formData = new FormData();
            formData.append('file', file);
            formData.append('fileName', file.name);
            formData.append('publicKey', import.meta.env.VITE_IMAGEKIT_PUBLIC_KEY);
            formData.append('signature', authResponse.data.signature);
            formData.append('expire', authResponse.data.expire);
            formData.append('token', authResponse.data.token);

            const uploadResponse = await axios.post('https://upload.imagekit.io/api/v1/files/upload', formData);
            const imageUrl = uploadResponse.data.url;

            await axios.put(`${import.meta.env.VITE_API_BASE_URL}/api/forms/${form._id}`, { headerImage: imageUrl });
      
            if(refetchForm) refetchForm(form._id);
            
        } catch (err) {
            alert('Failed to upload header image.');
            console.error(err);
        }
    };


    if (loading) {
        return <div className="p-8 text-center text-gray-600">Loading Editor...</div>;
    }

    if (!form) {
        return <div className="p-8 text-center text-red-500">Could not load form.</div>;
    }

    const selectedTheme = themes[form.theme] || themes['Default'];

    return (
        <motion.div 
            initial={{ opacity: 0 }} 
            animate={{ opacity: 1 }} 
            className="p-8 min-h-full" 
        >
            <input 
                type="file" 
                ref={fileInputRef} 
                onChange={handleHeaderImageUpload} 
                style={{ display: 'none' }} 
                accept="image/*" 
            />

            <div className="w-full max-w-2xl mx-auto flex justify-start gap-4 mb-4 ml-2">
                 <motion.button
                    whileHover={{ scale: 1.05 }}
                    whileTap={{ scale: 0.95 }}
                    onClick={() => setIsThemeModalOpen(true)}
                    disabled={isNewForm}
                    className="flex items-center gap-2 px-5 py-2 rounded-lg bg-white text-gray-700 font-semibold shadow-md hover:bg-gray-100 transition-colors disabled:opacity-50 disabled:cursor-not-allowed border border-gray-300"
                >
                    <span className="text-xl">🖌️</span>
                    Theme
                </motion.button>
                
                 <motion.button
                    whileHover={{ scale: 1.05 }}
                    whileTap={{ scale: 0.95 }}
                    onClick={() => fileInputRef.current.click()}
                    disabled={isNewForm}
                    className="flex items-center gap-2 px-5 py-2 rounded-lg bg-white text-gray-700 font-semibold shadow-md hover:bg-gray-100 transition-colors disabled:opacity-50 disabled:cursor-not-allowed border border-gray-300"
                >
                    <span className="text-xl">🖼️</span>
                    {form.headerImage ? 'Change Header' : 'Add Header'}
                </motion.button>
            </div>

            {/* --- Main Canvas --- */}
            <div 
                className={`w-full max-w-2xl min-h-[600px] rounded-lg shadow-xl border border-gray-300 flex flex-col items-center gap-6 p-8 mx-auto ${selectedTheme.cardBg} ${selectedTheme.text}`}
            >
                {form.headerImage && (
                    <div className="w-full rounded-md overflow-hidden">
                        <img src={form.headerImage} alt="Form Header" className="w-full h-auto object-cover" />
                    </div>
                )}

                {form.questions && form.questions.length > 0 ? (
                    form.questions.map((q, index) => {
                        switch (q.type) {
                            case 'Heading':
                                return <HeadingCard key={q._id} question={q} onEdit={setEditingQuestion} onDelete={handleDeleteQuestion} theme={selectedTheme} />;
                            case 'Paragraph':
                                return <ParagraphCard key={q._id} question={q} onEdit={setEditingQuestion} onDelete={handleDeleteQuestion} theme={selectedTheme} />;
                            case 'Banner':
                                return <BannerCard key={q._id} question={q} onEdit={setEditingQuestion} onDelete={handleDeleteQuestion} theme={selectedTheme} />;
                            
                            case 'Comprehension':
                            case 'Cloze':
                            case 'Categorize':
                                return <QuestionCard key={q._id} question={q} index={index} onEdit={setEditingQuestion} onDelete={handleDeleteQuestion} theme={selectedTheme} />;
                                
                            default:
                                return (
                                    <div key={q._id} className="p-4 bg-red-100 text-red-700 rounded-md w-full">
                                        Unsupported field type: {q.type}
                                    </div>
                                );
                        }
                    })
                ) : (
                    <p className={`text-center ${selectedTheme.secondaryText} opacity-60`}>
                        {activeBuilder ? 'Building new question...' : 'Drag and drop questions from the left-hand side.'}
                    </p>
                )}

                {(activeBuilder || editingQuestion) && (
                    <div className="w-full">
                        {renderBuilder()}
                    </div>
                )}
            </div>

            {/* --- 
                THIS IS THE SECTION THAT WAS MISSING 
            --- */}
            <div className="w-full max-w-2xl mx-auto flex justify-end gap-4 mt-8">
                <motion.button
                    whileHover={{ scale: 1.05 }}
                    whileTap={{ scale: 0.95 }}
                    onClick={handleSaveAndPreview}
                    disabled={isNewForm}
                    className="px-6 py-3 rounded-lg bg-blue-600 text-white font-semibold shadow-md hover:bg-blue-700 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
                >
                    Preview
                </motion.button>
                <motion.button
                    whileHover={{ scale: 1.05 }}
                    whileTap={{ scale: 0.95 }}
                    onClick={handleSaveAndGoToDashboard}
                    disabled={isNewForm}
                    className="px-6 py-3 rounded-lg bg-green-600 text-white font-semibold shadow-md hover:bg-green-700 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
                >
                    Save Form
                </motion.button>
            </div>
        </motion.div>
    );
};

export default FormEditorUI;