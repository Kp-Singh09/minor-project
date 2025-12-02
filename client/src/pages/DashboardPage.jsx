// client/src/pages/DashboardPage.jsx
import { useState, useContext } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import axios from 'axios';
import api from '../api/axiosConfig'; // Use your config
import { motion, AnimatePresence } from 'framer-motion';
import { FormsContext } from './ProtectedLayout'; 
import { useUser } from '@clerk/clerk-react';
import { toast } from 'react-hot-toast';

// --- IMPORT THE MODAL COMPONENTS ---
import ChooseStart from '../components/FormCreator/ChooseStart';
import ChooseTheme from '../components/FormCreator/ChooseTheme';
import AiPromptModal from '../components/FormCreator/AiPromptModal';
import ChooseTemplate from '../components/FormCreator/ChooseTemplate'; 
import ChooseImportType from '../components/FormCreator/ChooseImportType'; // New
import ImportModal from '../components/FormCreator/ImportModal'; // New

const DashboardPage = () => {
  const navigate = useNavigate();
  const { userForms: forms, refetchForms } = useContext(FormsContext);
  const { user } = useUser();
  const [loading, setLoading] = useState(false);
  const [copiedFormId, setCopiedFormId] = useState(null);

  // --- STATE FOR MODAL ---
  // Stages: 'start', 'ai', 'template', 'import_select', 'import_upload', 'theme'
  const [modalStage, setModalStage] = useState(null); 
  const [formType, setFormType] = useState(null); // 'blank', 'ai', 'template', 'import'
  const [importSource, setImportSource] = useState(null); // 'image' or 'file'
  
  // Data holding
  const [selectedTemplateId, setSelectedTemplateId] = useState(null); 
  const [importedQuestions, setImportedQuestions] = useState([]); // Store parsed questions
  
  const [aiPrompt, setAiPrompt] = useState("");
  const [isAiLoading, setIsAiLoading] = useState(false);

  const handleCreateForm = () => {
    setModalStage('start');
  };

  const handleClose = () => {
    setModalStage(null);
    setFormType(null);
    setImportedQuestions([]);
    setSelectedTemplateId(null);
    setAiPrompt(""); // Reset prompt on close
  };

  // --- 1. Selection Handlers ---
  const handleStartSelect = (type) => {
    setFormType(type);
    if (type === 'ai') setModalStage('ai');
    else if (type === 'template') setModalStage('template');
    else if (type === 'import') setModalStage('import_select');
    else setModalStage('theme'); // blank
  };

  const handleImportTypeSelect = (source) => {
    setImportSource(source);
    setModalStage('import_upload');
  };

  const handleDataImported = (questions) => {
    setImportedQuestions(questions);
    // After importing data, go to theme selection
    setModalStage('theme'); 
  };

  // --- 2. Final Creation Logic (for Blank, Template, Import) ---
  const handleThemeCreate = async (theme) => {
    // If it's an IMPORT, we create the form immediately (like AI)
    if (formType === 'import') {
        try {
            const response = await api.post('/api/forms', {
                title: 'Imported Quiz',
                userId: user.id,
                username: user.fullName,
                theme: theme.name,
                questions: importedQuestions // Send the parsed array directly!
            });
            
            toast.success("Form created from import!");
            refetchForms();
            // Redirect to editor
            window.open(`/editor/${response.data._id}`, '_blank');
            handleClose();
        } catch (error) {
            console.error("Import Create Error", error);
            toast.error("Failed to create form from import");
        }
    } else {
        // Standard blank/template flow (Redirect to Editor)
        const themeName = encodeURIComponent(theme.name);
        let url = '/editor/new';
        if (formType === 'template' && selectedTemplateId) {
            url = `/editor/new?template=${selectedTemplateId}&theme=${themeName}`;
        } else { 
            url = `/editor/new?theme=${themeName}`;
        }
        window.open(url, '_blank');
        handleClose();
    }
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
    if (window.confirm(`Delete "${formTitle}"?`)) {
      try {
        await axios.delete(`${import.meta.env.VITE_API_BASE_URL}/api/forms/${formId}`);
        refetchForms();
      } catch (error) { 
        console.error(error); 
        toast.error("Failed to delete form");
      }
    }
  };

  // --- 3. AI Submission Logic (UPDATED) ---
  const handleAiSubmit = async () => {
    if (!aiPrompt.trim()) {
      toast.error("Please describe your quiz first.");
      return;
    }

    setIsAiLoading(true);

    try {
      // 1. Call the AI generation endpoint
      const response = await api.post('/api/ai/generate', {
        prompt: aiPrompt,
        userId: user.id,
        username: user.fullName || user.primaryEmailAddress?.emailAddress || 'User',
      });

      // 2. Extract the new formId from the response
      const { formId } = response.data;

      if (formId) {
        toast.success("AI Form generated successfully!");
        
        // 3. Refresh the dashboard list
        refetchForms();

        // 4. Redirect to the editor immediately
        // Use window.open to open in a new tab (consistent with other creation flows)
        window.open(`/editor/${formId}`, '_blank'); 
        
        // 5. Close the modal
        handleClose();
      }
    } catch (error) {
      console.error("AI Error:", error);
      // Detailed error is handled by axiosConfig toast, but logging here helps debugging
    } finally {
      setIsAiLoading(false);
    }
  };

  return (
    <>
      <AnimatePresence>
        {modalStage && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 bg-black/50 backdrop-blur-sm z-50 flex items-center justify-center p-4"
            onClick={handleClose}
          >
            <motion.div
              initial={{ scale: 0.9 }}
              animate={{ scale: 1 }}
              onClick={(e) => e.stopPropagation()} 
              className="relative w-full max-w-4xl"
            >
              {modalStage === 'start' && (
                <ChooseStart onSelect={handleStartSelect} onCancel={handleClose} />
              )}

              {modalStage === 'ai' && (
                <AiPromptModal 
                    prompt={aiPrompt}
                    setPrompt={setAiPrompt}
                    isLoading={isAiLoading}
                    onSubmit={handleAiSubmit}
                    onBack={() => setModalStage('start')}
                    onCancel={handleClose} 
                />
              )}

              {modalStage === 'template' && (
                <ChooseTemplate 
                    onSelectTemplate={(id) => { setSelectedTemplateId(id); setModalStage('theme'); }} 
                    onBack={() => setModalStage('start')}
                    onCancel={handleClose}
                />
              )}

              {/* --- NEW STAGES --- */}
              {modalStage === 'import_select' && (
                <ChooseImportType 
                    onSelectType={handleImportTypeSelect}
                    onBack={() => setModalStage('start')}
                    onCancel={handleClose}
                />
              )}

              {modalStage === 'import_upload' && (
                <ImportModal 
                    type={importSource}
                    onDataReady={handleDataImported}
                    onBack={() => setModalStage('import_select')}
                    onCancel={handleClose}
                />
              )}

              {modalStage === 'theme' && (
                <ChooseTheme 
                  onSelectTheme={handleThemeCreate} 
                  onBack={() => {
                      if (formType === 'import') setModalStage('import_upload');
                      else if (formType === 'template') setModalStage('template');
                      else setModalStage('start');
                  }}
                  onClose={handleClose}
                />
              )}
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
      
      {/* --- DASHBOARD CONTENT --- */}
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