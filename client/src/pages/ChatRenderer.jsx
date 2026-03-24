// client/src/pages/ChatRenderer.jsx
import { useState, useEffect, useRef } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';
import { Send, Bot, User, Loader2, Sparkles, RefreshCw, CheckCircle2, ChevronRight, Calendar, Paperclip } from 'lucide-react';
import axios from '../api/axiosConfig';
import { useUser } from '@clerk/clerk-react';
import toast from 'react-hot-toast';
import FileUploadRenderer from '../components/renderer/FileUploadRenderer'; 

// --- INLINE COMPLEX INTERACTION COMPONENTS ---

const CheckboxChat = ({ options, onConfirm }) => {
  const [selected, setSelected] = useState([]);
  const toggle = (opt) => setSelected(prev => prev.includes(opt) ? prev.filter(o => o !== opt) : [...prev, opt]);
  return (
    <div className="space-y-3 mt-3">
      <div className="flex flex-wrap gap-2">
        {options.map((opt, i) => (
          <button key={i} onClick={() => toggle(opt)} className={`px-4 py-2 rounded-xl text-sm transition-all border ${selected.includes(opt) ? 'bg-indigo-500 border-indigo-400 text-white shadow-[0_0_15px_rgba(99,102,241,0.5)]' : 'bg-black/20 border-white/10 text-slate-300 hover:bg-white/10'}`}>
            {opt}
          </button>
        ))}
      </div>
      <button onClick={() => onConfirm(selected)} disabled={selected.length === 0} className="flex items-center gap-2 text-sm text-emerald-400 hover:text-emerald-300 font-bold disabled:opacity-50 transition-colors pt-2">
        Confirm Selection <CheckCircle2 size={16} />
      </button>
    </div>
  );
};

const DropdownChat = ({ options, onConfirm }) => {
  const [val, setVal] = useState("");
  return (
    <div className="flex gap-3 mt-3 items-center">
      <select value={val} onChange={e => setVal(e.target.value)} className="bg-black/40 border border-white/10 rounded-xl px-4 py-2 text-sm text-white focus:outline-none focus:border-indigo-500">
        <option value="" disabled>Select an option...</option>
        {options.map((opt, i) => <option key={i} value={opt} className="bg-slate-900">{opt}</option>)}
      </select>
      <button onClick={() => onConfirm(val)} disabled={!val} className="p-2 bg-indigo-500 rounded-xl text-white hover:bg-indigo-400 disabled:opacity-50 transition-colors"><ChevronRight size={18}/></button>
    </div>
  );
};

const CategorizeChat = ({ items, categories, onConfirm }) => {
  const [mapping, setMapping] = useState({});
  const handleSelect = (itemText, cat) => setMapping(prev => ({ ...prev, [cat]: [...(prev[cat] || []).filter(i => i !== itemText), itemText] }));
  const isComplete = items.every(item => Object.values(mapping).flat().includes(item.text));

  return (
    <div className="space-y-3 mt-3 bg-black/20 p-4 rounded-xl border border-white/5">
      {items.map((item, i) => (
        <div key={i} className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 border-b border-white/5 pb-3 last:border-0 last:pb-0">
          <span className="text-sm text-slate-200">{item.text}</span>
          <select onChange={e => handleSelect(item.text, e.target.value)} defaultValue="" className="bg-slate-900 border border-white/10 rounded-lg px-3 py-1 text-xs text-white focus:outline-none focus:border-indigo-500">
            <option value="" disabled>Select Category</option>
            {categories.map((c, idx) => <option key={idx} value={c}>{c}</option>)}
          </select>
        </div>
      ))}
      <button onClick={() => onConfirm(mapping)} disabled={!isComplete} className="w-full mt-2 py-2 bg-indigo-500/20 text-indigo-300 hover:bg-indigo-500 hover:text-white rounded-lg text-sm font-bold transition-all disabled:opacity-50">
        Submit Categories
      </button>
    </div>
  );
};

