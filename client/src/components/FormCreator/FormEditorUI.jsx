// client/src/components/FormCreator/FormEditorUI.jsx
import { useState, useEffect, useRef } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';
import { Save, Play, Layers, Loader2, History, RotateCcw, X, Eye, ShieldCheck, Users } from 'lucide-react';
import { toast } from 'react-hot-toast';
import { io } from 'socket.io-client'; // RESTORED
import api from '../../api/axiosConfig';
import EditorSidebar from './EditorSidebar';
import QuestionModule from './QuestionModule';
import AiPromptModal from './AiPromptModal';
import GazeMonitor from '../Proctoring/GazeMonitor';
import CalibrationOverlay from '../Proctoring/CalibrationOverlay';
import { GlassButton } from '../ui/GlassButton';

// Initialize Socket connection to your backend port
const socket = io('http://localhost:5000'); 

export default function FormEditorUI() {
  const { formId } = useParams();
  const navigate = useNavigate();
  const [questions, setQuestions] = useState([]);
  const [title, setTitle] = useState('');
  const [isSaving, setIsSaving] = useState(false);
  const [isLoading, setIsLoading] = useState(formId ? true : false);
  const [activeTab, setActiveTab] = useState('elements');
  const [isAiModalOpen, setIsAiModalOpen] = useState(false);
  const [isPreviewOpen, setIsPreviewOpen] = useState(false); 
  const [isCalibrated, setIsCalibrated] = useState(false);
  const [remoteCursors, setRemoteCursors] = useState({}); // Tracking collaborators

  useEffect(() => {
    if (formId) {
      // 1. Join the specific room for this form
      socket.emit('join-room', formId);

      // 2. Listen for changes from other users
      socket.on('receive-changes', (updatedQuestions) => {
        setQuestions(updatedQuestions);
      });

      // 3. Listen for cursor movements from other users
      socket.on('receive-cursor', (data) => {
        setRemoteCursors(prev => ({ ...prev, [data.userId]: data }));
      });

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

    return () => {
      socket.off('receive-changes');
      socket.off('receive-cursor');
    };
  }, [formId, navigate]);

  // Broadcast local question changes to the room
  const handleQuestionsUpdate = (newQuestions) => {
    setQuestions(newQuestions);
    socket.emit('editor-change', { formId, questions: newQuestions });
  };

  // Broadcast mouse movement to collaborators
  const handleMouseMove = (e) => {
    socket.emit('cursor-move', {
      formId,
      userName: "Collaborator", // You can later replace this with user.firstName from Clerk
      x: e.clientX,
      y: e.clientY
    });
  };

  const addQuestion = (type) => {
    const newQuestion = { 
      id: `temp-${Date.now()}`, 
      type, 
      content: { question: '', options: ['', '', '', ''], correctAnswer: '' } 
    };
    handleQuestionsUpdate([...questions, newQuestion]);
  };

  const deleteQuestion = (id) => {
    handleQuestionsUpdate(questions.filter(q => (q.id || q._id) !== id));
  };

  const handleSave = async () => {
    if (!title.trim()) return toast.error("Please provide a title");
    setIsSaving(true);
    const loadingToast = toast.loading('Synchronizing with Neural Engine...');
    try {
      const formData = { title, questions };
      if (formId) {
        await api.put(`/forms/${formId}`, formData);
      } else {
        const response = await api.post('/forms', formData);
        navigate(`/editor/${response.data._id}`);
      }
      toast.success('System synchronized', { id: loadingToast });
    } catch (error) {
      toast.error('Sync failed', { id: loadingToast });
    } finally {
      setIsSaving(false);
    }
  };

  if (isLoading) return <div className="h-screen flex items-center justify-center"><Loader2 className="animate-spin text-indigo-500" size={48} /></div>;

  return (
    <div onMouseMove={handleMouseMove} className="max-w-[1400px] mx-auto flex gap-8 items-start relative min-h-screen">
      
      {/* REMOTE CURSOR LAYER  */}
      {Object.values(remoteCursors).map((cursor) => (
        <motion.div
          key={cursor.userId}
          className="fixed pointer-events-none z-[1000] flex flex-col items-center"
          animate={{ x: cursor.x, y: cursor.y }}
          transition={{ type: "spring", damping: 20, stiffness: 300 }}
        >
          <div className="w-3 h-3 bg-indigo-500 rounded-full shadow-[0_0_15px_rgba(99,102,241,0.8)]" />
          <span className="bg-indigo-600 text-white text-[9px] px-1.5 py-0.5 rounded shadow-lg mt-1 font-bold whitespace-nowrap">
            {cursor.userName}
          </span>
        </motion.div>
      ))}

      <div className="flex-1 pb-24">
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
            <GlassButton onClick={handleSave} disabled={isSaving} className="flex items-center gap-2 bg-indigo-500 text-white px-6 py-3">
              {isSaving ? <Loader2 className="animate-spin" size={18} /> : <Save size={18} />} Save
            </GlassButton>
            
            <GlassButton onClick={() => setIsPreviewOpen(true)} className="flex items-center gap-2 text-white/60 px-6 py-3 hover:text-white">
              <Eye size={18} /> Live Preview
            </GlassButton>

            <div className="flex -space-x-2 ml-4">
              <div className="w-8 h-8 rounded-full border-2 border-black bg-indigo-500 flex items-center justify-center text-[10px] font-bold text-white">KP</div>
              {Object.keys(remoteCursors).length > 0 && (
                <div className="w-8 h-8 rounded-full border-2 border-black bg-purple-500 flex items-center justify-center text-[10px] font-bold text-white">
                  +{Object.keys(remoteCursors).length}
                </div>
              )}
            </div>
          </div>
        </header>

        <AnimatePresence mode="popLayout">
          {questions.map((q, index) => (
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
                  handleQuestionsUpdate(updated);
                }}
                className="glass-input text-xl bg-transparent border-white/5 focus:border-indigo-500/30"
              />
            </QuestionModule>
          ))}
        </AnimatePresence>
      </div>

      <EditorSidebar onAddQuestion={addQuestion} activeTab={activeTab} setActiveTab={setActiveTab} onOpenAiModal={() => setIsAiModalOpen(true)} />

      <AiPromptModal isOpen={isAiModalOpen} onClose={() => setIsAiModalOpen(false)} />

      {/* --- PREVIEW OVERLAY --- */}
      <AnimatePresence>
        {isPreviewOpen && (
          <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} className="fixed inset-0 z-[300] bg-[#050505] backdrop-blur-3xl overflow-y-auto p-12">
            {!isCalibrated ? (
              <CalibrationOverlay onComplete={() => setIsCalibrated(true)} />
            ) : (
              <div className="max-w-4xl mx-auto">
                <header className="flex justify-between items-center mb-16 border-b border-white/5 pb-10">
                  <div className="flex items-center gap-4">
                    <div className="p-3 rounded-2xl bg-indigo-500/10 text-indigo-400 border border-indigo-500/20"><ShieldCheck size={24} /></div>
                    <h2 className="text-3xl font-bold text-white">{title || 'Preview'}</h2>
                  </div>
                  <button onClick={() => { setIsPreviewOpen(false); setIsCalibrated(false); }} className="p-4 rounded-full bg-white/5 text-white/40 hover:text-white border border-white/5"><X size={24} /></button>
                </header>
                <GazeMonitor isActive={isPreviewOpen && isCalibrated} onViolation={(type) => toast.error(`Violation: ${type}`)} />
                <div className="space-y-8 pb-32">
                  {questions.map((q, i) => (
                    <div key={i} className="glass-card p-12 border-white/5">
                      <h3 className="text-2xl font-medium text-white mb-8">{q.content.question || 'Awaiting Question...'}</h3>
                    </div>
                  ))}
                </div>
              </div>
            )}
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}