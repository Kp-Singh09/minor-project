// client/src/pages/FormRenderer.jsx
import { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';
import { ChevronRight, ChevronLeft, Send, Loader2, GitBranch } from 'lucide-react';
import { GlassButton } from '../components/ui/GlassButton';
import axios from '../api/axiosConfig';
import { useAuth } from '@clerk/clerk-react';
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

export default function FormRenderer() {
  const { formId } = useParams();
  const { user, isLoaded } = useAuth();
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
  
  // History stack to track jumps (so "Back" button works correctly after a jump)
  const [historyStack, setHistoryStack] = useState([0]);

  // 1. Fetch Form (Enhanced for Security)
  useEffect(() => {
    fetchForm();
  }, [formId]);

  const fetchForm = async (password = null) => {
    try {
      setAuthError('');
      // Use POST if sending a password, otherwise standard GET
      const config = password 
        ? { method: 'post', url: `/api/forms/${formId}/access`, data: { password } }
        : { method: 'get', url: `/api/forms/${formId}` };

      const res = await axios(config);

      // Check if the backend returned a "Locked" payload
      if (res.data.isLocked) {
        setIsLocked(true);
        // Even if locked, we set basic form data (like title) if available
        setForm(res.data);
      } else {
        setIsLocked(false);
        setForm(res.data);
      }
    } catch (err) {
      if (err.response?.status === 410) {
        toast.error("This assessment has expired.");
        navigate('/dashboard'); // Or show an expiration screen
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

  // 2. Proctoring Handler
  const handleViolation = (type) => {
    if (!loading && form && !isLocked) {
      setIntegrityFlags(prev => [...prev, { type, timestamp: new Date() }]);
    }
  };

  // 3. Answer Handler
  const handleAnswer = (val) => {
    if (!form) return;
    const questionId = form.questions[currentStep]._id;
    setAnswers(prev => ({
      ...prev,
      [questionId]: { questionId, answer: val }
    }));
  };

  // 4. THE LOGIC ENGINE -------------------------
  const calculateNextStep = () => {
    const currentQ = form.questions[currentStep];
    const currentAnsObj = answers[currentQ._id];
    
    // If no logic defined, just go next
    if (!currentQ.logic || currentQ.logic.length === 0) {
      return currentStep + 1;
    }

    const userAnswer = currentAnsObj ? currentAnsObj.answer : null;

    // Find the first matching rule
    const matchedRule = currentQ.logic.find(rule => {
      // Simple string equality check. Can be expanded for regex/numbers later.
      return rule.condition === userAnswer;
    });

    if (matchedRule) {
      if (matchedRule.action === 'end_form') {
        return 'END';
      }
      if (matchedRule.action === 'jump_to' && matchedRule.destination) {
        // Find the index of the destination question ID
        const targetIndex = form.questions.findIndex(q => q._id === matchedRule.destination);
        if (targetIndex !== -1) return targetIndex;
      }
    }

    // Default Fallback
    return currentStep + 1;
  };
  // ---------------------------------------------

  const paginate = (newDirection) => {
    if (newDirection > 0) {
      // Validate Required
      const qId = form.questions[currentStep]._id;
      if (form.questions[currentStep].required && (!answers[qId] || !answers[qId].answer)) {
        return toast.error("Please answer to proceed.");
      }

      const nextStepIndex = calculateNextStep();

      if (nextStepIndex === 'END') {
        handleSubmit(); // Early exit
      } else if (nextStepIndex < form.questions.length) {
        setDirection(1);
        setHistoryStack(prev => [...prev, nextStepIndex]); // Push to stack
        setCurrentStep(nextStepIndex);
      } else {
        // End of form reached naturally
        // Show submit button logic handled in render
      }
    } else {
      // Handle Back Button using History Stack
      if (historyStack.length > 1) {
        const newStack = [...historyStack];
        newStack.pop(); // Remove current
        const prevStepIndex = newStack[newStack.length - 1]; // Peek previous
        
        setDirection(-1);
        setHistoryStack(newStack);
        setCurrentStep(prevStepIndex);
      }
    }
  };

  const handleSubmit = async () => {
    if (!user) return toast.error("User identity required.");
    
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
    } catch (err) {
      toast.error("Submission Failed");
    }
  };

  const renderQuestion = (question) => {
    const commonProps = {
      data: question,
      onAnswer: handleAnswer,
      savedAnswer: answers[question._id]?.answer
    };
    // Dynamic component rendering...
    switch (question.type) {
      case 'MultipleChoice': return <MultipleChoiceRenderer {...commonProps} />;
      case 'ShortAnswer': return <ShortAnswerRenderer {...commonProps} />;
      case 'LongAnswer': return <LongAnswerRenderer {...commonProps} />;
      case 'Categorize': return <CategorizeRenderer {...commonProps} />;
      case 'Cloze': return <ClozeRenderer {...commonProps} />;
      case 'Comprehension': return <ComprehensionRenderer {...commonProps} />;
      case 'Dropdown': return <DropdownRenderer {...commonProps} />;
      case 'Checkbox': return <CheckboxRenderer {...commonProps} />;
      case 'PictureChoice': return <PictureChoiceRenderer {...commonProps} />;
      default: return <div className="text-white/50">Unsupported Type</div>;
    }
  };

  if (loading || !isLoaded) return (
    <div className="h-screen w-full flex items-center justify-center bg-slate-950">
      <Loader2 className="animate-spin text-indigo-500" size={48} />
    </div>
  );

  // --- RENDER SECURITY GATE IF LOCKED ---
  if (isLocked) {
    return (
      <AccessGate 
        title={form?.title || 'Secured Assessment'} 
        error={authError}
        onUnlock={handleUnlock} 
      />
    );
  }

  return (
    <div className="relative min-h-screen w-full flex flex-col items-center justify-center p-6 bg-slate-950 overflow-hidden">
      {/* Activate The Proctor only if unlocked */}
      <GazeMonitor isActive={true} onViolation={handleViolation} />

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
             <div className="glass-card p-8 md:p-12 border-white/10 shadow-2xl backdrop-blur-2xl">
                <div className="flex justify-between items-start mb-6">
                  <span className="inline-block px-3 py-1 rounded-full bg-indigo-500/10 border border-indigo-500/20 text-indigo-400 font-mono text-xs uppercase tracking-widest">
                    {form.questions[currentStep].type}
                  </span>
                  {/* Logic Indicator */}
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
          className="p-4 rounded-full glass-card border-white/5 text-white/40 hover:text-white disabled:opacity-0 transition-all"
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
            className="bg-white/10 text-white px-8 py-4 flex items-center gap-2 hover:bg-white/20"
          >
            Next Node <ChevronRight size={18} />
          </GlassButton>
        )}
      </div>
    </div>
  );
}