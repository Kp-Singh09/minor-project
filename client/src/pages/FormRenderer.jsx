// client/src/pages/FormRenderer.jsx
import { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';
import { ChevronRight, ChevronLeft, Send, Loader2, GitBranch, ShieldAlert } from 'lucide-react';
import { GlassButton } from '../components/ui/GlassButton';
import axios from '../api/axiosConfig';
import { useUser, useAuth } from '@clerk/clerk-react'; 
import toast from 'react-hot-toast';

// Import the Free AI Proctor
import GazeMonitor from '../components/Proctoring/GazeMonitor';

// Import Security Gate
import AccessGate from '../components/Public/AccessGate';

// Dynamic Question Renderers
import MultipleChoiceRenderer from '../components/renderer/MultipleChoiceRenderer';
import ShortAnswerRenderer from '../components/renderer/ShortAnswerRenderer';
import LongAnswerRenderer from '../components/renderer/LongAnswerRenderer';
import CategorizeRenderer from '../components/renderer/CategorizeRenderer';
import ClozeRenderer from '../components/renderer/ClozeRenderer';
import ComprehensionRenderer from '../components/renderer/ComprehensionRenderer';
import DropdownRenderer from '../components/renderer/DropdownRenderer';
import CheckboxRenderer from '../components/renderer/CheckboxRenderer';
import PictureChoiceRenderer from '../components/renderer/PictureChoiceRenderer';
import BannerRenderer from '../components/renderer/BannerRenderer';
import HeadingRenderer from '../components/renderer/HeadingRenderer';
import ParagraphRenderer from '../components/renderer/ParagraphRenderer';
import SwitchRenderer from '../components/renderer/SwitchRenderer';
import EmailRenderer from '../components/renderer/EmailRenderer';

export default function FormRenderer() {
  const { formId } = useParams();
  const { user, isLoaded } = useUser(); 
  const { userId } = useAuth();         
  const navigate = useNavigate();

  const [form, setForm] = useState(null);
  const [loading, setLoading] = useState(true);
  const [currentStep, setCurrentStep] = useState(0);
  const [answers, setAnswers] = useState({});
  const [integrityFlags, setIntegrityFlags] = useState([]);
  const [direction, setDirection] = useState(0);
  
  // Security States
  const [isLocked, setIsLocked] = useState(false);
  const [authError, setAuthError] = useState('');
  
  // History stack to track jumps
  const [historyStack, setHistoryStack] = useState([0]);

  // 1. Fetch Form
  useEffect(() => {
    fetchForm();
  }, [formId]);

  const fetchForm = async (password = null) => {
    try {
      setAuthError('');
      const config = password 
        ? { method: 'post', url: `/api/forms/${formId}/access`, data: { password } }
        : { method: 'get', url: `/api/forms/${formId}` };

      const res = await axios(config);

      if (res.data.isLocked) {
        setIsLocked(true);
        setForm(res.data);
      } else {
        setIsLocked(false);
        setForm(res.data);
      }
    } catch (err) {
      if (err.response?.status === 410) {
        toast.error("This assessment has expired.");
        navigate('/dashboard'); 
      } else {
        console.error(err);
        toast.error("Access Denied or Load Failed");
        setAuthError("Invalid Credentials or Connection Error");
      }
    } finally {
      setLoading(false);
    }
  };

  const handleUnlock = (password) => {
    setLoading(true);
    fetchForm(password);
  };

  // 2. Proctoring Logic 
  const handleViolation = (type) => {
    if (!loading && form && !isLocked) {
      setIntegrityFlags(prev => [...prev, { type, timestamp: new Date() }]);
      
      if (type.includes("Tab") || type.includes("Copy")) {
         toast.custom((t) => (
            <div className="bg-rose-500 text-white px-4 py-3 rounded-xl flex items-center gap-3 shadow-2xl animate-bounce">
              <ShieldAlert size={20} />
              <div>
                <span className="font-bold text-sm block">Security Warning</span>
                <span className="text-xs">{type} Recorded</span>
              </div>
            </div>
         ), { duration: 3000, id: 'violation-toast' });
      }
    }
  };

  useEffect(() => {
    if (!form || loading || isLocked) return;
    const level = form.settings?.proctoring || 'none';
    if (level === 'none') return; 

    const handleBlur = () => handleViolation("Tab Switch Detected");
    const handleCopy = (e) => { e.preventDefault(); handleViolation("Copy Action Blocked"); };
    const handlePaste = (e) => { e.preventDefault(); handleViolation("Paste Action Blocked"); };

    window.addEventListener("blur", handleBlur);
    document.addEventListener("copy", handleCopy);
    document.addEventListener("paste", handlePaste);
    document.addEventListener("cut", handleCopy);

    return () => {
        window.removeEventListener("blur", handleBlur);
        document.removeEventListener("copy", handleCopy);
        document.removeEventListener("paste", handlePaste);
        document.removeEventListener("cut", handleCopy);
    };
  }, [form, loading, isLocked]);

  // 3. Answer Handler
  const handleAnswer = (questionId, val) => {
    setAnswers(prev => ({ ...prev, [questionId]: { questionId, answer: val } }));
  };

  // 4. THE LOGIC ENGINE 
  const calculateNextStep = () => {
    const currentQ = form.questions[currentStep];
    const currentAnsObj = answers[currentQ._id];
    
    if (!currentQ.logic || currentQ.logic.length === 0) return currentStep + 1;

    const userAnswer = currentAnsObj ? currentAnsObj.answer : null;
    const matchedRule = currentQ.logic.find(rule => rule.condition === userAnswer);

    if (matchedRule) {
      if (matchedRule.action === 'end_form') return 'END';
      if (matchedRule.action === 'jump_to' && matchedRule.destination) {
        const targetIndex = form.questions.findIndex(q => q._id === matchedRule.destination);
        if (targetIndex !== -1) return targetIndex;
      }
    }
    return currentStep + 1;
  };

  const paginate = (newDirection) => {
    if (newDirection > 0) {
      const nextStepIndex = calculateNextStep();
      if (nextStepIndex === 'END') {
        handleSubmit(); 
      } else if (nextStepIndex < form.questions.length) {
        setDirection(1);
        setHistoryStack(prev => [...prev, nextStepIndex]); 
        setCurrentStep(nextStepIndex);
      }
    } else {
      if (historyStack.length > 1) {
        const newStack = [...historyStack];
        newStack.pop(); 
        const prevStepIndex = newStack[newStack.length - 1]; 
        setDirection(-1);
        setHistoryStack(newStack);
        setCurrentStep(prevStepIndex);
      }
    }
  };

  const handleSubmit = async () => {
    if (!user) return toast.error("User identity required. Please log in.");
    try {
      const payload = {
        formId,
        userId: user.id,
        userEmail: user.primaryEmailAddress.emailAddress,
        username: user.fullName,
        answers: Object.values(answers),
        integrityFlags
      };
      await axios.post('/api/responses', payload);
      toast.success("Assessment Submitted!");
      navigate('/dashboard');
    } catch (err) { toast.error("Submission Failed"); }
  };

  const renderQuestion = (q) => {
    const commonProps = { question: q, onAnswerChange: handleAnswer, savedAnswer: answers[q._id]?.answer };

    switch (q.type) {
      case 'MultipleChoice': return <MultipleChoiceRenderer {...commonProps} />;
      case 'ShortAnswer': return <ShortAnswerRenderer {...commonProps} />;
      case 'LongAnswer': return <LongAnswerRenderer {...commonProps} />;
      case 'Categorize': return <CategorizeRenderer {...commonProps} />;
      case 'Cloze': return <ClozeRenderer {...commonProps} />;
      case 'Comprehension': return <ComprehensionRenderer {...commonProps} />;
      case 'Dropdown': return <DropdownRenderer {...commonProps} />;
      case 'Checkbox': return <CheckboxRenderer {...commonProps} />;
      case 'PictureChoice': return <PictureChoiceRenderer {...commonProps} />;
      case 'Banner': return <BannerRenderer {...commonProps} />;
      case 'Heading': return <HeadingRenderer {...commonProps} />;
      case 'Paragraph': return <ParagraphRenderer {...commonProps} />;
      case 'Switch': return <SwitchRenderer {...commonProps} />;
      case 'Email': return <EmailRenderer {...commonProps} />;
      default: return <div className="text-white/50">Unknown Question Type: {q.type}</div>;
    }
  };

  if (loading || !isLoaded) return (
    <div className="h-screen w-full flex items-center justify-center bg-slate-950">
      <Loader2 className="animate-spin text-indigo-500" size={48} />
    </div>
  );

  if (isLocked) {
    return <AccessGate title={form?.title || 'Secured Assessment'} error={authError} onUnlock={handleUnlock} />;
  }

  return (
    <div className="relative min-h-screen w-full flex flex-col items-center justify-center p-6 bg-slate-950 overflow-hidden" onContextMenu={(e) => e.preventDefault()}>
      
      {form.settings?.proctoring === 'full' && (
        <GazeMonitor isActive={true} onViolation={handleViolation} />
      )}

      {/* Progress Bar */}
      <div className="fixed top-12 w-full max-w-md px-6 z-40">
        <div className="h-1 w-full bg-white/5 rounded-full overflow-hidden">
          <motion.div 
            className="h-full bg-indigo-500 shadow-[0_0_20px_rgba(99,102,241,0.5)]"
            initial={{ width: 0 }}
            animate={{ width: `${((historyStack.length) / form.questions.length) * 100}%` }}
          />
        </div>
        <div className="flex justify-between mt-2 text-[10px] font-mono uppercase tracking-widest text-white/30">
          <span>Step {historyStack.length}</span>
          <span>Adaptive Flow</span>
        </div>
      </div>

      {/* Form Card */}
      <div className="relative w-full max-w-4xl min-h-[600px] flex items-center justify-center z-30">
        <AnimatePresence custom={direction} mode="wait">
          <motion.div
            key={currentStep}
            custom={direction}
            initial={{ x: direction > 0 ? 100 : -100, opacity: 0 }}
            animate={{ x: 0, opacity: 1 }}
            exit={{ x: direction < 0 ? 100 : -100, opacity: 0 }}
            transition={{ duration: 0.4, ease: "circOut" }}
            className="w-full"
          >
             {/* Deep Dark Container for Renderers */}
             <div className="p-8 md:p-12 shadow-2xl backdrop-blur-2xl rounded-2xl bg-white/5 border border-white/10">
                <div className="flex justify-between items-start mb-8">
                  <span className="inline-block px-3 py-1 rounded-full bg-indigo-500/10 border border-indigo-500/20 text-indigo-400 font-mono text-xs uppercase tracking-widest">
                    {form.questions[currentStep].type}
                  </span>
                  {form.questions[currentStep].logic?.length > 0 && (
                    <div className="flex items-center gap-1 text-xs text-amber-400 font-mono" title="Branching Active">
                      <GitBranch size={14} />
                      <span>LOGIC NODE</span>
                    </div>
                  )}
                </div>
                
                <div className="min-h-[300px]">
                  {renderQuestion(form.questions[currentStep])}
                </div>
             </div>
          </motion.div>
        </AnimatePresence>
      </div>

      {/* Navigation */}
      <div className="fixed bottom-12 flex items-center gap-6 z-40">
        <button 
          onClick={() => paginate(-1)}
          disabled={historyStack.length <= 1}
          className="p-4 rounded-full bg-white/5 border border-white/10 text-white/40 hover:text-white hover:bg-white/10 disabled:opacity-0 transition-all"
        >
          <ChevronLeft size={24} />
        </button>

        {currentStep === form.questions.length - 1 ? (
          <GlassButton 
            onClick={handleSubmit}
            className="bg-emerald-500/20 text-emerald-400 border-emerald-500/50 px-8 py-4 flex items-center gap-2 hover:bg-emerald-500/30"
          >
            Submit Assessment <Send size={18} />
          </GlassButton>
        ) : (
          <GlassButton 
            onClick={() => paginate(1)}
            className="bg-indigo-600/20 text-indigo-400 border-indigo-500/50 px-8 py-4 flex items-center gap-2 hover:bg-indigo-500/30"
          >
            Next Node <ChevronRight size={18} />
          </GlassButton>
        )}
      </div>
    </div>
  );
}