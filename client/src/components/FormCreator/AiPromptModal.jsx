// client/src/components/FormCreator/AiPromptModal.jsx
import { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Sparkles, FileText, Upload, Loader2, X, ChevronRight, ChevronLeft } from 'lucide-react';
import { GlassButton } from '../ui/GlassButton';
import axios from '../../api/axiosConfig'; 
import toast from 'react-hot-toast';

// Added Cloze and Categorize
const AVAILABLE_TYPES = ['MultipleChoice', 'Comprehension', 'Checkbox', 'Dropdown', 'Cloze', 'Categorize'];

export default function AiPromptModal({ isOpen, onClose, userId, username, onSuccess }) {
  const [step, setStep] = useState(1);
  const [mode, setMode] = useState('topic'); 
  const [prompt, setPrompt] = useState('');
  const [file, setFile] = useState(null);
  const [loading, setLoading] = useState(false);
  
  const [numQuestions, setNumQuestions] = useState(5);
  const [selectedTypes, setSelectedTypes] = useState([...AVAILABLE_TYPES]);

  const handleNextStep = () => {
    if (mode === 'topic' && !prompt.trim()) return toast.error("Please enter a topic");
    if (mode === 'document' && !file) return toast.error("Please upload a PDF");
    setStep(2);
  };

  const toggleType = (type) => {
    if (selectedTypes.includes(type)) {
      if (selectedTypes.length === 1) return toast.error("Select at least one question type");
      setSelectedTypes(selectedTypes.filter(t => t !== type));
    } else {
      setSelectedTypes([...selectedTypes, type]);
    }
  };

  const toggleAllTypes = () => {
    if (selectedTypes.length === AVAILABLE_TYPES.length) {
      setSelectedTypes([AVAILABLE_TYPES[0]]); 
      toast.success("Cleared selections (kept one)");
    } else {
      setSelectedTypes([...AVAILABLE_TYPES]);
    }
  };

  const handleSubmit = async () => {
    if (!userId) return toast.error("User identity missing");
    setLoading(true);

    try {
      let response;
      if (mode === 'topic') {
        response = await axios.post('/api/ai/generate', {
          prompt,
          userId,
          username,
          numQuestions,
          questionTypes: selectedTypes
        });
      } else {
        const formData = new FormData();
        formData.append('file', file);
        formData.append('userId', userId);
        formData.append('username', username);
        formData.append('numQuestions', numQuestions);
        formData.append('questionTypes', JSON.stringify(selectedTypes));
        
        response = await axios.post('/api/ai/upload-pdf', formData, {
          headers: { 'Content-Type': 'multipart/form-data' }
        });
      }

      toast.success("Neural Architecture Generated!");
      onSuccess(response.data.formId);
      onClose();
      setTimeout(() => { setStep(1); setPrompt(''); setFile(null); setSelectedTypes([...AVAILABLE_TYPES]); }, 500);
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
        // Back to clean, hidden overflow because we have no dropdown!
        className="w-full max-w-lg glass-card border border-white/10 shadow-2xl overflow-hidden bg-slate-900 rounded-2xl"
      >
        <div className="relative p-6 bg-gradient-to-r from-indigo-600/20 to-purple-600/20 border-b border-white/5">
          <button onClick={onClose} className="absolute top-4 right-4 text-white/40 hover:text-white transition-colors">
            <X size={20} />
          </button>
          <div className="flex items-center gap-3">
            <div className="p-2 bg-indigo-500 rounded-lg shadow-[0_0_15px_rgba(99,102,241,0.5)]">
              <Sparkles className="text-white" size={24} />
            </div>
            <div>
              <h2 className="text-xl font-bold text-white">Neural Generator</h2>
              <p className="text-xs text-indigo-200">
                {step === 1 ? "AI-Powered Assessment Architect" : "Configure Assessment Parameters"}
              </p>
            </div>
          </div>
        </div>

        <div className="p-6 relative min-h-[350px] flex flex-col">
          <AnimatePresence mode="wait">
            {step === 1 ? (
              <motion.div 
                key="step1"
                initial={{ opacity: 0, x: -20 }}
                animate={{ opacity: 1, x: 0 }}
                exit={{ opacity: 0, x: -20 }}
                className="flex-grow space-y-6"
              >
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
                  {mode === 'topic' ? (
                    <div>
                      <label className="block text-xs font-mono text-slate-400 uppercase mb-2">
                        Enter Topic or Concept
                      </label>
                      <textarea
                        value={prompt}
                        onChange={(e) => setPrompt(e.target.value)}
                        placeholder="e.g., Advanced React Patterns, History of Rome, Thermodynamics..."
                        className="w-full h-32 bg-black/20 border border-white/10 rounded-xl p-4 text-white placeholder:text-white/20 focus:outline-none focus:border-indigo-500 transition-colors resize-none"
                      />
                    </div>
                  ) : (
                    <div>
                      <label className="block text-xs font-mono text-slate-400 uppercase mb-2">
                        Upload Source Document (PDF)
                      </label>
                      <div className="border-2 border-dashed border-white/10 rounded-xl p-8 flex flex-col items-center justify-center text-center hover:bg-white/5 transition-colors relative bg-black/20">
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
                    </div>
                  )}
                </div>

                <div className="pt-2">
                  <GlassButton 
                    onClick={handleNextStep}
                    className="w-full py-4 bg-white/5 border border-white/10 text-white font-bold tracking-wide shadow-lg hover:bg-white/10 flex items-center justify-center gap-2"
                  >
                    PROCEED <ChevronRight size={18} />
                  </GlassButton>
                </div>
              </motion.div>
            ) : (
              <motion.div 
                key="step2"
                initial={{ opacity: 0, x: 20 }}
                animate={{ opacity: 1, x: 0 }}
                exit={{ opacity: 0, x: 20 }}
                className="flex-grow flex flex-col h-full"
              >
                <div className="space-y-6 flex-grow">
                  {/* Number of Questions Slider */}
                  <div className="space-y-3">
                    <div className="flex justify-between items-center">
                      <label className="block text-xs font-mono text-slate-400 uppercase">
                        Number of Questions
                      </label>
                      <span className="text-indigo-400 font-bold bg-indigo-500/10 px-3 py-1 rounded-lg">
                        {numQuestions}
                      </span>
                    </div>
                    <input 
                      type="range" 
                      min="1" 
                      max="20" 
                      value={numQuestions}
                      onChange={(e) => setNumQuestions(parseInt(e.target.value))}
                      className="w-full h-2 bg-black/40 rounded-lg appearance-none cursor-pointer accent-indigo-500"
                    />
                    <div className="flex justify-between text-xs text-slate-500 font-mono">
                      <span>1</span>
                      <span>20</span>
                    </div>
                  </div>

                  {/* New Pill-Based Question Type Selector */}
                  <div className="space-y-3">
                    <div className="flex justify-between items-center">
                      <label className="block text-xs font-mono text-slate-400 uppercase">
                        Allowed Question Types
                      </label>
                      <button 
                        onClick={toggleAllTypes}
                        className="text-xs text-indigo-400 hover:text-indigo-300 font-medium"
                      >
                        {selectedTypes.length === AVAILABLE_TYPES.length ? "Clear All" : "Select All"}
                      </button>
                    </div>
                    
                    <div className="flex flex-wrap gap-2">
                      {AVAILABLE_TYPES.map(type => {
                        const isSelected = selectedTypes.includes(type);
                        return (
                          <button
                            key={type}
                            onClick={() => toggleType(type)}
                            className={`px-4 py-2 rounded-xl text-xs font-medium transition-all duration-200 border ${
                              isSelected 
                                ? 'bg-indigo-500/20 border-indigo-500/50 text-indigo-200 shadow-[0_0_10px_rgba(99,102,241,0.2)]' 
                                : 'bg-black/20 border-white/10 text-slate-400 hover:border-white/20 hover:text-slate-300'
                            }`}
                          >
                            {type}
                          </button>
                        );
                      })}
                    </div>
                  </div>
                </div>

                {/* Bottom Buttons */}
                <div className="flex gap-3 pt-6 mt-auto">
                  <button 
                    onClick={() => setStep(1)}
                    disabled={loading}
                    className="px-4 py-4 bg-white/5 border border-white/10 rounded-xl text-white hover:bg-white/10 transition-colors disabled:opacity-50"
                  >
                    <ChevronLeft size={20} />
                  </button>
                  <GlassButton 
                    onClick={handleSubmit}
                    disabled={loading}
                    className="flex-grow py-4 bg-gradient-to-r from-indigo-600 to-purple-600 text-white font-bold tracking-wide shadow-lg hover:shadow-indigo-500/25 disabled:opacity-50"
                  >
                    {loading ? (
                      <span className="flex items-center justify-center gap-2">
                        <Loader2 className="animate-spin" size={18} /> Building...
                      </span>
                    ) : (
                      "GENERATE ASSESSMENT"
                    )}
                  </GlassButton>
                </div>
              </motion.div>
            )}
          </AnimatePresence>
        </div>
      </motion.div>
    </div>
  );
}