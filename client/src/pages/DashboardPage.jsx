// client/src/pages/DashboardPage.jsx
import { useState, useContext } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import axios from 'axios';
import { motion, AnimatePresence } from 'framer-motion';
import { FormsContext } from './ProtectedLayout'; // Import the context
import { useUser } from '@clerk/clerk-react';

// --- IMPORT THE MODAL COMPONENTS ---
import ChooseStart from '../components/FormCreator/ChooseStart';
import ChooseTheme from '../components/FormCreator/ChooseTheme';
import AiPromptModal from '../components/FormCreator/AiPromptModal';
import ChooseTemplate from '../components/FormCreator/ChooseTemplate'; // <-- 1. IMPORT ChooseTemplate

const DashboardPage = () => {
  const navigate = useNavigate();
  const { userForms: forms, refetchForms } = useContext(FormsContext);
  const { user } = useUser();
  const [loading, setLoading] = useState(false);
  const [copiedFormId, setCopiedFormId] = useState(null);

  // --- STATE FOR MODAL ---
  const [modalStage, setModalStage] = useState(null); // null, 'start', 'ai', 'template', or 'theme'
  const [formType, setFormType] = useState(null); // 'blank', 'ai', or 'template'
  const [selectedTemplateId, setSelectedTemplateId] = useState(null); // <-- 2. ADD state for template
  const [aiPrompt, setAiPrompt] = useState("");
  const [isAiLoading, setIsAiLoading] = useState(false);

  const handleCreateForm = () => {
    setModalStage('start');
  };

  const handleShare = (formId, event) => {
    event.preventDefault();
    event.stopPropagation();
    
    const shareLink = `${window.location.origin}/form/${formId}`;
    navigator.clipboard.writeText(shareLink).then(() => {
      setCopiedFormId(formId);
      setTimeout(() => setCopiedFormId(null), 2000);
    });
  };

  const handleDelete = async (formId, formTitle, event) => {
    event.preventDefault();
    event.stopPropagation();

    if (window.confirm(`Are you sure you want to delete "${formTitle}"? This action cannot be undone.`)) {
      try {
        await axios.delete(`${import.meta.env.VITE_API_BASE_URL}/api/forms/${formId}`);
        refetchForms();
      } catch (error) {
        console.error("Failed to delete form", error);
        alert("Could not delete the form. Please try again.");
      }
    }
  };
  
  const handleModalClose = () => {
    setModalStage(null);
    setFormType(null);
    setAiPrompt("");
    setIsAiLoading(false);
    setSelectedTemplateId(null); // <-- 3. RESET template ID
  };

  const handleStartSelect = (type) => {
    setFormType(type);
    if (type === 'ai') {
      setModalStage('ai');
    } else if (type === 'template') { // <-- 4. UPDATE this logic
      setModalStage('template');
    } else { // 'blank'
      setModalStage('theme');
    }
  };

  // <-- 5. ADD new handler for template selection
  const handleTemplateSelect = (templateId) => {
    setSelectedTemplateId(templateId);
    setModalStage('theme'); // Go to theme selection
  };

  const handleThemeBack = () => {
    // <-- 6. UPDATE this logic
    if (formType === 'template') {
      setModalStage('template'); // Go back to template selection
    } else {
      setModalStage('start'); // Go back to start
    }
  };

  const handleThemeCreate = (theme) => {
    // <-- 7. UPDATE this logic
    const themeName = encodeURIComponent(theme.name);
    let url = '/editor/new';

    if (formType === 'template' && selectedTemplateId) {
      url = `/editor/new?template=${selectedTemplateId}&theme=${themeName}`;
    } else { // 'blank'
      url = `/editor/new?theme=${themeName}`;
    }
    
    window.open(url, '_blank');
    handleModalClose();
  };

  const handleAiSubmit = async () => {
      if (!user || !aiPrompt) return;

      setIsAiLoading(true);
      try {
          const response = await axios.post(`${import.meta.env.VITE_API_BASE_URL}/api/ai/generate`, {
              prompt: aiPrompt,
              userId: user.id,
              username: user.fullName || user.username,
          });

          const { formId } = response.data;
          if (formId) {
              refetchForms();
              window.open(`/editor/${formId}`, '_blank');
              handleModalClose();
          } else {
              throw new Error("Failed to get formId from response");
          }
      } catch (error) {
          console.error("Failed to generate AI form", error);
          alert("Error: Could not generate the form. Please check the console and try again.");
          setIsAiLoading(false);
      }
  };

  const handleAiBack = () => {
      setModalStage('start');
  };


  if (loading) {
    return (
        <div className="flex items-center justify-center p-8">
            <p className="text-gray-500">Loading your forms...</p>
        </div>
    );
  }

  return (
    <>
      {/* --- MODAL CONTAINER --- */}
      <AnimatePresence>
        {modalStage && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 bg-black/50 backdrop-blur-sm z-50 flex items-center justify-center p-4"
            onClick={handleModalClose}
          >
            <motion.div
              initial={{ scale: 0.9, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              exit={{ scale: 0.9, opacity: 0 }}
              transition={{ type: 'spring', damping: 20, stiffness: 300 }}
              onClick={(e) => e.stopPropagation()} 
              className="relative"
            >
              {modalStage === 'start' && (
                <ChooseStart onSelect={handleStartSelect} onCancel={handleModalClose} />
              )}

              {modalStage === 'ai' && (
                <AiPromptModal
                  prompt={aiPrompt}
                  setPrompt={setAiPrompt}
                  isLoading={isAiLoading}
                  onSubmit={handleAiSubmit}
                  onBack={handleAiBack}
                  onCancel={handleModalClose}
                />
              )}

              {/* -- 8. ADD template stage to modal */}
              {modalStage === 'template' && (
                <ChooseTemplate
                  onSelectTemplate={handleTemplateSelect}
                  onBack={() => setModalStage('start')}
                  onCancel={handleModalClose}
                />
              )}

              {modalStage === 'theme' && (
                <ChooseTheme 
                  onSelectTheme={handleThemeCreate} 
                  onBack={handleThemeBack} 
                  onClose={handleModalClose}
                />
              )}
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
      
      {/* --- ORIGINAL PAGE CONTENT --- */}
      <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }}>
          <div className="flex justify-between items-center mb-10">
              <h1 className="text-4xl font-bold text-gray-900">Your Forms</h1>
              <motion.button 
                  whileHover={{ scale: 1.05 }}
                  whileTap={{ scale: 0.95 }}
                  onClick={handleCreateForm}
                  className="glow-btn"
              >
                  + Create New Form
              </motion.button>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
              {forms.length > 0 ? (
                  forms.map((form) => (
                      <div key={form._id} className="flex flex-col bg-white rounded-xl shadow-md border border-gray-200 border-t-4 border-t-blue-400">
                          <Link to={`/editor/${form._id}`} className="block p-6 flex-grow hover:bg-gray-50 rounded-t-xl transition-colors">
                              <h3 className="text-xl font-semibold mb-2 truncate text-gray-800">{form.title}</h3>
                              <p className="text-gray-500 text-sm">{form.responses.length} response(s)</p>
                          </Link>
                          <div className="p-4 flex gap-2 border-t border-gray-200">
                              <button 
                                onClick={(e) => handleShare(form._id, e)}
                                className={`w-full py-2 rounded-lg text-sm font-semibold transition-colors ${
                                  copiedFormId === form._id 
                                  ? 'bg-green-100 text-green-700' 
                                  : 'bg-purple-100 text-purple-700 hover:bg-purple-200'
                                }`}
                              >
                                {copiedFormId === form._id ? 'Copied!' : 'Share'}
                              </button>
                              <Link to={`/editor/${form._id}`} className="w-full">
                                  <button className="w-full bg-blue-100 text-blue-700 py-2 rounded-lg text-sm font-semibold hover:bg-blue-200 transition-colors">
                                    Edit
                                  </button>
                              </Link>
                              <button 
                                onClick={(e) => handleDelete(form._id, form.title, e)}
                                className="p-2 px-3 bg-red-100 text-red-700 rounded-lg text-sm font-semibold hover:bg-red-200 transition-colors"
                                title="Delete Form"
                              >
                                🗑️
                              </button>
                          </div>
                      </div>
                  ))
              ) : (
                  <div className="col-span-full text-center py-16 bg-white rounded-xl border border-gray-200 shadow-md border-t-4 border-t-blue-400">
                      <h3 className="text-2xl font-semibold text-gray-800">No forms yet!</h3>
                      <p className="text-gray-500 mt-2">Click "Create New Form" to get started.</p>
                  </div>
              )}
          </div>
      </motion.div>
    </>
  );
};

export default DashboardPage;