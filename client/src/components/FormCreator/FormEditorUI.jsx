// client/src/components/FormCreator/FormEditorUI.jsx
import { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';
import { Save, Play, Layers, Loader2, History, RotateCcw, X, Eye, ShieldCheck } from 'lucide-react';
import { toast } from 'react-hot-toast';
import api from '../../api/axiosConfig';
import EditorSidebar from './EditorSidebar';
import QuestionModule from './QuestionModule';
import AiPromptModal from './AiPromptModal';
import GazeMonitor from '../Proctoring/GazeMonitor'; // NEW: Import Proctoring Component
import { GlassButton } from '../ui/GlassButton';

export default function FormEditorUI() {
  const { formId } = useParams();
  const navigate = useNavigate();
  const [questions, setQuestions] = useState([]);
  const [title, setTitle] = useState('');
  const [isSaving, setIsSaving] = useState(false);
  const [isLoading, setIsLoading] = useState(formId ? true : false);
  const [activeTab, setActiveTab] = useState('elements');
  const [versions, setVersions] = useState([]);
  const [isAiModalOpen, setIsAiModalOpen] = useState(false);
  const [isPreviewOpen, setIsPreviewOpen] = useState(false); 

  useEffect(() => {
    if (formId) {
      const fetchForm = async () => {
        try {
          const response = await api.get(`/forms/${formId}`);
          setTitle(response.data.title);
          setQuestions(response.data.questions || []);
        } catch (error) {
          toast.error("Failed to load form.");
          navigate('/dashboard');
        } finally {
          setIsLoading(false);
        }
      };
      fetchForm();
    }
  }, [formId, navigate]);

  const addQuestion = (type) => {
    const newQuestion = { 
      id: `temp-${Date.now()}`, 
      type, 
      content: { question: '', options: ['', '', '', ''], correctAnswer: '' },
      logic: [] 
    };
    setQuestions([...questions, newQuestion]);
  };

  const deleteQuestion = (id) => {
    setQuestions(questions.filter(q => q.id !== id));
  };

  const handleSave = async () => {
    if (!title.trim()) return toast.error("Please provide a title");
    setIsSaving(true);
    const loadingToast = toast.loading('Synchronizing with Neural Engine...');
    try {
      const formData = { title, questions };
      let response;
      if (formId) {
        response = await api.put(`/forms/${formId}`, formData);
      } else {
        response = await api.post('/forms', formData);
      }
      toast.success('System synchronized', { id: loadingToast });
      if (!formId) navigate(`/editor/${response.data._id}`);
    } catch (error) {
      toast.error('Sync failed', { id: loadingToast });
    } finally {
      setIsSaving(false);
    }
  };

  if (isLoading) {
    return (
      <div className="h-screen w-full flex items-center justify-center">
        <Loader2 className="animate-spin text-indigo-500" size={48} />
      </div>
    );
  }

  return (
    <div className="max-w-[1400px] mx-auto flex gap-8 items-start relative">
      <div className="flex-1 min-h-[80vh] pb-24">
        <header className="mb-12 space-y-4">
          <motion.input
            type="text"
            placeholder="Enter Form Title..."
            value={title}
            onChange={(e) => setTitle(e.target.value)}
            className="bg-transparent border-none text-5xl font-bold text-white placeholder:text-white/10 focus:outline-none w-full"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
          />
          <div className="flex items-center gap-4">
            <GlassButton 
              onClick={handleSave} 
              disabled={isSaving}
              className="flex items-center gap-2 bg-indigo-500 text-white border-none px-6 py-3 shadow-lg shadow-indigo-500/20"
            >
              {isSaving ? <Loader2 className="animate-spin" size={18} /> : <Save size={18} />}
              Save Configuration
            </GlassButton>
            
            <GlassButton 
              onClick={() => setIsPreviewOpen(true)} 
              className="flex items-center gap-2 text-white/60 px-6 py-3 hover:text-white hover:bg-white/5"
            >
              <Eye size={18} /> Live Preview
            </GlassButton>
          </div>
        </header>

        <AnimatePresence mode="popLayout">
          {questions.length === 0 ? (
            <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="h-64 rounded-3xl border-2 border-dashed border-white/5 flex flex-col items-center justify-center text-white/20">
              <Layers size={48} className="mb-4" />
              <p className="font-mono uppercase tracking-widest text-xs text-center px-10">Neural core awaiting question modules. Use the sidebar to initialize elements.</p>
            </motion.div>
          ) : (
            questions.map((q, index) => (
              <QuestionModule 
                key={q.id || q._id} 
                index={index} 
                typeLabel={q.type} 
                onDelete={() => deleteQuestion(q.id || q._id)}
              >
                <input 
                  placeholder="Type your question here..." 
                  value={q.content?.question || ''}
                  onChange={(e) => {
                    const updated = [...questions];
                    updated[index].content = { ...updated[index].content, question: e.target.value };
                    setQuestions(updated);
                  }}
                  className="glass-input text-xl bg-transparent border-white/5 focus:border-indigo-500/30"
                />
              </QuestionModule>
            ))
          )}
        </AnimatePresence>
      </div>

      <EditorSidebar 
        onAddQuestion={addQuestion} 
        activeTab={activeTab} 
        setActiveTab={setActiveTab} 
        onOpenAiModal={() => setIsAiModalOpen(true)} 
      />

      <AiPromptModal isOpen={isAiModalOpen} onClose={() => setIsAiModalOpen(false)} />

      {/* --- PREVIEW OVERLAY WITH PROCTORING --- */}
      <AnimatePresence>
        {isPreviewOpen && (
          <motion.div 
            initial={{ opacity: 0 }} 
            animate={{ opacity: 1 }} 
            exit={{ opacity: 0 }}
            className="fixed inset-0 z-[300] bg-[#050505] backdrop-blur-3xl overflow-y-auto p-12"
          >
            <div className="max-w-4xl mx-auto">
              {/* Header */}
              <header className="flex justify-between items-center mb-16 border-b border-white/5 pb-10">
                <div className="flex items-center gap-4">
                  <div className="p-3 rounded-2xl bg-indigo-500/10 text-indigo-400 border border-indigo-500/20">
                    <ShieldCheck size={24} />
                  </div>
                  <div>
                    <h2 className="text-3xl font-bold text-white tracking-tight">{title || 'Untitled Assessment'}</h2>
                    <div className="flex items-center gap-2 mt-1">
                      <span className="w-2 h-2 rounded-full bg-green-500 animate-pulse" />
                      <p className="text-[10px] font-mono text-white/30 uppercase tracking-[0.2em]">Live Proctoring Enabled</p>
                    </div>
                  </div>
                </div>
                <button 
                  onClick={() => setIsPreviewOpen(false)}
                  className="p-4 rounded-full bg-white/5 text-white/40 hover:text-white hover:bg-white/10 transition-all border border-white/5"
                >
                  <X size={24} />
                </button>
              </header>

              {/* Neural Sentry Component */}
              <GazeMonitor 
                isActive={isPreviewOpen} 
                onViolation={(type) => toast.error(`Violation Protocol: ${type}`)} 
              />

              {/* Rendered Questions */}
              <div className="space-y-8 pb-32">
                {questions.map((q, i) => (
                  <motion.div 
                    key={i} 
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: i * 0.1 }}
                    className="glass-card p-12 border-white/5 relative overflow-hidden"
                  >
                    <div className="absolute top-0 left-0 w-1 h-full bg-indigo-500/20" />
                    <p className="text-[10px] font-mono text-white/20 mb-6 uppercase tracking-widest">Section {i + 1}</p>
                    <h3 className="text-2xl font-medium text-white mb-10 leading-relaxed">{q.content.question || 'Awaiting question text...'}</h3>
                    
                    {/* Simplified Option Preview */}
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                      {['A', 'B', 'C', 'D'].map((opt) => (
                        <div key={opt} className="p-5 rounded-2xl border border-white/5 bg-white/[0.02] text-white/20 font-mono text-xs flex items-center gap-4 hover:border-indigo-500/30 transition-all">
                          <span className="w-8 h-8 rounded-lg bg-white/5 flex items-center justify-center text-white/40 font-bold">{opt}</span>
                          Select Option Value
                        </div>
                      ))}
                    </div>
                  </motion.div>
                ))}
              </div>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}