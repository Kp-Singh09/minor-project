// client/src/pages/ScrollRenderer.jsx
import { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { Send, Loader2, ShieldAlert } from 'lucide-react';
import { GlassButton } from '../components/ui/GlassButton';
import axios from '../api/axiosConfig';
import { useUser, useAuth } from '@clerk/clerk-react'; 
import toast from 'react-hot-toast';

// Import Proctoring & Security
import GazeMonitor from '../components/Proctoring/GazeMonitor';
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
import TemporalRenderer from '../components/renderer/TemporalRenderer'; // NEW
import FileUploadRenderer from '../components/renderer/FileUploadRenderer'; // NEW

export default function ScrollRenderer() {
  const { formId } = useParams();
  const { user, isLoaded } = useUser(); 
  const navigate = useNavigate();

  const [form, setForm] = useState(null);
  const [loading, setLoading] = useState(true);
  const [answers, setAnswers] = useState({});
  const [integrityFlags, setIntegrityFlags] = useState([]);
  
  const [isLocked, setIsLocked] = useState(false);
  const [authError, setAuthError] = useState('');

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
      if (res.data.isLocked) { setIsLocked(true); setForm(res.data); } 
      else { setIsLocked(false); setForm(res.data); }
    } catch (err) {
      if (err.response?.status === 410) { toast.error("Expired."); navigate('/dashboard'); } 
      else { toast.error("Access Denied"); setAuthError("Invalid Credentials"); }
    } finally { setLoading(false); }
  };

  const handleViolation = (type) => {
    if (!loading && form && !isLocked) {
      setIntegrityFlags(prev => [...prev, { type, timestamp: new Date() }]);
      if (type.includes("Tab") || type.includes("Copy")) {
         toast.custom((t) => (
            <div className="bg-rose-500 text-white px-4 py-3 rounded-xl flex items-center gap-3 shadow-2xl animate-bounce">
              <ShieldAlert size={20} />
              <div><span className="font-bold text-sm block">Security Warning</span><span className="text-xs">{type} Recorded</span></div>
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

  const handleAnswer = (questionId, val) => {
    setAnswers(prev => ({ ...prev, [questionId]: { questionId, answer: val } }));
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
      case 'Temporal': return <TemporalRenderer {...commonProps} />; // NEW
      case 'FileUpload': return <FileUploadRenderer {...commonProps} />; // NEW
      default: return <div className="text-white/50">Unknown Type: {q.type}</div>;
    }
  };

  if (loading || !isLoaded) return <div className="h-screen w-full flex items-center justify-center bg-slate-950"><Loader2 className="animate-spin text-indigo-500" size={48} /></div>;
  if (isLocked) return <AccessGate title={form?.title || 'Secured Assessment'} error={authError} onUnlock={(p) => { setLoading(true); fetchForm(p); }} />;

  let moduleCounter = 0;

  return (
    <div className="relative min-h-screen w-full flex flex-col items-center py-12 px-4 bg-slate-950" onContextMenu={(e) => e.preventDefault()}>
      {form.settings?.proctoring === 'full' && <GazeMonitor isActive={true} onViolation={handleViolation} />}

      <div className="w-full max-w-4xl flex flex-col gap-8 z-30 pb-24">
        
        {/* Title Header */}
        <div className="p-10 shadow-2xl backdrop-blur-2xl rounded-2xl bg-white/5 border border-white/10 text-center relative overflow-hidden">
             <div className="absolute top-0 left-0 w-full h-2 bg-gradient-to-r from-indigo-500 via-purple-500 to-pink-500"></div>
             <h1 className="text-4xl font-extrabold text-white mb-4 tracking-tight">{form.title}</h1>
             <p className="text-white/50 font-mono text-sm uppercase tracking-widest">Complete all modules below</p>
        </div>

        {/* All Questions Rendered Vertically */}
        {form.questions.map((q) => {
            const isUI = ['Banner', 'Heading', 'Paragraph'].includes(q.type);
            
            if (!isUI) {
                moduleCounter++;
            }

            return (
                <div key={q._id} className={isUI ? "" : "p-8 md:p-10 shadow-2xl backdrop-blur-xl rounded-2xl bg-white/[0.03] border border-white/10"}>
                    {!isUI && (
                        <div className="flex justify-between items-start mb-6">
                            <span className="text-xs font-bold text-white/30 uppercase tracking-widest font-mono">
                                Module {moduleCounter}
                            </span>
                            <span className="inline-block px-3 py-1 rounded-full bg-white/5 border border-white/10 text-white/50 font-mono text-[10px] uppercase tracking-widest">
                                {q.type}
                            </span>
                        </div>
                    )}
                    {renderQuestion(q)}
                </div>
            );
        })}

        {/* Submit Button */}
        <div className="flex justify-center mt-8">
            <GlassButton onClick={handleSubmit} className="bg-emerald-500/20 text-emerald-400 border-emerald-500/50 px-12 py-5 flex items-center gap-3 hover:bg-emerald-500/30 text-lg font-bold">
                Submit Assessment <Send size={20} />
            </GlassButton>
        </div>
      </div>
    </div>
  );
}