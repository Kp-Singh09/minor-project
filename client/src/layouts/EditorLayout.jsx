// client/src/layouts/EditorLayout.jsx
import React, { useState, useEffect, useCallback, useRef } from 'react';
import { Outlet, useOutletContext, useParams, useSearchParams, useNavigate } from 'react-router-dom';
import { useUser } from '@clerk/clerk-react';
import api from '../api/axiosConfig'; // <--- 1. USE YOUR NEW API INSTANCE
import { toast } from 'react-hot-toast'; // <--- 2. IMPORT TOAST
import { motion, AnimatePresence } from 'framer-motion'; 

// Import Layout Components
import HorizontalNavbar from '../components/HorizontalNavbar'; 
import EditorSidebar from '../components/FormCreator/EditorSidebar';

// Import ALL Builder Components
import ComprehensionBuilder from '../components/builder/ComprehensionBuilder';
import CategorizeBuilder from '../components/builder/CategorizeBuilder';
import ClozeBuilder from '../components/builder/ClozeBuilder';
import HeadingBuilder from '../components/builder/HeadingBuilder';
import ParagraphBuilder from '../components/builder/ParagraphBuilder';
import BannerBuilder from '../components/builder/BannerBuilder';
import ShortAnswerBuilder from '../components/builder/ShortAnswerBuilder';
import LongAnswerBuilder from '../components/builder/LongAnswerBuilder';
import MultipleChoiceBuilder from '../components/builder/MultipleChoiceBuilder';
import EmailBuilder from '../components/builder/EmailBuilder';
import CheckboxBuilder from '../components/builder/CheckboxBuilder';
import DropdownBuilder from '../components/builder/DropdownBuilder';
import SwitchBuilder from '../components/builder/SwitchBuilder';
import PictureChoiceBuilder from '../components/builder/PictureChoiceBuilder';

// IMPORT THEMES & THEME MODAL
import { themes as themesObject } from '../themes'; 
import ChooseTheme from '../components/FormCreator/ChooseTheme';

