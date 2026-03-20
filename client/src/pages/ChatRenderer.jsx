// client/src/pages/ChatRenderer.jsx
import { useState, useEffect, useRef } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';
import { Send, Bot, User, Loader2, Sparkles, RefreshCw } from 'lucide-react';
import axios from '../api/axiosConfig';
import { useAuth } from '@clerk/clerk-react';
import toast from 'react-hot-toast';

import FileUploadRenderer from '../components/renderer/FileUploadRenderer'; // NEW

export default function ChatRenderer() {
  const { formId } = useParams();
  const { user, isLoaded } = useAuth();
  const navigate = useNavigate();
  const messagesEndRef = useRef(null);

  const [form, setForm] = useState(null);
  const [loading, setLoading] = useState(true);
  const [messages, setMessages] = useState([]); 
  const [currentStep, setCurrentStep] = useState(0);
  const [answers, setAnswers] = useState({});
  const [isTyping, setIsTyping] = useState(false);
  const [inputDisabled, setInputDisabled] = useState(false);
  const [textInput, setTextInput] = useState("");

  useEffect(() => {
    const fetchForm = async () => {
      try {
        const res = await axios.get(`/api/forms/${formId}`);
        setForm(res.data);
        addBotMessage(`Welcome to **${res.data.title}**. I am your neural assessment guide.`);
        setTimeout(() => processQuestion(0, res.data), 1500);
      } catch (err) {
        toast.error("Failed to load neural link.");
      } finally {
        setLoading(false);
      }
    };
    fetchForm();
  }, [formId]);

  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [messages, isTyping]);

  const addBotMessage = (text, component = null) => {
    setIsTyping(true);
    setInputDisabled(true);
    const delay = Math.min(1000, text.length * 20) + 500;

    setTimeout(() => {
      setIsTyping(false);
      setMessages(prev => [...prev, { 
        id: Date.now(), 
        sender: 'bot', 
        text, 
        component 
      }]);
      setInputDisabled(false);
    }, delay);
  };

  const addUserMessage = (text) => {
    setMessages(prev => [...prev, { id: Date.now(), sender: 'user', text }]);
  };

  const processQuestion = (index, formData = form) => {
    if (index >= formData.questions.length) {
      finishForm();
      return;
    }

    const question = formData.questions[index];
    let prompt = question.content?.question || "Question";
    let interactionUI = null;

    if (question.type === 'MultipleChoice' || question.type === 'PictureChoice') {
       interactionUI = (
         <div className="flex flex-wrap gap-2 mt-2">
            {question.content.options.map((opt, i) => (
              <button
                key={i}
                onClick={() => handleAnswer(question._id, opt, opt)}
                className="px-4 py-2 rounded-full bg-indigo-500/20 border border-indigo-500/50 text-indigo-300 hover:bg-indigo-500 hover:text-white transition-all text-sm"
              >
                {opt}
              </button>
            ))}
         </div>
       );
    } 
    else if (question.type === 'Boolean' || question.type === 'Switch') {
        interactionUI = (
            <div className="flex gap-3 mt-2">
                <button onClick={() => handleAnswer(question._id, true, "Yes / True")} className="px-6 py-2 bg-emerald-500/20 text-emerald-400 border border-emerald-500/50 rounded-lg">True</button>
                <button onClick={() => handleAnswer(question._id, false, "No / False")} className="px-6 py-2 bg-rose-500/20 text-rose-400 border border-rose-500/50 rounded-lg">False</button>
            </div>
        )
    }
    // --- NEW: Custom Temporal Mini-UI for Chat ---
    else if (question.type === 'Temporal') {
        interactionUI = (
            <div className="mt-3 p-4 bg-slate-900 rounded-xl border border-white/10 flex flex-col gap-3 max-w-sm">
                <input 
                    type="datetime-local" 
                    id={`temporal-${question._id}`}
                    className="w-full p-3 bg-black/40 border border-white/10 rounded-lg text-white text-sm focus:outline-none focus:border-indigo-500" 
                />
                <button 
                    onClick={() => {
                        const val = document.getElementById(`temporal-${question._id}`).value;
                        if(val) handleAnswer(question._id, val, val);
                        else toast.error("Please select a date and time");
                    }}
                    className="py-2 bg-indigo-600 text-white rounded-lg hover:bg-indigo-500 font-medium text-sm transition-colors"
                >
                    Confirm Date & Time
                </button>
            </div>
        );
    }
    // --- NEW: Render the FileUpload directly in the chat stream ---
    else if (question.type === 'FileUpload') {
        interactionUI = (
            <div className="mt-3 p-4 bg-slate-900 rounded-xl border border-white/10 max-w-sm">
                <FileUploadRenderer 
                    question={question} 
                    onAnswerChange={(qId, val) => handleAnswer(qId, val, "Asset Uploaded Successfully")} 
                    savedAnswer={answers[question._id]?.answer} 
                />
            </div>
        );
    }
    else if (['Categorize', 'Cloze', 'Comprehension'].includes(question.type)) {
       prompt += " *(Note: This complex question type is adapted for chat)*";
    }

    addBotMessage(prompt, interactionUI);
    setCurrentStep(index);
  };

  const handleAnswer = (questionId, value, displayLabel) => {
    addUserMessage(displayLabel || value);
    setAnswers(prev => ({
      ...prev,
      [questionId]: { questionId, answer: value }
    }));

    const nextStep = currentStep + 1;
    setTimeout(() => processQuestion(nextStep), 500);
  };

  const handleTextSubmit = (e) => {
    e.preventDefault();
    if (!textInput.trim()) return;
    
    const question = form.questions[currentStep];
    handleAnswer(question._id, textInput, textInput);
    setTextInput("");
  };

  const finishForm = async () => {
    addBotMessage("Assessment complete. Synchronizing results to the neural core...");
    
    if (!user) {
        addBotMessage("Error: Neural Link Lost (User not logged in).");
        return;
    }

    try {
        const payload = {
            formId,
            userId: user.id,
            userEmail: user.primaryEmailAddress.emailAddress,
            username: user.fullName,
            answers: Object.values(answers),
            integrityFlags: []
        };
        
        await axios.post('/api/responses', payload);
        
        setTimeout(() => {
            addBotMessage("Synchronization Complete. redirecting to dashboard...");
            setTimeout(() => navigate('/dashboard'), 2000);
        }, 1500);

    } catch (err) {
        addBotMessage("Synchronization Failed. Please try again.");
    }
  };

  if (loading) return (
    <div className="h-screen w-full flex items-center justify-center bg-slate-950 text-white">
      <Loader2 className="animate-spin text-indigo-500" size={48} />
    </div>
  );

  return (
    <div className="min-h-screen w-full bg-slate-950 text-white flex flex-col font-sans selection:bg-indigo-500/30">
      
      {/* Header */}
      <div className="fixed top-0 w-full bg-slate-900/80 backdrop-blur-md border-b border-white/5 p-4 z-20 flex justify-between items-center">
        <div className="flex items-center gap-3">
          <div className="p-2 rounded-lg bg-indigo-600 shadow-lg shadow-indigo-500/20">
            <Bot size={20} className="text-white" />
          </div>
          <div>
            <h1 className="font-bold text-sm tracking-wide">{form?.title}</h1>
            <p className="text-[10px] text-indigo-400 font-mono uppercase">Conversational Interface v1.0</p>
          </div>
        </div>
        <button onClick={() => window.location.reload()} className="p-2 text-white/20 hover:text-white transition-colors">
            <RefreshCw size={18} />
        </button>
      </div>

      {/* Chat Area */}
      <div className="flex-1 overflow-y-auto p-4 pt-24 pb-32 space-y-6 max-w-3xl mx-auto w-full">
        <AnimatePresence>
            {messages.map((msg) => (
            <motion.div
                key={msg.id}
                initial={{ opacity: 0, y: 20, scale: 0.95 }}
                animate={{ opacity: 1, y: 0, scale: 1 }}
                className={`flex gap-4 ${msg.sender === 'user' ? 'justify-end' : 'justify-start'}`}
            >
                {msg.sender === 'bot' && (
                    <div className="w-8 h-8 rounded-full bg-indigo-500/20 flex items-center justify-center border border-indigo-500/30 shrink-0">
                        <Sparkles size={14} className="text-indigo-400" />
                    </div>
                )}
                
                <div className={`max-w-[80%] ${msg.sender === 'user' ? 'items-end' : 'items-start'} flex flex-col`}>
                    <div className={`px-5 py-3 rounded-2xl text-sm leading-relaxed ${
                        msg.sender === 'user' 
                        ? 'bg-gradient-to-br from-indigo-600 to-purple-600 text-white rounded-br-none shadow-lg shadow-indigo-500/20' 
                        : 'bg-slate-900 border border-white/10 text-slate-300 rounded-bl-none'
                    }`}>
                        {msg.text}
                    </div>
                    
                    {msg.component && (
                        <motion.div 
                            initial={{ opacity: 0 }}
                            animate={{ opacity: 1 }}
                            transition={{ delay: 0.3 }}
                        >
                            {msg.component}
                        </motion.div>
                    )}
                </div>

                {msg.sender === 'user' && (
                     <div className="w-8 h-8 rounded-full bg-purple-500/20 flex items-center justify-center border border-purple-500/30 shrink-0">
                        <User size={14} className="text-purple-400" />
                    </div>
                )}
            </motion.div>
            ))}
        </AnimatePresence>

        {/* Typing Indicator */}
        {isTyping && (
           <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="flex gap-4">
               <div className="w-8 h-8 rounded-full bg-indigo-500/10 flex items-center justify-center shrink-0">
                   <Bot size={14} className="text-indigo-500/50" />
               </div>
               <div className="bg-slate-900/50 border border-white/5 px-4 py-3 rounded-2xl rounded-bl-none flex gap-1 items-center h-10">
                   <span className="w-1.5 h-1.5 bg-indigo-400 rounded-full animate-bounce" style={{ animationDelay: '0ms' }} />
                   <span className="w-1.5 h-1.5 bg-indigo-400 rounded-full animate-bounce" style={{ animationDelay: '150ms' }} />
                   <span className="w-1.5 h-1.5 bg-indigo-400 rounded-full animate-bounce" style={{ animationDelay: '300ms' }} />
               </div>
           </motion.div>
        )}
        
        <div ref={messagesEndRef} />
      </div>

      {/* Input Area */}
      <div className="fixed bottom-0 w-full bg-slate-900/80 backdrop-blur-xl border-t border-white/5 p-4 z-20">
        <div className="max-w-3xl mx-auto relative">
            <form onSubmit={handleTextSubmit} className="relative group">
                <input 
                    type="text" 
                    value={textInput}
                    onChange={(e) => setTextInput(e.target.value)}
                    disabled={inputDisabled}
                    placeholder={inputDisabled ? "Waiting for AI..." : "Type your answer..."}
                    className="w-full bg-black/40 border border-white/10 rounded-full py-4 pl-6 pr-14 text-white placeholder:text-white/20 focus:outline-none focus:border-indigo-500/50 focus:ring-1 focus:ring-indigo-500/50 transition-all disabled:opacity-50 disabled:cursor-not-allowed"
                />
                <button 
                    type="submit"
                    disabled={!textInput.trim() || inputDisabled}
                    className="absolute right-2 top-2 p-2 rounded-full bg-indigo-600 text-white hover:bg-indigo-500 disabled:opacity-0 disabled:scale-75 transition-all shadow-lg"
                >
                    <Send size={18} />
                </button>
            </form>
            <p className="text-center text-[10px] text-white/20 mt-3 font-mono">
                Powered by Neural Form Engine
            </p>
        </div>
      </div>
    </div>
  );
}