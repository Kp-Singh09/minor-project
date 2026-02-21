// client/src/components/FormCreator/AiPromptModal.jsx
import { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Sparkles, X, Loader2, BrainCircuit, Image as ImageIcon, Upload, ScanEye } from 'lucide-react';
import { useUser } from '@clerk/clerk-react';
import { useNavigate } from 'react-router-dom';
import api from '../../api/axiosConfig';
import { toast } from 'react-hot-toast';

export default function AiPromptModal({ isOpen, onClose }) {
  const { user } = useUser();
  const navigate = useNavigate();
  const [activeMode, setActiveMode] = useState('text'); // 'text' or 'vision'
  const [prompt, setPrompt] = useState('');
  const [isGenerating, setIsGenerating] = useState(false);

  // Function to handle Image Upload and conversion to Base64
  const handleImageUpload = async (e) => {
    const file = e.target.files[0];
    if (!file) return;

    // Validate file type
    if (!file.type.startsWith('image/')) {
      return toast.error("Please upload a valid image file.");
    }

    const reader = new FileReader();
    reader.onloadend = async () => {
      setIsGenerating(true);
      const loadingToast = toast.loading('Vision Engine analyzing the document...');
      try {
        // Calling your existing Vision endpoint
        const response = await api.post('/ai/image-to-question', {
          imageBase64: reader.result,
          userId: user.id
        });
        
        toast.success('Visual intelligence extracted', { id: loadingToast });
        
        // If the backend creates a form, navigate to it
        if (response.data.formId) {
          navigate(`/editor/${response.data.formId}`);
        }
        onClose();
      } catch (error) {
        toast.error('Vision analysis failed. Ensure the text is clear.', { id: loadingToast });
        console.error("Vision Error:", error);
      } finally {
        setIsGenerating(false);
      }
    };
    reader.readAsDataURL(file);
  };

  const handleTextGenerate = async () => {
    if (!prompt.trim()) return;
    setIsGenerating(true);
    const loadingToast = toast.loading('AI is architecting your assessment...');
    try {
      const response = await api.post('/ai/generate', {
        prompt,
        userId: user.id,
        username: user.fullName || user.username
      });
      toast.success('Neural Synthesis Complete', { id: loadingToast });
      navigate(`/editor/${response.data.formId}`);
      onClose();
    } catch (error) {
      toast.error('AI Synthesis Failed', { id: loadingToast });
    } finally {
      setIsGenerating(false);
    }
  };

  return (
    <AnimatePresence>
      {isOpen && (
        <div className="fixed inset-0 z-[200] flex items-center justify-center p-6 bg-black/60 backdrop-blur-md">
          <motion.div 
            initial={{ opacity: 0, scale: 0.9, y: 20 }}
            animate={{ opacity: 1, scale: 1, y: 0 }}
            exit={{ opacity: 0, scale: 0.9, y: 20 }}
            className="glass-card w-full max-w-xl p-8 border-white/10 shadow-2xl relative bg-[#0a0a0a]"
          >
            <button onClick={onClose} className="absolute top-6 right-6 text-white/20 hover:text-white transition-colors">
              <X size={20} />
            </button>

            <div className="flex items-center gap-3 mb-8">
              <div className="p-3 rounded-2xl bg-indigo-500/20 text-indigo-400">
                <BrainCircuit size={28} />
              </div>
              <div>
                <h3 className="text-2xl font-bold text-white tracking-tight">Neural Generator</h3>
                <p className="text-[10px] font-mono text-white/30 uppercase tracking-[0.2em]">Phase 2: Intelligent Synthesis</p>
              </div>
            </div>

            {/* Mode Switcher */}
            <div className="flex gap-2 mb-8 bg-white/5 p-1 rounded-xl border border-white/5">
              <button 
                onClick={() => setActiveMode('text')}
                className={`flex-1 py-2.5 rounded-lg text-xs font-bold transition-all flex items-center justify-center gap-2 ${activeMode === 'text' ? 'bg-white/10 text-white shadow-lg' : 'text-white/30 hover:text-white'}`}
              >
                <Sparkles size={14} /> Text Prompt
              </button>
              <button 
                onClick={() => setActiveMode('vision')}
                className={`flex-1 py-2.5 rounded-lg text-xs font-bold transition-all flex items-center justify-center gap-2 ${activeMode === 'vision' ? 'bg-white/10 text-white shadow-lg' : 'text-white/30 hover:text-white'}`}
              >
                <ScanEye size={14} /> Vision / OCR
              </button>
            </div>

            {activeMode === 'text' ? (
              <motion.div initial={{ opacity: 0, x: -10 }} animate={{ opacity: 1, x: 0 }}>
                <textarea 
                  value={prompt}
                  onChange={(e) => setPrompt(e.target.value)}
                  placeholder="e.g., 'Generate 5 MCQs on the laws of thermodynamics for high school level'..."
                  className="w-full h-44 glass-input bg-white/5 border-white/10 focus:border-indigo-500/50 p-4 text-sm resize-none mb-6 text-white placeholder:text-white/10 rounded-xl"
                />
                <button 
                  onClick={handleTextGenerate}
                  disabled={isGenerating || !prompt.trim()}
                  className="w-full py-4 rounded-xl bg-white text-black font-black uppercase tracking-widest text-[10px] flex items-center justify-center gap-2 hover:bg-indigo-50 transition-all disabled:opacity-50"
                >
                  {isGenerating ? <Loader2 className="animate-spin" size={16} /> : <Sparkles size={16} />}
                  Deploy Generation
                </button>
              </motion.div>
            ) : (
              <motion.div initial={{ opacity: 0, x: 10 }} animate={{ opacity: 1, x: 0 }}>
                <div className="h-64 border-2 border-dashed border-white/5 rounded-2xl flex flex-col items-center justify-center group hover:border-indigo-500/30 transition-all cursor-pointer relative overflow-hidden bg-white/[0.01]">
                  <input 
                    type="file" 
                    accept="image/*" 
                    onChange={handleImageUpload}
                    className="absolute inset-0 opacity-0 cursor-pointer z-10"
                    disabled={isGenerating}
                  />
                  {isGenerating ? (
                    <div className="flex flex-col items-center gap-4">
                      <Loader2 className="animate-spin text-indigo-500" size={40} />
                      <p className="text-white/40 font-mono text-[10px] uppercase tracking-widest">Scanning Pixels...</p>
                    </div>
                  ) : (
                    <>
                      <div className="w-16 h-16 rounded-full bg-white/5 flex items-center justify-center mb-4 group-hover:scale-110 transition-transform">
                        <Upload className="text-white/20 group-hover:text-indigo-400" size={32} />
                      </div>
                      <p className="text-white font-bold">Upload Assessment Scan</p>
                      <p className="text-white/30 text-[10px] uppercase font-mono mt-2 tracking-widest">Supports PNG, JPG (OCR Enabled)</p>
                    </>
                  )}
                </div>
                <div className="mt-6 p-4 rounded-xl bg-indigo-500/5 border border-indigo-500/10">
                  <p className="text-[10px] text-indigo-300/60 leading-relaxed italic">
                    Note: Vision mode works best with clear, high-contrast photos of printed or clearly handwritten text.
                  </p>
                </div>
              </motion.div>
            )}
          </motion.div>
        </div>
      )}
    </AnimatePresence>
  );
}