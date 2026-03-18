// client/src/pages/FormEditor.jsx
import { useState, useEffect, useRef } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { useUser, useAuth } from '@clerk/clerk-react';
import axios from '../api/axiosConfig'; 
import { motion, AnimatePresence } from 'framer-motion';
import { Sparkles, Trash2, Radio, MessageSquareText, Users, Settings } from 'lucide-react'; 
import toast from 'react-hot-toast';

// Socket
import { initSocket, disconnectSocket } from '../api/socket';

// --- ALL 14 BUILDERS IMPORTED ---
import ComprehensionBuilder from '../components/builder/ComprehensionBuilder';
import CategorizeBuilder from '../components/builder/CategorizeBuilder';
import ClozeBuilder from '../components/builder/ClozeBuilder';
import MultipleChoiceBuilder from '../components/builder/MultipleChoiceBuilder'; 
import ShortAnswerBuilder from '../components/builder/ShortAnswerBuilder';
import LongAnswerBuilder from '../components/builder/LongAnswerBuilder';
import CheckboxBuilder from '../components/builder/CheckboxBuilder';
import BannerBuilder from '../components/builder/BannerBuilder';
import DropdownBuilder from '../components/builder/DropdownBuilder';
import EmailBuilder from '../components/builder/EmailBuilder';
import HeadingBuilder from '../components/builder/HeadingBuilder';
import ParagraphBuilder from '../components/builder/ParagraphBuilder';
import PictureChoiceBuilder from '../components/builder/PictureChoiceBuilder';
import SwitchBuilder from '../components/builder/SwitchBuilder';

// Modals
import AiPromptModal from '../components/FormCreator/AiPromptModal';
import TeamModal from '../components/FormCreator/TeamModal'; 
import SettingsModal from '../components/FormCreator/SettingsModal'; 