// IMPORT TEMPLATES
import { templates } from '../templates'; 

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
        const response = await api.get(`/api/forms/${id}`); // Use api
        setForm(response.data);
        setTempTitle(response.data.title);
      } catch (err) {
        // Error toast handled by axiosConfig
        navigate("/dashboard");
      } finally {
        setLoading(false);
      }
    };

    if (isNewForm) {
      setLoading(false);
      
      const templateId = searchParams.get('template');
      let initialTitle = 'Untitled Form';
      if (templateId && templates[templateId]) {
        initialTitle = templates[templateId].data.title; 
      }
      setTempTitle(initialTitle); 

      setIsNamingModalOpen(true);
    } else {
      setIsNamingModalOpen(false);
      fetchForm(formId);
    }
  }, [formId, isNewForm, navigate, searchParams]);

  // --- Refetch form data ---
  const refetchForm = useCallback(async (idToFetch) => {
    if (idToFetch) {
      try {
        const response = await api.get(`/api/forms/${idToFetch}`); // Use api
        setForm(response.data);
        setTempTitle(response.data.title);
      } catch (err) {
        console.error("Failed to refetch form", err);
      }
    }
  }, []);

  // --- Save/Update Form Title (from modal) ---
  const handleSaveTitle = async () => {
    if (!user) return toast.error("You must be logged in.");
    const newTitle = tempTitle.trim() || 'Untitled Form';

    try {
        if (isNewForm) {
            const themeName = searchParams.get('theme') || 'Light';
            const templateId = searchParams.get('template');
            
            let payload = {
                title: newTitle,
                userId: user.id,
                username: user.fullName || user.username,
                theme: themeName,
            };
    
            if (templateId && templates[templateId]) {
                const template = templates[templateId];
                if (newTitle === template.data.title) {
                    payload.title = template.data.title;
                }
                payload.questions = template.data.questions;
            }
    
            const formResponse = await api.post(`/api/forms`, payload); // Use api
            
            setForm(formResponse.data);
            setIsNamingModalOpen(false);
            toast.success("Form created!");
            navigate(`/editor/${formResponse.data._id}`, { replace: true });
        } else {
            await api.put(`/api/forms/${formId}`, { title: newTitle }); // Use api
            await refetchForm(formId); 
            setIsNamingModalOpen(false);
            toast.success("Title updated");
        }
    } catch (err) {
        console.error("Failed to save form title", err);
    }
  };

  const handleSaveQuestion = async (questionData) => {
    if (isNewForm) return toast.error("Please name your form first."); 
    if (!user) return toast.error("You must be logged in.");

    const toastId = toast.loading("Saving question...");

    try {
      if (editingQuestion) {
        await api.put(`/api/forms/questions/${editingQuestion._id}`, questionData);
      } else {
        await api.post(`/api/forms/${formId}/questions`, questionData);
      }

      setActiveBuilder(null);
      setEditingQuestion(null);
      await refetchForm(formId);
      toast.success("Question saved!", { id: toastId });

    } catch (err) {
      toast.dismiss(toastId);
      console.error(err);
    }
  };

  const handleAddSimpleField = async (fieldType) => {
    if (isNewForm) return toast.error("Please name your form first.");
    if (!user) return toast.error("You must be logged in.");

    let questionData = { type: fieldType };

    // ... (Your existing switch case for default data) ...
    switch (fieldType) {
      case 'Heading': questionData.text = 'New Heading'; break;
      case 'Paragraph': questionData.text = 'This is a new paragraph. Click Edit to change this text.'; break;
      case 'Banner': questionData.image = null; break;
      case 'ShortAnswer': questionData.text = 'Short Answer Question'; break;
      case 'LongAnswer': questionData.text = 'Long Answer Question'; break;
      case 'Email': questionData.text = 'Email'; break;
      case 'MultipleChoice':
        questionData.text = 'Multiple Choice Question';
        questionData.options = ['Option 1', 'Option 2'];
        questionData.correctAnswer = 'Option 1';
        break;
      case 'Checkbox':
        questionData.text = 'Checkbox Question';
        questionData.options = ['Option 1', 'Option 2'];
        questionData.correctAnswers = ['Option 1'];
        break;
      case 'Dropdown':
        questionData.text = 'Dropdown Question';
        questionData.options = ['Option 1', 'Option 2'];
        questionData.correctAnswer = 'Option 1';
        break;
      case 'Switch': questionData.text = 'Do you agree?'; break;
      case 'PictureChoice':
        questionData.text = 'Which one is correct?';
        questionData.options = [null, null];
        questionData.correctAnswer = null;
        break;
    }

    const toastId = toast.loading("Adding field...");
    try {
      await api.post(`/api/forms/${formId}/questions`, questionData);
      await refetchForm(formId);
      window.scrollTo(0, document.body.scrollHeight);
      toast.success("Field added", { id: toastId });
    } catch (err) {
      toast.dismiss(toastId);
      console.error(err);
    }
  };

  // --- REPLACED: New handleDeleteQuestion with Confirmation Toast ---
  const handleDeleteQuestion = (questionId) => {
    if (isNewForm) return; 

    // Render a custom toast component
    toast((t) => (
      <div className="flex flex-col gap-2">
        <p className="font-semibold text-gray-800">Delete this question?</p>
        <p className="text-sm text-gray-500">This action cannot be undone.</p>
        <div className="flex gap-2 mt-1">
          <button
            onClick={() => {
              toast.dismiss(t.id); // Close the confirmation toast
              performDeleteQuestion(questionId); // Trigger the actual delete
            }}
            className="bg-red-500 text-white px-3 py-1.5 rounded-md text-sm font-medium hover:bg-red-600 transition-colors"
          >
            Delete
          </button>
          <button
            onClick={() => toast.dismiss(t.id)}
            className="bg-gray-100 text-gray-700 px-3 py-1.5 rounded-md text-sm font-medium hover:bg-gray-200 transition-colors"
          >
            Cancel
          </button>
        </div>
      </div>
    ), { duration: 5000, icon: '🗑️' });
  };

  // Helper function to execute the delete logic
  const performDeleteQuestion = async (questionId) => {
    const toastId = toast.loading("Deleting...");
    try {
      await api.delete(`/api/forms/${formId}/questions/${questionId}`);
      await refetchForm(formId);
      toast.success("Question deleted", { id: toastId });
    } catch (err) {
      toast.dismiss(toastId);
      console.error(err);
    }
  };
  
  const handleThemeChange = async (newThemeName) => {
    if (isNewForm || !form) return; 
    
    // Optimistic update locally
    setForm(prevForm => ({ ...prevForm, theme: newThemeName }));
    
    try {
      await api.put(`/api/forms/${formId}`, { theme: newThemeName });
      toast.success("Theme saved");
    } catch (err) {
      console.error("Failed to update theme", err);
      refetchForm(formId); // Revert on error
    }
  };

  const handleSaveAndGoToDashboard = async () => {
    if (isNewForm) return; 
    if (isNamingModalOpen) {
      await handleSaveTitle();
    }
    toast.success("Form saved!");
    navigate('/dashboard');
  };

  const handleSaveAndPreview = async () => {
    if (isNewForm) return; 
    if (isNamingModalOpen) {
      await handleSaveTitle();
    }
    window.open(`/form/${formId}`, '_blank');
  };

  const currentTheme = form ? (themesObject[form.theme] || themesObject['Light']) : themesObject['Light'];

  const renderBuilder = () => {
    const builderProps = {
      onSave: handleSaveQuestion,
      onCancel: () => {
        setActiveBuilder(null);
        setEditingQuestion(null);
      },
      initialData: editingQuestion,
      theme: currentTheme,
    };

    const builderType = editingQuestion ? editingQuestion.type : activeBuilder;

    switch (builderType) {
      case 'Comprehension': return <ComprehensionBuilder {...builderProps} />;
      case 'Categorize': return <CategorizeBuilder {...builderProps} />;
      case 'Cloze': return <ClozeBuilder {...builderProps} />;
      case 'Heading': return <HeadingBuilder {...builderProps} />;
      case 'Paragraph': return <ParagraphBuilder {...builderProps} />;
      case 'Banner': return <BannerBuilder {...builderProps} />;
      case 'ShortAnswer': return <ShortAnswerBuilder {...builderProps} />;
      case 'LongAnswer': return <LongAnswerBuilder {...builderProps} />;
      case 'Email': return <EmailBuilder {...builderProps} />;
      case 'MultipleChoice': return <MultipleChoiceBuilder {...builderProps} />;
      case 'Checkbox': return <CheckboxBuilder {...builderProps} />;
      case 'Dropdown': return <DropdownBuilder {...builderProps} />;
      case 'Switch': return <SwitchBuilder {...builderProps} />;
      case 'PictureChoice': return <PictureChoiceBuilder {...builderProps} />;
      default: return null;
    }
  };

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
    refetchForm,
  };

  return (
    <div className="min-h-screen bg-sky-50 text-gray-800">
      <HorizontalNavbar 
        sidebarWidthClass="md:left-80" 
        title={form ? form.title : (tempTitle || 'Loading...')}
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

      {/* ... (Keep existing Modals for Naming and Theme) ... */}
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
                  <button onClick={() => setIsNamingModalOpen(false)} className="absolute top-4 right-4 text-gray-400 hover:text-gray-600 text-2xl">&times;</button>
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
                  onFocus={(e) => e.target.select()}
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

       <AnimatePresence>
          {isThemeModalOpen && (
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              className="fixed inset-0 bg-black/50 backdrop-blur-sm z-50 flex items-center justify-center p-4"
              onClick={() => setIsThemeModalOpen(false)} 
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