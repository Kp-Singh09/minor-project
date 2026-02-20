// client/src/components/FormCreator/FormEditorUI.jsx
import { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';
import { Save, Play, Layers, Loader2, History, RotateCcw } from 'lucide-react';
import { toast } from 'react-hot-toast';
import api from '../../api/axiosConfig'; 
import EditorSidebar from './EditorSidebar';
import QuestionModule from './QuestionModule';
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

  // Fetch Versions when switching to History Tab
  useEffect(() => {
    if (activeTab === 'history' && formId) {
      const fetchVersions = async () => {
        try {
          const response = await api.get(`/forms/${formId}/versions`);
          setVersions(response.data);
        } catch (error) {
          toast.error("Could not retrieve version history");
        }
      };
      fetchVersions();
    }
  }, [activeTab, formId]);

  const addQuestion = (type) => {
    const newQuestion = { 
      id: `temp-${Date.now()}`, 
      type, 
      content: { question: '' },
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

  const handleRollback = async (versionId) => {
    const rollbackToast = toast.loading('Reversing time...');
    try {
      await api.post(`/forms/versions/${versionId}/rollback`);
      toast.success('System restored to previous state', { id: rollbackToast });
      window.location.reload(); // Refresh to load restored data
    } catch (error) {
      toast.error('Rollback failed', { id: rollbackToast });
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
    <div className="max-w-[1400px] mx-auto flex gap-8 items-start">
      <div className="flex-1 min-h-[80vh] pb-24">
        <header className="mb-12 space-y-4">
          <motion.input
            type="text"
            placeholder="Enter Form Title..."
            value={title}
            onChange={(e) => setTitle(e.target.value)}
            disabled={activeTab === 'history'}
            className="bg-transparent border-none text-5xl font-bold text-white placeholder:text-white/10 focus:outline-none w-full disabled:opacity-50"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
          />
          <div className="flex items-center gap-4">
            {activeTab === 'elements' ? (
              <>
                <GlassButton 
                  onClick={handleSave} 
                  disabled={isSaving}
                  className="flex items-center gap-2 bg-indigo-500 text-white border-none px-6 py-3"
                >
                  {isSaving ? <Loader2 className="animate-spin" size={18} /> : <Save size={18} />}
                  Save Configuration
                </GlassButton>
                <GlassButton onClick={() => navigate(`/form/${formId}`)} className="flex items-center gap-2 text-white/60 px-6 py-3">
                  <Play size={18} /> Preview
                </GlassButton>
              </>
            ) : (
              <div className="flex items-center gap-2 text-indigo-400 font-mono text-sm px-4 py-2 glass-card border-indigo-500/20">
                <History size={16} /> History Mode Enabled
              </div>
            )}
          </div>
        </header>

        <AnimatePresence mode="popLayout">
          {activeTab === 'elements' ? (
            questions.length === 0 ? (
              <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="h-64 rounded-3xl border-2 border-dashed border-white/5 flex flex-col items-center justify-center text-white/20">
                <Layers size={48} className="mb-4" />
                <p className="font-mono uppercase tracking-widest text-xs">Awaiting System Modules...</p>
              </motion.div>
            ) : (
              questions.map((q, index) => (
                <QuestionModule key={q.id || q._id} index={index} typeLabel={q.type} onDelete={() => deleteQuestion(q.id || q._id)}>
                  <input 
                    placeholder="Type your question here..." 
                    value={q.content.question || ''}
                    onChange={(e) => {
                      const updated = [...questions];
                      updated[index].content.question = e.target.value;
                      setQuestions(updated);
                    }}
                    className="w-full glass-input text-xl bg-transparent border-white/10 focus:border-indigo-500/50"
                  />
                </QuestionModule>
              ))
            )
          ) : (
            <div className="space-y-4">
              {versions.length === 0 ? (
                <div className="text-white/20 text-center py-20 font-mono text-sm uppercase">No restoration points found</div>
              ) : (
                versions.map((v) => (
                  <motion.div key={v._id} initial={{ opacity: 0, x: -20 }} animate={{ opacity: 1, x: 0 }} className="glass-card p-6 flex items-center justify-between border-white/5 hover:border-indigo-500/20 transition-all">
                    <div>
                      <p className="text-white font-bold">Version {v.versionNumber}</p>
                      <p className="text-xs text-white/40 font-mono">{new Date(v.createdAt).toLocaleString()}</p>
                    </div>
                    <button onClick={() => handleRollback(v._id)} className="flex items-center gap-2 px-4 py-2 rounded-lg bg-indigo-500/10 text-indigo-400 border border-indigo-500/20 hover:bg-indigo-500 hover:text-white transition-all text-xs font-bold uppercase tracking-widest">
                      <RotateCcw size={14} /> Restore
                    </button>
                  </motion.div>
                ))
              )}
            </div>
          )}
        </AnimatePresence>
      </div>

      <EditorSidebar onAddQuestion={addQuestion} activeTab={activeTab} setActiveTab={setActiveTab} />
    </div>
  );
}