const ClozeChat = ({ passage, options = [], onConfirm }) => {
  const parts = passage.split('[BLANK]');
  const numBlanks = parts.length - 1;
  const [answers, setAnswers] = useState(Array(numBlanks).fill(null));
  const [shuffledOptions] = useState([...options].sort(() => Math.random() - 0.5));

  const handleOptionClick = (opt) => {
    const firstEmpty = answers.indexOf(null);
    if (firstEmpty !== -1) {
      const newAns = [...answers];
      newAns[firstEmpty] = opt;
      setAnswers(newAns);
    }
  };

  const handleRemoveClick = (index) => {
    if (!answers[index]) return;
    const newAns = [...answers];
    newAns[index] = null;
    setAnswers(newAns);
  };

  const availableOptions = shuffledOptions.filter(opt => !answers.includes(opt));
  const isComplete = answers.every(a => a !== null);

  return (
    <div className="mt-3 space-y-4">
      <div className="bg-black/20 p-5 rounded-xl border border-white/5 leading-loose text-slate-300 text-sm">
        {parts.map((part, index) => (
          <span key={index}>
            {part}
            {index < numBlanks && (
              <span 
                onClick={() => handleRemoveClick(index)}
                title={answers[index] ? "Click to remove" : ""}
                className={`inline-block min-w-[60px] text-center mx-1 pb-0.5 border-b-2 font-bold transition-colors ${
                  answers[index] ? 'border-indigo-500 text-indigo-400 cursor-pointer hover:text-rose-400 hover:border-rose-400' : 'border-white/20 text-white/20'
                }`}
              >
                {answers[index] || "____"}
              </span>
            )}
          </span>
        ))}
      </div>
      
      <div className="flex flex-wrap gap-2">
        {availableOptions.map((opt, i) => (
          <button key={i} onClick={() => handleOptionClick(opt)} className="px-4 py-2 bg-indigo-500/20 border border-indigo-500/30 text-indigo-300 rounded-xl hover:bg-indigo-500 hover:text-white transition-all text-sm shadow-sm">
            {opt}
          </button>
        ))}
      </div>

      <div className="flex justify-end pt-2">
        <button onClick={() => onConfirm(answers)} disabled={!isComplete} className="px-4 py-2 bg-indigo-500 text-white rounded-lg text-sm font-bold hover:bg-indigo-400 disabled:opacity-50 transition-all shadow-lg shadow-indigo-500/20">
          Submit Answers
        </button>
      </div>
    </div>
  );
};

// --- MAIN CHAT RENDERER ---