const FormEditor = () => {
    const { formId } = useParams();
    const navigate = useNavigate();
    const { user } = useUser();
    const { userId } = useAuth();
    const isNewForm = !formId;

    const [form, setForm] = useState(null);
    const [loading, setLoading] = useState(!isNewForm);
    const [error, setError] = useState(null);
    
    // Editor States
    const [activeBuilder, setActiveBuilder] = useState(null);
    const [editingQuestion, setEditingQuestion] = useState(null);
    const [isEditingTitle, setIsEditingTitle] = useState(false);
    const [currentTitle, setCurrentTitle] = useState("");
    const [copied, setCopied] = useState(false);
    
    // Modal States
    const [aiModalOpen, setAiModalOpen] = useState(false);
    const [teamModalOpen, setTeamModalOpen] = useState(false);
    const [settingsModalOpen, setSettingsModalOpen] = useState(false); 
    
    // Real-Time States
    const [collaborators, setCollaborators] = useState([]);
    const [teamList, setTeamList] = useState([]);
    const socketRef = useRef(null);
    const fileInputRef = useRef(null);

    const hasUnsavedChanges = form && currentTitle !== form.title;

    // 1. Initial Fetch
    useEffect(() => {
        const fetchForm = async () => {
            try {
                const response = await axios.get(`/api/forms/${formId}?userId=${userId}`);
                setForm(response.data);
                setCurrentTitle(response.data.title);
                setTeamList(response.data.collaborators || []);
            } catch (err) {
                setError('Failed to fetch form data.');
                toast.error("Could not load form");
            } finally {
                setLoading(false);
            }
        };

        if (isNewForm) {
            const defaultTitle = 'Untitled Assessment';
            setForm({ 
                title: defaultTitle, 
                questions: [], 
                headerImage: null, 
                collaborators: [],
                settings: { proctoring: 'none', privacy: 'public' }
            });
            setCurrentTitle(defaultTitle);
            setLoading(false);
        } else {
            fetchForm();
        }
    }, [formId, isNewForm, userId]);

    // 2. SOCKET CONNECTION (The Neural Link)
    useEffect(() => {
        if (!formId || isNewForm || !user) return;

        socketRef.current = initSocket();
        const socket = socketRef.current;

        socket.emit("join_form", { 
            formId, 
            user: { id: userId, username: user.fullName || "Anonymous" } 
        });

        socket.on("user_joined", ({ user: newUser }) => {
            toast(`${newUser.username} joined the session`, { icon: '👋' });
            setCollaborators(prev => {
                if (prev.some(u => u.id === newUser.id)) return prev;
                return [...prev, newUser];
            });
        });

        socket.on("form_title_updated", ({ title, userId: senderId }) => {
            if (senderId !== userId) {
                setCurrentTitle(title);
                setForm(prev => ({ ...prev, title }));
            }
        });

        socket.on("question_added", ({ question, userId: senderId }) => {
            if (senderId !== userId) {
                setForm(prev => ({ ...prev, questions: [...prev.questions, question] }));
                toast("Remote update: Question added");
            }
        });

        socket.on("question_deleted", ({ questionId, userId: senderId }) => {
            if (senderId !== userId) {
                setForm(prev => ({
                    ...prev,
                    questions: prev.questions.filter(q => q._id !== questionId)
                }));
            }
        });

        socket.on("question_updated", ({ question, userId: senderId }) => {
            if (senderId !== userId) {
                setForm(prev => ({
                    ...prev,
                    questions: prev.questions.map(q => q._id === question._id ? question : q)
                }));
            }
        });

        return () => {
            socket.off("user_joined");
            socket.off("form_title_updated");
            socket.off("question_added");
            socket.off("question_deleted");
            socket.off("question_updated");
            disconnectSocket();
        };
    }, [formId, isNewForm, user, userId]);


    // 3. Handlers
    const handleTitleSave = async () => {
        if (!hasUnsavedChanges && !isNewForm) {
            setIsEditingTitle(false);
            return;
        }
        try {
            if (isNewForm) {
                if (!userId) throw new Error("User not found");
                const formResponse = await axios.post(`/api/forms`, {
                    title: currentTitle,
                    userId: userId,
                    username: user.fullName || user.username
                });
                navigate(`/editor/${formResponse.data._id}`, { replace: true });
            } else {
                const response = await axios.put(`/api/forms/${formId}`, { title: currentTitle });
                setForm(prev => ({ ...prev, title: response.data.title }));
                setCurrentTitle(response.data.title);
                
                socketRef.current?.emit("update_form_title", { 
                    formId, 
                    title: currentTitle, 
                    userId 
                });
            }
        } catch (err) {
            console.error(err);
            toast.error("Failed to save title");
            if (form) setCurrentTitle(form.title);
        } finally {
            setIsEditingTitle(false);
        }
    };

    const handleSettingsUpdate = async (newSettings) => {
        setForm(prev => ({ ...prev, settings: newSettings }));
        if (!isNewForm) {
            try {
                await axios.put(`/api/forms/${formId}`, { settings: newSettings });
            } catch (err) {
                console.error("Settings Save Error", err);
                toast.error("Failed to save settings");
            }
        }
    };

    const handleSaveQuestion = async (questionData) => {
        try {
            let currentFormId = formId;

            if (isNewForm) {
                const formResponse = await axios.post(`/api/forms`, {
                    title: currentTitle,
                    userId: userId,
                    username: user.fullName || user.username 
                });
                currentFormId = formResponse.data._id;
                navigate(`/editor/${currentFormId}`, { replace: true });
            }

            let savedQuestion;
            if (editingQuestion) {
                const res = await axios.put(`/api/forms/questions/${editingQuestion._id}`, questionData);
                savedQuestion = res.data;
                socketRef.current?.emit("update_question", { 
                    formId: currentFormId, 
                    question: savedQuestion, 
                    userId 
                });
            } else {
                const res = await axios.post(`/api/forms/${currentFormId}/questions`, questionData);
                savedQuestion = res.data;
                socketRef.current?.emit("add_question", { 
                    formId: currentFormId, 
                    question: savedQuestion, 
                    userId 
                });
            }
            
            const updatedForm = await axios.get(`/api/forms/${currentFormId || formId}`);
            setForm(updatedForm.data);

            setActiveBuilder(null);
            setEditingQuestion(null);
            toast.success("Question Saved");

        } catch (err) {
            toast.error("Error: Could not save the question.");
            console.error(err);
        }
    };

    const handleDeleteQuestion = async (questionId) => {
        if (window.confirm('Delete this question?')) {
            try {
                await axios.delete(`/api/forms/${formId}/questions/${questionId}`);
                setForm(prev => ({
                    ...prev,
                    questions: prev.questions.filter(q => q._id !== questionId)
                }));
                
                socketRef.current?.emit("delete_question", { formId, questionId, userId });
                toast.success("Question deleted");
            } catch (err) {
                toast.error('Failed to delete.');
            }
        }
    };

    const handleAiSuccess = (newFormId) => {
        navigate(`/editor/${newFormId}`);
        window.location.reload(); 
    };
  
    const handleHeaderImageUpload = async (event) => {
        const file = event.target.files[0];
        if (!file || isNewForm) return;
        try {
            const authResponse = await axios.get(`/api/imagekit/auth`);
            const formData = new FormData();
            formData.append('file', file);
            formData.append('fileName', file.name);
            formData.append('publicKey', import.meta.env.VITE_IMAGEKIT_PUBLIC_KEY);
            formData.append('signature', authResponse.data.signature);
            formData.append('expire', authResponse.data.expire);
            formData.append('token', authResponse.data.token);
            const uploadResponse = await axios.post('https://upload.imagekit.io/api/v1/files/upload', formData);
            const imageUrl = uploadResponse.data.url;
            const updateResponse = await axios.put(`/api/forms/${formId}`, { headerImage: imageUrl });
            setForm(updateResponse.data);
            toast.success("Header updated");
        } catch (err) { toast.error('Failed to upload header.'); }
    };

    const handleShare = () => {
        if (isNewForm) return;
        const shareLink = `${window.location.origin}/form/${formId}`;
        navigator.clipboard.writeText(shareLink).then(() => { setCopied(true); setTimeout(() => setCopied(false), 2000); toast.success("Link copied"); });
    };

    const handleViewForm = () => { if (!isNewForm) window.open(`/form/${formId}`, '_blank'); };
    const handleChatMode = () => { if (!isNewForm) window.open(`/form/${formId}/chat`, '_blank'); };

    const handleDeleteForm = async () => {
        if (isNewForm) return;
        if (window.confirm(`Delete "${form.title}"?`)) {
            try { await axios.delete(`/api/forms/${formId}`); toast.success('Deleted.'); navigate('/dashboard'); } 
            catch (error) { toast.error('Could not delete.'); }
        }
    };

    // --- RENDER ALL 14 BUILDERS ---
    const renderBuilder = () => {
        const type = editingQuestion ? editingQuestion.type.toLowerCase() : activeBuilder;
        const onCancel = () => { setActiveBuilder(null); setEditingQuestion(null); };
        const initialData = editingQuestion;
        const props = { onSave: handleSaveQuestion, onCancel, initialData };

        switch(type) {
            case 'multiplechoice': return <MultipleChoiceBuilder {...props} />;
            case 'checkbox': return <CheckboxBuilder {...props} />;
            case 'dropdown': return <DropdownBuilder {...props} />;
            case 'picturechoice': return <PictureChoiceBuilder {...props} />;
            
            case 'shortanswer': return <ShortAnswerBuilder {...props} />;
            case 'longanswer': return <LongAnswerBuilder {...props} />;
            case 'email': return <EmailBuilder {...props} />;
            
            case 'comprehension': return <ComprehensionBuilder {...props} />;
            case 'categorize': return <CategorizeBuilder {...props} />;
            case 'cloze': return <ClozeBuilder {...props} />;
            case 'switch': return <SwitchBuilder {...props} />;

            case 'heading': return <HeadingBuilder {...props} />;
            case 'paragraph': return <ParagraphBuilder {...props} />;
            case 'banner': return <BannerBuilder {...props} />;
            
            default: return null;
        }
    }

    if (loading) return <div className="h-screen w-full flex items-center justify-center bg-slate-900 text-white font-mono uppercase tracking-widest text-xs">Connecting Neural Interface...</div>;
    if (error) return <div className="p-8 text-center text-xl text-red-500">{error}</div>;
    if (!form) return null;

    return (
        <motion.div 
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            className="max-w-6xl mx-auto pb-20 pt-10 px-4"
        >
            <AiPromptModal 
                isOpen={aiModalOpen}
                onClose={() => setAiModalOpen(false)}
                userId={user?.id}
                username={user?.fullName}
                onSuccess={handleAiSuccess}
            />

            <TeamModal 
                isOpen={teamModalOpen}
                onClose={() => setTeamModalOpen(false)}
                formId={formId}
                collaborators={teamList}
                onUpdate={(newList) => setTeamList(newList)}
            />

            <SettingsModal
                isOpen={settingsModalOpen}
                onClose={() => setSettingsModalOpen(false)}
                settings={form.settings}
                onUpdate={handleSettingsUpdate}
            />

            {/* Header Card - Dark Neural Theme */}
            <div className="bg-white/5 backdrop-blur-lg p-6 rounded-2xl mb-8 border border-white/10 shadow-2xl shadow-black/50 border-t-4 border-t-indigo-500 relative">
                
                <div className="absolute top-4 right-4 flex items-center gap-2">
                    {collaborators.length > 0 && (
                        <div className="flex items-center gap-1 bg-green-500/20 text-green-400 px-3 py-1 rounded-full text-xs font-bold border border-green-500/30">
                            <Radio size={12} className="animate-pulse" />
                            {collaborators.length} Live
                        </div>
                    )}
                    
                    <button 
                        onClick={() => setSettingsModalOpen(true)}
                        disabled={isNewForm}
                        className="flex items-center gap-1 bg-white/10 text-white/80 px-4 py-1.5 rounded-full text-xs font-bold border border-white/10 hover:bg-white/20 transition-colors disabled:opacity-50"
                        title="Configure Monitoring"
                    >
                        <Settings size={12} /> Settings
                    </button>

                    <button 
                        onClick={() => setTeamModalOpen(true)}
                        disabled={isNewForm}
                        className="flex items-center gap-1 bg-white/10 text-white/80 px-4 py-1.5 rounded-full text-xs font-bold border border-white/10 hover:bg-white/20 transition-colors disabled:opacity-50"
                    >
                        <Users size={12} /> Team
                    </button>
                </div>

                {form.headerImage && <img src={form.headerImage} alt="Form Header" className="w-full h-48 object-cover rounded-xl mb-4 border border-white/10" />}
                
                <div className="flex justify-between items-start mt-8">
                    <div className="flex-1 mr-4">
                        {isEditingTitle ? (
                            <input
                                type="text"
                                value={currentTitle}
                                onChange={(e) => setCurrentTitle(e.target.value)}
                                onBlur={handleTitleSave}
                                onKeyDown={(e) => { if (e.key === 'Enter') handleTitleSave(); }}
                                className="text-4xl font-bold bg-transparent border-b-2 border-indigo-500/50 focus:outline-none focus:border-indigo-400 text-white w-full pb-1"
                                autoFocus
                            />
                        ) : (
                            <h1
                                className="text-4xl font-bold cursor-pointer hover:bg-white/5 p-2 -m-2 rounded-md text-white transition-colors"
                                onClick={() => setIsEditingTitle(true)}
                                title="Click to edit title"
                            >
                                {currentTitle}
                            </h1>
                        )}
                        <p className="text-white/40 mt-2 px-2 font-mono text-xs uppercase tracking-widest">
                            {isNewForm ? "Draft Mode" : `ID: ${form._id}`}
                        </p>
                    </div>

                    <div className="flex flex-col gap-3">
                        <button 
                            onClick={() => setAiModalOpen(true)}
                            className="bg-gradient-to-r from-indigo-600 to-purple-600 text-white py-2 px-6 rounded-xl shadow-lg hover:shadow-indigo-500/20 transition-all flex items-center justify-center gap-2 font-semibold border border-white/10"
                        >
                            <Sparkles size={18} />
                            AI Generate
                        </button>

                        <input type="file" ref={fileInputRef} onChange={handleHeaderImageUpload} style={{ display: 'none' }} accept="image/*" />
                        <button 
                            onClick={() => fileInputRef.current.click()} 
                            className="bg-white/5 hover:bg-white/10 border border-white/10 text-white/80 py-2 px-4 rounded-xl disabled:opacity-50 disabled:cursor-not-allowed text-sm font-medium transition-colors"
                            disabled={isNewForm}
                        >
                            Upload Header
                        </button>
                    </div>
                </div>
            </div>

            {/* Questions List */}
            <div className="space-y-6">
                <AnimatePresence>
                    {form.questions.map((question, index) => (
                        <motion.div 
                            key={question._id}
                            initial={{ opacity: 0, height: 0 }}
                            animate={{ opacity: 1, height: 'auto' }}
                            exit={{ opacity: 0, height: 0 }}
                            className="bg-white/5 backdrop-blur-md p-6 rounded-xl border border-white/10 shadow-lg hover:border-indigo-500/50 transition-all relative overflow-hidden group"
                        >
                            <div className="flex justify-between items-center">
                                <div>
                                    <p className="text-xs font-bold text-indigo-400 uppercase tracking-widest mb-2 font-mono">
                                        {question.type}
                                    </p>
                                    <p className="text-lg font-medium text-white/90 truncate max-w-xl">
                                        {/* Dynamic content rendering based on type */}
                                        {question.type === 'Cloze' ? 'Fill in the blanks passage' :
                                         question.type === 'Categorize' ? 'Categorization Matrix' :
                                         question.type === 'Banner' ? 'UI Banner' :
                                         question.type === 'Heading' ? question.content?.text :
                                         question.type === 'Paragraph' ? question.content?.text :
                                         question.content?.question || "Module Content"}
                                    </p>
                                </div>
                                <div className="flex gap-3 opacity-100 md:opacity-0 md:group-hover:opacity-100 transition-opacity">
                                    <button onClick={() => setEditingQuestion(question)} className="text-sm bg-indigo-500/20 text-indigo-300 hover:bg-indigo-500/40 border border-indigo-500/20 py-2 px-5 rounded-lg font-medium transition-colors">Edit</button>
                                    <button onClick={() => handleDeleteQuestion(question._id)} className="text-sm bg-red-500/20 text-red-300 hover:bg-red-500/40 border border-red-500/20 py-2 px-5 rounded-lg font-medium flex items-center gap-2 transition-colors">
                                        <Trash2 size={16} /> Delete
                                    </button>
                                </div>
                            </div>
                        </motion.div>
                    ))}
                </AnimatePresence>
            </div>

            {/* Builder Selection Grid */}
            <div className="mt-10">
                {activeBuilder || editingQuestion ? (
                    <div className="border border-indigo-500/30 rounded-2xl overflow-hidden bg-slate-900/50 backdrop-blur-xl shadow-2xl">
                         {renderBuilder()}
                    </div>
                ) : (
                    <div className="p-8 border-2 border-dashed border-white/20 rounded-2xl bg-white/5 backdrop-blur-sm">
                        <h3 className="text-2xl font-bold mb-8 text-white tracking-tight text-center">Expand Neural Form</h3>
                        
                        <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
                            {/* Column 1: Choice Modules */}
                            <div className="flex flex-col gap-3">
                                <h4 className="text-xs uppercase tracking-widest text-indigo-400 font-bold mb-2">Choice Vectors</h4>
                                <button onClick={() => setActiveBuilder('multiplechoice')} className="bg-indigo-600/20 text-indigo-300 border border-indigo-500/30 py-2.5 px-4 rounded-xl hover:bg-indigo-500/40 text-left text-sm font-medium transition-all">Multiple Choice</button>
                                <button onClick={() => setActiveBuilder('checkbox')} className="bg-indigo-600/20 text-indigo-300 border border-indigo-500/30 py-2.5 px-4 rounded-xl hover:bg-indigo-500/40 text-left text-sm font-medium transition-all">Checkboxes</button>
                                <button onClick={() => setActiveBuilder('dropdown')} className="bg-indigo-600/20 text-indigo-300 border border-indigo-500/30 py-2.5 px-4 rounded-xl hover:bg-indigo-500/40 text-left text-sm font-medium transition-all">Dropdown List</button>
                                <button onClick={() => setActiveBuilder('picturechoice')} className="bg-indigo-600/20 text-indigo-300 border border-indigo-500/30 py-2.5 px-4 rounded-xl hover:bg-indigo-500/40 text-left text-sm font-medium transition-all">Picture Choice</button>
                            </div>

                            {/* Column 2: Text Inputs */}
                            <div className="flex flex-col gap-3">
                                <h4 className="text-xs uppercase tracking-widest text-pink-400 font-bold mb-2">Data Input</h4>
                                <button onClick={() => setActiveBuilder('shortanswer')} className="bg-pink-600/20 text-pink-300 border border-pink-500/30 py-2.5 px-4 rounded-xl hover:bg-pink-500/40 text-left text-sm font-medium transition-all">Short Answer</button>
                                <button onClick={() => setActiveBuilder('longanswer')} className="bg-pink-600/20 text-pink-300 border border-pink-500/30 py-2.5 px-4 rounded-xl hover:bg-pink-500/40 text-left text-sm font-medium transition-all">Long Answer</button>
                                <button onClick={() => setActiveBuilder('email')} className="bg-pink-600/20 text-pink-300 border border-pink-500/30 py-2.5 px-4 rounded-xl hover:bg-pink-500/40 text-left text-sm font-medium transition-all">Email Address</button>
                            </div>

                            {/* Column 3: Advanced Cognitive */}
                            <div className="flex flex-col gap-3">
                                <h4 className="text-xs uppercase tracking-widest text-emerald-400 font-bold mb-2">Cognitive Matrix</h4>
                                <button onClick={() => setActiveBuilder('comprehension')} className="bg-emerald-600/20 text-emerald-300 border border-emerald-500/30 py-2.5 px-4 rounded-xl hover:bg-emerald-500/40 text-left text-sm font-medium transition-all">Comprehension</button>
                                <button onClick={() => setActiveBuilder('categorize')} className="bg-emerald-600/20 text-emerald-300 border border-emerald-500/30 py-2.5 px-4 rounded-xl hover:bg-emerald-500/40 text-left text-sm font-medium transition-all">Categorize</button>
                                <button onClick={() => setActiveBuilder('cloze')} className="bg-emerald-600/20 text-emerald-300 border border-emerald-500/30 py-2.5 px-4 rounded-xl hover:bg-emerald-500/40 text-left text-sm font-medium transition-all">Cloze (Blanks)</button>
                                <button onClick={() => setActiveBuilder('switch')} className="bg-emerald-600/20 text-emerald-300 border border-emerald-500/30 py-2.5 px-4 rounded-xl hover:bg-emerald-500/40 text-left text-sm font-medium transition-all">Toggle Switch</button>
                            </div>

                            {/* Column 4: UI Structure */}
                            <div className="flex flex-col gap-3">
                                <h4 className="text-xs uppercase tracking-widest text-amber-400 font-bold mb-2">UI Structure</h4>
                                <button onClick={() => setActiveBuilder('heading')} className="bg-amber-600/20 text-amber-300 border border-amber-500/30 py-2.5 px-4 rounded-xl hover:bg-amber-500/40 text-left text-sm font-medium transition-all">Heading</button>
                                <button onClick={() => setActiveBuilder('paragraph')} className="bg-amber-600/20 text-amber-300 border border-amber-500/30 py-2.5 px-4 rounded-xl hover:bg-amber-500/40 text-left text-sm font-medium transition-all">Paragraph</button>
                                <button onClick={() => setActiveBuilder('banner')} className="bg-amber-600/20 text-amber-300 border border-amber-500/30 py-2.5 px-4 rounded-xl hover:bg-amber-500/40 text-left text-sm font-medium transition-all">Banner Image</button>
                            </div>
                        </div>
                    </div>
                )}
            </div>
      
            {/* Footer with Chat Mode */}
            <div className="mt-12 border-t border-white/10 pt-8 flex justify-between items-center gap-4">
                <button
                    onClick={handleDeleteForm}
                    disabled={isNewForm}
                    className="py-2.5 px-6 rounded-xl text-white font-semibold bg-red-600/20 border border-red-500/30 hover:bg-red-600/40 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
                >
                    Delete Module
                </button>
                <div className="flex justify-end items-center gap-4">
                    <button
                        onClick={handleShare}
                        disabled={isNewForm}
                        className={`py-2.5 px-6 rounded-xl text-white font-semibold transition-colors disabled:opacity-50 disabled:cursor-not-allowed border ${
                            copied ? 'bg-green-500/20 border-green-500/30 text-green-400' : 'bg-purple-600/20 border-purple-500/30 text-purple-400 hover:bg-purple-600/40'
                        }`}
                    >
                        {copied ? 'Link Copied!' : 'Share Form'}
                    </button>
                    
                    <button
                        onClick={handleChatMode}
                        disabled={isNewForm}
                        className="py-2.5 px-6 rounded-xl text-pink-400 font-semibold bg-pink-500/20 border border-pink-500/30 hover:bg-pink-500/40 transition-colors disabled:opacity-50 disabled:cursor-not-allowed flex items-center gap-2"
                    >
                        <MessageSquareText size={18} /> Chat Mode
                    </button>

                    <button
                        onClick={handleViewForm}
                        disabled={isNewForm}
                        className="py-2.5 px-8 rounded-xl text-white font-bold bg-indigo-600 hover:bg-indigo-500 shadow-lg shadow-indigo-500/25 transition-all disabled:opacity-50 disabled:cursor-not-allowed"
                    >
                        Live Preview
                    </button>
                </div>
            </div>
        </motion.div>
    );
};

export default FormEditor;