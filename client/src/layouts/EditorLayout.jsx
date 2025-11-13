// client/src/layouts/EditorLayout.jsx
import React, { useState, useEffect, useCallback, useRef } from 'react';
import { Outlet, useOutletContext, useParams, useSearchParams, useNavigate } from 'react-router-dom';
import { useUser } from '@clerk/clerk-react';
import axios from 'axios';
import { motion, AnimatePresence } from 'framer-motion'; 

// Import Layout Components
import HorizontalNavbar from '../components/HorizontalNavbar'; 
import EditorSidebar from '../components/FormCreator/EditorSidebar';

// Import Builder Components
import ComprehensionBuilder from '../components/builder/ComprehensionBuilder';
import CategorizeBuilder from '../components/builder/CategorizeBuilder';
import ClozeBuilder from '../components/builder/ClozeBuilder';
import HeadingBuilder from '../components/builder/HeadingBuilder';
import ParagraphBuilder from '../components/builder/ParagraphBuilder';
import BannerBuilder from '../components/builder/BannerBuilder';

// IMPORT THEMES & THEME MODAL
import { themes as themesObject } from '../themes'; 
import ChooseTheme from '../components/FormCreator/ChooseTheme';

const gridBackground = "bg-[length:80px_80px] bg-[linear-gradient(transparent_78px,rgba(59,130,246,0.3)_80px),linear-gradient(90deg,transparent_78px,rgba(59,130,246,0.3)_80px)]";