export default function ChatRenderer() {
  const { formId } = useParams();
  const { user } = useUser();
  const navigate = useNavigate();
  const messagesEndRef = useRef(null);
  
  const hasInitialized = useRef(false);
  const formRef = useRef(null); 
  
  // ---> NEW REFS to prevent Stale Closures on answers! <---
  const answersRef = useRef({});
  const compAnswersRef = useRef({});

  const [form, setForm] = useState(null);
  const [loading, setLoading] = useState(true);
  const [messages, setMessages] = useState([]); 
  const [currentStep, setCurrentStep] = useState(0);
  const [compSubStep, setCompSubStep] = useState(0);
  
  const [answers, setAnswers] = useState({});
  const [compTempAnswers, setCompTempAnswers] = useState({});
  
  const [isTyping, setIsTyping] = useState(false);
  const [inputDisabled, setInputDisabled] = useState(false);
  const [textInput, setTextInput] = useState("");

  const currentQ = form?.questions[currentStep];
  const isTextInputNeeded = currentQ && ['ShortAnswer', 'LongAnswer', 'Email'].includes(currentQ.type) && !inputDisabled;

  useEffect(() => {
    if (hasInitialized.current) return;
    hasInitialized.current = true;

    const fetchForm = async () => {
      try {
        const res = await axios.get(`/api/forms/${formId}`);
        const validQuestions = res.data.questions.filter(
            q => !['Banner', 'Heading', 'Paragraph', 'Switch'].includes(q.type)
        );
        const processedForm = { ...res.data, questions: validQuestions };
        
        setForm(processedForm);
        formRef.current = processedForm; 

        addBotMessage(`Neural Link Established. Welcome to **${processedForm.title}**.`);
        setTimeout(() => processQuestion(0, 0), 1500);

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
    const delay = Math.min(1200, text.length * 15) + 400; 

    setTimeout(() => {
      setIsTyping(false);
      setMessages(prev => [...prev, { id: Date.now(), sender: 'bot', text, component }]);
      setInputDisabled(false);
    }, delay);
  };

  const addUserMessage = (text) => {
    setMessages(prev => [...prev, { id: Date.now(), sender: 'user', text }]);
  };

  const processQuestion = (index, subStep = 0) => {
    const formData = formRef.current; 
    if (!formData) return;

    if (index >= formData.questions.length) {
      finishForm();
      return;
    }

    const question = formData.questions[index];
    const content = question.content || {};
    let prompt = content.question || content.text || "Please provide an answer:";
    let interactionUI = null;

    if (question.type === 'Comprehension') {
        if (subStep === 0) {
            const passage = content.comprehensionPassage || content.text || "";
            interactionUI = (
                <div className="mt-3 bg-white/[0.03] p-5 rounded-2xl border border-white/10 text-slate-300 text-sm italic leading-relaxed shadow-inner">
                    {passage}
                </div>
            );
            addBotMessage("Please read the following passage carefully. I will ask you questions about it shortly.", interactionUI);
            setTimeout(() => {
                setCompSubStep(1);
                processQuestion(index, 1);
            }, 3000);
            return;
        }

        const mcqIndex = subStep - 1;
        const mcqs = content.mcqs || [];

        if (mcqIndex < mcqs.length) {
            const mcq = mcqs[mcqIndex];
            prompt = `**Q${subStep}:** ${mcq.question || mcq.questionText}`;
            interactionUI = (
                <div className="flex flex-col gap-2 mt-3">
                    {mcq.options.map((opt, i) => (
                        <button key={i} onClick={() => handleCompAnswer(question._id, mcq._id || mcqIndex, opt, index, subStep + 1)} className="text-left px-5 py-3 rounded-xl bg-black/20 border border-white/5 hover:bg-indigo-500/20 hover:border-indigo-500/50 text-slate-300 hover:text-white transition-all text-sm shadow-sm">
                            {opt}
                        </button>
                    ))}
                </div>
            );
        } else {
            // Save Comprehension answers to Ref synchronously
            answersRef.current = { 
                ...answersRef.current, 
                [question._id]: { questionId: question._id, answer: compAnswersRef.current } 
            };
            setAnswers(answersRef.current);
            
            compAnswersRef.current = {}; // reset for next comprehension
            setCompTempAnswers({});
            setCompSubStep(0);
            setCurrentStep(index + 1);
            setTimeout(() => processQuestion(index + 1, 0), 500);
            return;
        }
    }

    else if (question.type === 'MultipleChoice' || question.type === 'PictureChoice') {
       interactionUI = (
         <div className="flex flex-col gap-2 mt-3">
            {content.options.map((opt, i) => (
              <button key={i} onClick={() => handleAnswer(question._id, opt, opt, index)} className="text-left px-5 py-3 rounded-xl bg-black/20 border border-white/5 hover:bg-indigo-500/20 hover:border-indigo-500/50 text-slate-300 hover:text-white transition-all text-sm shadow-sm">
                {opt}
              </button>
            ))}
         </div>
       );
    } 
    else if (question.type === 'Boolean') {
        interactionUI = (
            <div className="flex gap-3 mt-3">
                <button onClick={() => handleAnswer(question._id, true, "True", index)} className="flex-1 py-3 bg-emerald-500/10 text-emerald-400 hover:bg-emerald-500 hover:text-white border border-emerald-500/30 rounded-xl transition-all font-medium shadow-lg shadow-emerald-500/10">True</button>
                <button onClick={() => handleAnswer(question._id, false, "False", index)} className="flex-1 py-3 bg-rose-500/10 text-rose-400 hover:bg-rose-500 hover:text-white border border-rose-500/30 rounded-xl transition-all font-medium shadow-lg shadow-rose-500/10">False</button>
            </div>
        )
    }
    else if (question.type === 'Checkbox') {
        interactionUI = <CheckboxChat options={content.options} onConfirm={(vals) => handleAnswer(question._id, vals, vals.join(', '), index)} />;
    }
    else if (question.type === 'Dropdown') {
        interactionUI = <DropdownChat options={content.options} onConfirm={(val) => handleAnswer(question._id, val, val, index)} />;
    }
    else if (question.type === 'Categorize') {
        interactionUI = <CategorizeChat items={content.items} categories={content.categories} onConfirm={(mapping) => handleAnswer(question._id, mapping, "Categories Submitted", index)} />;
    }
    else if (question.type === 'Cloze') {
        interactionUI = <ClozeChat passage={content.passage} options={content.options} onConfirm={(ansArr) => handleAnswer(question._id, ansArr, ansArr.join(', '), index)} />;
    }
    else if (question.type === 'Temporal') {
        interactionUI = (
            <div className="mt-3 flex items-center gap-3">
                <div className="relative">
                   <Calendar size={16} className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" />
                   <input type="datetime-local" id={`temp-${question._id}`} className="pl-10 pr-4 py-2.5 bg-black/40 border border-white/10 rounded-xl text-white text-sm focus:outline-none focus:border-indigo-500" />
                </div>
                <button onClick={() => {
                    const val = document.getElementById(`temp-${question._id}`).value;
                    if(val) handleAnswer(question._id, val, val.replace('T', ' '), index);
                    else toast.error("Select date/time");
                }} className="p-2.5 bg-indigo-500 hover:bg-indigo-400 text-white rounded-xl transition-colors shadow-lg shadow-indigo-500/20"><ChevronRight size={18} /></button>
            </div>
        );
    }
    else if (question.type === 'FileUpload') {
        interactionUI = (
            <div className="mt-3 p-1 bg-black/20 rounded-2xl border border-white/5 max-w-sm">
                <FileUploadRenderer question={question} onAnswerChange={(qId, val) => handleAnswer(qId, val, "File Asset Uploaded 📎", index)} savedAnswer={null} />
            </div>
        );
    }

    addBotMessage(prompt, interactionUI);
    if(question.type !== 'Comprehension') setCurrentStep(index);
  };

  const handleCompAnswer = (qId, mcqId, option, mainIndex, nextSubStep) => {
      addUserMessage(option);
      // Synchronously store comprehension step answer
      compAnswersRef.current = { ...compAnswersRef.current, [mcqId]: option };
      setCompTempAnswers(compAnswersRef.current);
      
      setCompSubStep(nextSubStep);
      setTimeout(() => processQuestion(mainIndex, nextSubStep), 600);
  };

  const handleAnswer = (questionId, value, displayLabel, index) => {
    addUserMessage(displayLabel || value);
    
    // Synchronously store general question answer
    answersRef.current = {
      ...answersRef.current,
      [questionId]: { questionId, answer: value }
    };
    setAnswers(answersRef.current);

    setCurrentStep(index + 1);
    setTimeout(() => processQuestion(index + 1), 600);
  };

  const handleTextSubmit = (e) => {
    e.preventDefault();
    if (!textInput.trim() || !isTextInputNeeded) return;
    
    const question = formRef.current.questions[currentStep];
    handleAnswer(question._id, textInput, textInput, currentStep);
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
            userEmail: user.primaryEmailAddress?.emailAddress || "unknown@email.com",
            username: user.fullName || "Anonymous User",
            // ---> THE FIX: Using the Ref directly ensures we capture 100% of the answers <---
            answers: Object.values(answersRef.current),
            integrityFlags: []
        };
        
        await axios.post('/api/responses', payload);
        
        setTimeout(() => {
            addBotMessage("Synchronization Complete. Closing link and redirecting...", (
                <div className="mt-4 flex justify-center">
                    <Loader2 className="animate-spin text-emerald-400" size={24} />
                </div>
            ));
            setTimeout(() => navigate('/dashboard'), 2500);
        }, 1500);

    } catch (err) {
        addBotMessage("Synchronization Failed. System error.");
    }
  };

  if (loading) return (
    <div className="h-screen w-full flex items-center justify-center bg-slate-950 text-white">
      <div className="relative flex items-center justify-center">
          <div className="absolute w-16 h-16 border-t-2 border-indigo-500 rounded-full animate-spin"></div>
          <Sparkles className="text-indigo-400 animate-pulse" size={24} />
      </div>
    </div>
  );

  return (
    <div className="min-h-screen w-full bg-[radial-gradient(ellipse_at_top,_var(--tw-gradient-stops))] from-slate-900 via-slate-950 to-black text-white flex flex-col font-sans selection:bg-indigo-500/30">
      
      {/* Sleek Floating Header */}
      <div className="fixed top-4 left-4 right-4 md:left-1/2 md:-translate-x-1/2 md:w-full md:max-w-3xl bg-white/[0.02] backdrop-blur-xl border border-white/10 p-4 rounded-2xl z-20 flex justify-between items-center shadow-2xl">
        <div className="flex items-center gap-4">
          <div className="relative">
             <div className="absolute inset-0 bg-indigo-500 rounded-full blur animate-pulse opacity-50"></div>
             <div className="relative p-2 rounded-full bg-indigo-500/20 border border-indigo-500/50">
               <Bot size={20} className="text-indigo-300" />
             </div>
          </div>
          <div>
            <h1 className="font-bold text-sm tracking-wide text-slate-200">{form?.title}</h1>
            <div className="flex items-center gap-1.5 mt-0.5">
               <span className="w-1.5 h-1.5 rounded-full bg-emerald-500 animate-pulse"></span>
               <p className="text-[10px] text-slate-400 font-mono uppercase tracking-wider">Neural Connection Active</p>
            </div>
          </div>
        </div>
        <button onClick={() => window.location.reload()} className="p-2 bg-white/5 border border-white/5 rounded-xl text-white/40 hover:text-white hover:bg-white/10 transition-all">
            <RefreshCw size={16} />
        </button>
      </div>

      {/* Main Chat Feed */}
      <div className="flex-1 overflow-y-auto p-4 pt-32 pb-40 space-y-8 max-w-3xl mx-auto w-full scroll-smooth scrollbar-hide">
        <AnimatePresence>
            {messages.map((msg) => (
            <motion.div
                key={msg.id}
                initial={{ opacity: 0, y: 20, scale: 0.95 }}
                animate={{ opacity: 1, y: 0, scale: 1 }}
                className={`flex gap-4 ${msg.sender === 'user' ? 'justify-end' : 'justify-start'}`}
            >
                {msg.sender === 'bot' && (
                    <div className="w-8 h-8 mt-1 rounded-full bg-indigo-500/20 flex items-center justify-center border border-indigo-500/30 shrink-0 shadow-[0_0_10px_rgba(99,102,241,0.2)]">
                        <Sparkles size={14} className="text-indigo-400" />
                    </div>
                )}
                
                <div className={`max-w-[85%] sm:max-w-[75%] ${msg.sender === 'user' ? 'items-end' : 'items-start'} flex flex-col`}>
                    <div className={`px-6 py-4 text-sm leading-relaxed shadow-xl ${
                        msg.sender === 'user' 
                        ? 'bg-gradient-to-br from-indigo-500 to-purple-600 text-white rounded-2xl rounded-tr-sm' 
                        : 'bg-white/5 backdrop-blur-md border border-white/10 text-slate-200 rounded-2xl rounded-tl-sm'
                    }`}>
                        <div dangerouslySetInnerHTML={{ __html: msg.text.replace(/\*\*(.*?)\*\*/g, '<strong class="text-white font-bold">$1</strong>') }} />
                    </div>
                    
                    {msg.component && (
                        <motion.div 
                            initial={{ opacity: 0, y: 10 }}
                            animate={{ opacity: 1, y: 0 }}
                            transition={{ delay: 0.2 }}
                            className="w-full mt-2"
                        >
                            {msg.component}
                        </motion.div>
                    )}
                </div>

                {msg.sender === 'user' && (
                     <div className="w-8 h-8 mt-1 rounded-full bg-purple-500/20 flex items-center justify-center border border-purple-500/30 shrink-0 shadow-[0_0_10px_rgba(168,85,247,0.2)]">
                        <User size={14} className="text-purple-400" />
                    </div>
                )}
            </motion.div>
            ))}
        </AnimatePresence>

        {/* Neural Typing Indicator */}
        {isTyping && (
           <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="flex gap-4">
               <div className="w-8 h-8 mt-1 rounded-full bg-indigo-500/10 flex items-center justify-center shrink-0 border border-indigo-500/20">
                   <Bot size={14} className="text-indigo-500/50" />
               </div>
               <div className="bg-white/5 backdrop-blur-md border border-white/10 px-5 py-4 rounded-2xl rounded-tl-sm flex gap-1.5 items-center shadow-lg">
                   <span className="w-1.5 h-1.5 bg-indigo-400 rounded-full animate-bounce" style={{ animationDelay: '0ms' }} />
                   <span className="w-1.5 h-1.5 bg-indigo-400 rounded-full animate-bounce" style={{ animationDelay: '150ms' }} />
                   <span className="w-1.5 h-1.5 bg-indigo-400 rounded-full animate-bounce" style={{ animationDelay: '300ms' }} />
               </div>
           </motion.div>
        )}
        
        <div ref={messagesEndRef} className="h-4" />
      </div>

      {/* Floating Island Input Area */}
      <div className="fixed bottom-6 left-4 right-4 md:left-1/2 md:-translate-x-1/2 md:w-full md:max-w-3xl z-20">
        <form onSubmit={handleTextSubmit} className="relative group shadow-2xl shadow-indigo-500/10 rounded-full">
            <div className="absolute inset-0 bg-gradient-to-r from-indigo-500/20 to-purple-500/20 rounded-full blur-md transition-opacity opacity-0 group-focus-within:opacity-100"></div>
            <input 
                type="text" 
                value={textInput}
                onChange={(e) => setTextInput(e.target.value)}
                disabled={!isTextInputNeeded}
                placeholder={isTextInputNeeded ? "Type your response here..." : "Select an option above to proceed..."}
                className="relative w-full bg-slate-900/90 backdrop-blur-xl border border-white/10 rounded-full py-4 pl-6 pr-16 text-white placeholder:text-slate-500 focus:outline-none focus:border-indigo-500 focus:ring-1 focus:ring-indigo-500 transition-all disabled:opacity-50 disabled:cursor-not-allowed shadow-inner"
            />
            <button 
                type="submit"
                disabled={!textInput.trim() || !isTextInputNeeded}
                className="absolute right-2 top-2 bottom-2 aspect-square rounded-full bg-indigo-500 text-white flex items-center justify-center hover:bg-indigo-400 hover:shadow-[0_0_15px_rgba(99,102,241,0.6)] disabled:opacity-0 disabled:scale-50 transition-all duration-300"
            >
                <Send size={18} className="ml-1" />
            </button>
        </form>
      </div>
    </div>
  );
}