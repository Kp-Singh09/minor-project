// client/src/components/FormCreator/AiPromptModal.jsx
import { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Sparkles, FileText, Upload, Loader2, X } from 'lucide-react';
import { GlassButton } from '../ui/GlassButton';
import axios from '../../api/axiosConfig'; // Use your configured axios
import toast from 'react-hot-toast';

export default function AiPromptModal({ isOpen, onClose, userId, username, onSuccess }) {
  const [mode, setMode] = useState('topic'); // 'topic' or 'document'
  const [prompt, setPrompt] = useState('');
  const [file, setFile] = useState(null);
  const [loading, setLoading] = useState(false);

  const handleSubmit = async () => {
    if (!userId) return toast.error("User identity missing");
    setLoading(true);

    try {
      let response;
      if (mode === 'topic') {
        if (!prompt.trim()) throw new Error("Please enter a topic");
        response = await axios.post('/api/ai/generate', {
          prompt,
          userId,
          username
        });
      } else {
        if (!file) throw new Error("Please upload a PDF");
        const formData = new FormData();
        formData.append('file', file);
        formData.append('userId', userId);
        formData.append('username', username);
        
        response = await axios.post('/api/ai/upload-pdf', formData, {
          headers: { 'Content-Type': 'multipart/form-data' }
        });
      }

      toast.success("Neural Architecture Generated!");
      onSuccess(response.data.formId);
      onClose();
    } catch (err) {
      console.error(err);
      toast.error(err.response?.data?.message || "Generation Failed");
    } finally {
      setLoading(false);
    }
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-sm p-4">
      <motion.div 
        initial={{ opacity: 0, scale: 0.9 }}
        animate={{ opacity: 1, scale: 1 }}
        exit={{ opacity: 0, scale: 0.9 }}
        className="w-full max-w-lg glass-card border border-white/10 shadow-2xl overflow-hidden"
      >
        {/* Header */}
        <div className="relative p-6 bg-gradient-to-r from-indigo-600/20 to-purple-600/20 border-b border-white/5">
          <button onClick={onClose} className="absolute top-4 right-4 text-white/40 hover:text-white">
            <X size={20} />
          </button>
          <div className="flex items-center gap-3">
            <div className="p-2 bg-indigo-500 rounded-lg shadow-[0_0_15px_rgba(99,102,241,0.5)]">
              <Sparkles className="text-white" size={24} />
            </div>
            <div>
              <h2 className="text-xl font-bold text-white">Neural Generator</h2>
              <p className="text-xs text-indigo-200">AI-Powered Assessment Architect</p>
            </div>
          </div>
        </div>

        {/* Body */}
        <div className="p-6 space-y-6">
          {/* Mode Switcher */}
          <div className="flex bg-black/20 p-1 rounded-xl">
            <button 
              onClick={() => setMode('topic')}
              className={`flex-1 py-2 text-sm font-medium rounded-lg transition-all flex items-center justify-center gap-2 ${mode === 'topic' ? 'bg-indigo-500 text-white shadow-lg' : 'text-slate-400 hover:text-white'}`}
            >
              <Sparkles size={16} /> Topic Prompt
            </button>
            <button 
              onClick={() => setMode('document')}
              className={`flex-1 py-2 text-sm font-medium rounded-lg transition-all flex items-center justify-center gap-2 ${mode === 'document' ? 'bg-indigo-500 text-white shadow-lg' : 'text-slate-400 hover:text-white'}`}
            >
              <FileText size={16} /> Upload PDF
            </button>
          </div>

          <div className="min-h-[150px]">
            <AnimatePresence mode="wait">
              {mode === 'topic' ? (
                <motion.div 
                  key="topic"
                  initial={{ opacity: 0, x: -20 }}
                  animate={{ opacity: 1, x: 0 }}
                  exit={{ opacity: 0, x: 20 }}
                >
                  <label className="block text-xs font-mono text-slate-400 uppercase mb-2">
                    Enter Topic or Concept
                  </label>
                  <textarea
                    value={prompt}
                    onChange={(e) => setPrompt(e.target.value)}
                    placeholder="e.g., Advanced React Patterns, History of Rome, Thermodynamics..."
                    className="w-full h-32 bg-black/20 border border-white/10 rounded-xl p-4 text-white placeholder:text-white/20 focus:outline-none focus:border-indigo-500 transition-colors resize-none"
                  />
                </motion.div>
              ) : (
                <motion.div 
                  key="document"
                  initial={{ opacity: 0, x: 20 }}
                  animate={{ opacity: 1, x: 0 }}
                  exit={{ opacity: 0, x: -20 }}
                >
                  <label className="block text-xs font-mono text-slate-400 uppercase mb-2">
                    Upload Source Document (PDF)
                  </label>
                  <div className="border-2 border-dashed border-white/10 rounded-xl p-8 flex flex-col items-center justify-center text-center hover:bg-white/5 transition-colors relative">
                    <input 
                      type="file" 
                      accept=".pdf"
                      onChange={(e) => setFile(e.target.files[0])}
                      className="absolute inset-0 opacity-0 cursor-pointer"
                    />
                    <div className="p-4 bg-indigo-500/10 rounded-full mb-3">
                      <Upload size={24} className="text-indigo-400" />
                    </div>
                    {file ? (
                      <span className="text-emerald-400 font-medium truncate max-w-full px-4">
                        {file.name}
                      </span>
                    ) : (
                      <>
                        <span className="text-sm text-slate-300 font-medium">Click to Upload PDF</span>
                        <span className="text-xs text-slate-500 mt-1">Max size 5MB</span>
                      </>
                    )}
                  </div>
                </motion.div>
              )}
            </AnimatePresence>
          </div>

          <GlassButton 
            onClick={handleSubmit}
            disabled={loading}
            className="w-full py-4 bg-gradient-to-r from-indigo-600 to-purple-600 text-white font-bold tracking-wide shadow-lg hover:shadow-indigo-500/25 disabled:opacity-50"
          >
            {loading ? (
              <span className="flex items-center justify-center gap-2">
                <Loader2 className="animate-spin" size={18} /> Processing Neural Network...
              </span>
            ) : (
              "GENERATE ASSESSMENT"
            )}
          </GlassButton>
        </div>
      </motion.div>
    </div>
  );
}