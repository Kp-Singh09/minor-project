// client/src/layouts/EditorLayout.jsx
import React, { useState, useEffect, useCallback } from 'react';
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

// --- IMPORT THEMES FROM THE NEW FILE ---
import { themes as themesObject } from '../themes'; 

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

  // --- Save Question Logic ---
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
      case 'Comprehension':
        return <ComprehensionBuilder {...builderProps} />;
      case 'Categorize':
        return <CategorizeBuilder {...builderProps} />;
      case 'Cloze':
        return <ClozeBuilder {...builderProps} />;
      default:
        return null;
    }
  };

  // --- Context to pass to FormEditorUI ---
  const outletContext = {
    form,
    loading: loading || isNamingModalOpen, 
    themes: themesObject, // <-- PASS THE IMPORTED THEMES
    activeBuilder,
    editingQuestion, 
    renderBuilder, 
    setEditingQuestion, 
    handleDeleteQuestion,
    isNewForm, 
    handleSaveAndGoToDashboard, 
    handleSaveAndPreview, 
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

      <EditorSidebar setActiveBuilder={setActiveBuilder} /> 
      
      <main className="ml-0 md:ml-80 flex flex-col h-screen">
        <div className="h-20 flex-shrink-0" />
        
        <div className="flex-grow overflow-y-auto">
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
    </div>
  );
};

export default EditorLayout;