const EditorLayout = () => {
  const { formId } = useParams(); 
  const [searchParams] = useSearchParams(); 
  const navigate = useNavigate();
  const { user } = useUser();

  const [form, setForm] = useState(null);
  const [loading, setLoading] = useState(true);
  const [activeBuilder, setActiveBuilder] = useState(null);
  const [editingQuestion, setEditingQuestion] = useState(null);
  
  const isNewForm = !formId;
  
  const [isNamingModalOpen, setIsNamingModalOpen] = useState(isNewForm);
  const [isThemeModalOpen, setIsThemeModalOpen] = useState(false);
  const [tempTitle, setTempTitle] = useState('Untitled Form');

  // --- Form Loading Logic ---
  useEffect(() => {
    const fetchForm = async (id) => {
      try {
        const response = await axios.get(`${import.meta.env.VITE_API_BASE_URL}/api/forms/${id}`);
        setForm(response.data);
        setTempTitle(response.data.title);
      } catch (err) {
        console.error("Failed to fetch form", err);
        navigate("/dashboard");
      } finally {
        setLoading(false);
      }
    };

    if (isNewForm) {
      setLoading(false);
      setTempTitle('Untitled Form');
      setIsNamingModalOpen(true);
    } else {
      setIsNamingModalOpen(false);
      fetchForm(formId);
    }
  }, [formId, isNewForm, navigate]);

  // --- Refetch form data ---
  const refetchForm = useCallback(async (idToFetch) => {
    if (idToFetch) {
      try {
        const response = await axios.get(`${import.meta.env.VITE_API_BASE_URL}/api/forms/${idToFetch}`);
        setForm(response.data);
        setTempTitle(response.data.title);
      } catch (err) {
        console.error("Failed to refetch form", err);
      }
    }
  }, []);

  // --- Save/Update Form Title (from modal) ---
  const handleSaveTitle = async () => {
    if (!user) return alert("You must be logged in.");
    const newTitle = tempTitle.trim() || 'Untitled Form';

    try {
        if (isNewForm) {
            const themeName = searchParams.get('theme') || 'Default';
            const formResponse = await axios.post(`${import.meta.env.VITE_API_BASE_URL}/api/forms`, {
                title: newTitle,
                userId: user.id,
                username: user.fullName || user.username,
                theme: themeName,
            });
            setForm(formResponse.data);
            setIsNamingModalOpen(false);
            navigate(`/editor/${formResponse.data._id}`, { replace: true });
        } else {
            const updateResponse = await axios.put(`${import.meta.env.VITE_API_BASE_URL}/api/forms/${formId}`, { title: newTitle });
            setForm(updateResponse.data);
            setIsNamingModalOpen(false);
        }
    } catch (err) {
        console.error("Failed to save form title", err);
        alert("Could not save title. Please try again.");
    }
  };

  // --- Save Question Logic (for builders) ---
  const handleSaveQuestion = async (questionData) => {
    if (isNewForm) return alert("Please name your form first."); 
    if (!user) return alert("You must be logged in.");

    try {
      if (editingQuestion) {
        await axios.put(`${import.meta.env.VITE_API_BASE_URL}/api/forms/questions/${editingQuestion._id}`, questionData);
      } else {
        await axios.post(`${import.meta.env.VITE_API_BASE_URL}/api/forms/${formId}/questions`, questionData);
      }

      setActiveBuilder(null);
      setEditingQuestion(null);
      await refetchForm(formId);

    } catch (err) {
      alert("Error: Could not save the question.");
      console.error(err);
    }
  };

  // --- NEW: Add Simple Field Handler ---
  const handleAddSimpleField = async (fieldType) => {
    if (isNewForm) return alert("Please name your form first.");
    if (!user) return alert("You must be logged in.");

    let questionData = { type: fieldType };

    // Add default content for new fields
    switch (fieldType) {
      case 'Heading':
        questionData.text = 'New Heading';
        break;
      case 'Paragraph':
        questionData.text = 'This is a new paragraph. Click Edit to change this text.';
        break;
      case 'Banner':
        questionData.image = null; // Will be empty until user edits it
        break;
    }

    try {
      await axios.post(`${import.meta.env.VITE_API_BASE_URL}/api/forms/${formId}/questions`, questionData);
      await refetchForm(formId);
      // Scroll to the bottom of the page
      window.scrollTo(0, document.body.scrollHeight);
    } catch (err) {
      alert("Error: Could not add the new field.");
      console.error(err);
    }
  };

  // --- Delete Question Logic ---
  const handleDeleteQuestion = async (questionId) => {
    if (isNewForm) return; 
    if (window.confirm('Are you sure you want to delete this question?')) {
      try {
        await axios.delete(`${import.meta.env.VITE_API_BASE_URL}/api/forms/${formId}/questions/${questionId}`);
        await refetchForm(formId);
      } catch (err) {
        alert('Failed to delete the question.');
        console.error(err);
      }
    }
  };
  
  // --- Handler to update the theme ---
  const handleThemeChange = async (newThemeName) => {
    if (isNewForm || !form) return; 
    try {
      setForm(prevForm => ({ ...prevForm, theme: newThemeName }));
      await axios.put(`${import.meta.env.VITE_API_BASE_URL}/api/forms/${formId}`, { theme: newThemeName });
      refetchForm(formId); 
    } catch (err) {
      console.error("Failed to update theme", err);
      alert("Could not update theme.");
      refetchForm(formId); 
    }
  };

  // --- Save and go to Dashboard ---
  const handleSaveAndGoToDashboard = async () => {
    if (isNewForm) return; 
    if (isNamingModalOpen) {
      await handleSaveTitle();
    }
    navigate('/dashboard');
  };

  // --- Save and Preview ---
  const handleSaveAndPreview = async () => {
    if (isNewForm) return; 
    if (isNamingModalOpen) {
      await handleSaveTitle();
    }
    window.open(`/form/${formId}`, '_blank');
  };

  // --- Function to render the correct builder ---
  const renderBuilder = () => {
    const builderProps = {
      onSave: handleSaveQuestion,
      onCancel: () => {
        setActiveBuilder(null);
        setEditingQuestion(null);
      },
      initialData: editingQuestion,
    };

    const builderType = editingQuestion ? editingQuestion.type : activeBuilder;

    switch (builderType) {
      // Complex builders
      case 'Comprehension':
        return <ComprehensionBuilder {...builderProps} />;
      case 'Categorize':
        return <CategorizeBuilder {...builderProps} />;
      case 'Cloze':
        return <ClozeBuilder {...builderProps} />;
      
      // Simple builders
      case 'Heading':
        return <HeadingBuilder {...builderProps} />;
      case 'Paragraph':
        return <ParagraphBuilder {...builderProps} />;
      case 'Banner':
        return <BannerBuilder {...builderProps} />;

      default:
        return null;
    }
  };

  // --- Context to pass to FormEditorUI ---
  const outletContext = {
    form,
    loading: loading || isNamingModalOpen, 
    themes: themesObject, 
    activeBuilder,
    editingQuestion, 
    renderBuilder, 
    setEditingQuestion, 
    handleDeleteQuestion,
    isNewForm, 
    handleSaveAndGoToDashboard, 
    handleSaveAndPreview,
    setIsThemeModalOpen,
    refetchForm, // Pass refetchForm
  };

  return (
    <div className="min-h-screen bg-sky-50 text-gray-800">
      <HorizontalNavbar 
        sidebarWidthClass="md:left-80" 
        title={form ? form.title : (isNewForm ? '...' : 'Loading...')}
        onTitleClick={() => {
          if (!isNewForm && form) { 
            setTempTitle(form.title);
            setIsNamingModalOpen(true);
          }
        }}
      />

      <EditorSidebar 
        setActiveBuilder={setActiveBuilder}
        onAddSimpleField={handleAddSimpleField} 
      /> 
      
      <main className="ml-0 md:ml-80 flex flex-col h-screen">
        <div className="h-20 flex-shrink-0" />
        
        <div className={`flex-grow overflow-y-auto ${gridBackground}`}>
          <Outlet context={outletContext} />
        </div>
        
      </main>

      {/* --- "Name your form" Modal --- */}
      <AnimatePresence>
          {isNamingModalOpen && (
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              className="fixed inset-0 bg-black/50 backdrop-blur-sm z-50 flex items-center justify-center p-4"
              onClick={() => !isNewForm && setIsNamingModalOpen(false)} 
            >
              <motion.div
                initial={{ scale: 0.9, opacity: 0 }}
                animate={{ scale: 1, opacity: 1 }}
                exit={{ scale: 0.9, opacity: 0 }}
                transition={{ type: 'spring', damping: 20, stiffness: 300 }}
                onClick={(e) => e.stopPropagation()} 
                className="bg-white p-8 rounded-lg shadow-xl w-full max-w-md relative"
              >
                {!isNewForm && (
                  <button
                    onClick={() => setIsNamingModalOpen(false)}
                    className="absolute top-4 right-4 text-gray-400 hover:text-gray-600 text-2xl"
                  >
                    &times;
                  </button>
                )}
                <h3 className="text-2xl font-bold mb-6 text-gray-900">
                  {isNewForm ? 'Name your form' : 'Edit form name'}
                </h3>
                <input
                  type="text"
                  value={tempTitle}
                  onChange={(e) => setTempTitle(e.target.value)}
                  className="w-full p-3 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                  onKeyDown={(e) => { if (e.key === 'Enter') handleSaveTitle(); }}
                  autoFocus
                />
                <button
                  onClick={handleSaveTitle}
                  className="w-full bg-blue-600 text-white font-semibold py-3 rounded-md mt-6 hover:bg-blue-700 transition-colors"
                >
                  {isNewForm ? 'Continue' : 'Save'}
                </button>
              </motion.div>
            </motion.div>
          )}
        </AnimatePresence>

      {/* --- Theme Selector Modal --- */}
       <AnimatePresence>
          {isThemeModalOpen && (
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              className="fixed inset-0 bg-black/50 backdrop-blur-sm z-50 flex items-center justify-center p-4"
              onClick={() => setIsThemeModalOpen(false)} // Close on overlay click
            >
              <motion.div
                initial={{ scale: 0.9, opacity: 0 }}
                animate={{ scale: 1, opacity: 1 }}
                exit={{ scale: 0.9, opacity: 0 }}
                transition={{ type: 'spring', damping: 20, stiffness: 300 }}
                onClick={(e) => e.stopPropagation()} 
                className="relative"
              >
                <ChooseTheme 
                  onSelectTheme={(theme) => {
                    handleThemeChange(theme.name);
                    setIsThemeModalOpen(false);
                  }}
                  onClose={() => setIsThemeModalOpen(false)}
                  submitText="Save Theme"
                />
              </motion.div>
            </motion.div>
          )}
        </AnimatePresence>

    </div>
  );
};

export default EditorLayout;