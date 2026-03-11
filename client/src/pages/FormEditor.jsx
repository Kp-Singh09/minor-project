// client/src/pages/FormEditor.jsx
import { useState, useEffect, useRef } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { useUser, useAuth } from '@clerk/clerk-react';
import axios from '../api/axiosConfig'; 
import { motion, AnimatePresence } from 'framer-motion';
import { Sparkles, Trash2, Radio, MessageSquareText, Users, Settings } from 'lucide-react'; // Added Settings
import toast from 'react-hot-toast';

// Socket
import { initSocket, disconnectSocket } from '../api/socket';

// Builders
import ComprehensionBuilder from '../components/builder/ComprehensionBuilder';
import CategorizeBuilder from '../components/builder/CategorizeBuilder';
import ClozeBuilder from '../components/builder/ClozeBuilder';
import MultipleChoiceBuilder from '../components/builder/MultipleChoiceBuilder'; 

// Modals
import AiPromptModal from '../components/FormCreator/AiPromptModal';
import TeamModal from '../components/FormCreator/TeamModal'; 
import SettingsModal from '../components/FormCreator/SettingsModal'; // NEW IMPORT

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
    const [settingsModalOpen, setSettingsModalOpen] = useState(false); // NEW STATE
    
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
                settings: { proctoring: 'none', privacy: 'public' } // Default settings
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

    // NEW: Handle Settings Update
    const handleSettingsUpdate = async (newSettings) => {
        // Optimistic update
        setForm(prev => ({ ...prev, settings: newSettings }));
        
        if (!isNewForm) {
            try {
                await axios.put(`/api/forms/${formId}`, { settings: newSettings });
                // Optional: Toast here might be too frequent if typing, handle in modal close or debounce
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

    const renderBuilder = () => {
        const type = editingQuestion ? editingQuestion.type.toLowerCase() : activeBuilder;
        const onCancel = () => { setActiveBuilder(null); setEditingQuestion(null); };
        const initialData = editingQuestion;
        const props = { onSave: handleSaveQuestion, onCancel, initialData };

        switch(type) {
            case 'comprehension': return <ComprehensionBuilder {...props} />;
            case 'categorize': return <CategorizeBuilder {...props} />;
            case 'cloze': return <ClozeBuilder {...props} />;
            case 'multiplechoice': return <MultipleChoiceBuilder {...props} />;
            default: return null;
        }
    }

    if (loading) return <div className="h-screen w-full flex items-center justify-center bg-slate-900 text-white">Connecting Neural Interface...</div>;
    if (error) return <div className="p-8 text-center text-xl text-red-500">{error}</div>;
    if (!form) return null;

    return (
        <motion.div 
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            className="max-w-5xl mx-auto pb-20"
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

            {/* NEW SETTINGS MODAL */}
            <SettingsModal
                isOpen={settingsModalOpen}
                onClose={() => setSettingsModalOpen(false)}
                settings={form.settings}
                onUpdate={handleSettingsUpdate}
            />

            {/* Header Card */}
            <div className="bg-white p-6 rounded-lg mb-8 border border-gray-200 shadow-md border-t-4 border-t-indigo-500 relative">
                
                {/* Live Indicator & Settings */}
                <div className="absolute top-4 right-4 flex items-center gap-2">
                    {collaborators.length > 0 && (
                        <div className="flex items-center gap-1 bg-green-100 text-green-700 px-2 py-1 rounded-full text-xs font-bold border border-green-200">
                            <Radio size={12} className="animate-pulse" />
                            {collaborators.length} Live
                        </div>
                    )}
                    
                    {/* Settings Button */}
                    <button 
                        onClick={() => setSettingsModalOpen(true)}
                        disabled={isNewForm}
                        className="flex items-center gap-1 bg-slate-100 text-slate-600 px-3 py-1 rounded-full text-xs font-bold border border-slate-200 hover:bg-slate-200 transition-colors disabled:opacity-50"
                        title="Configure Monitoring"
                    >
                        <Settings size={12} /> Settings
                    </button>

                    {/* Team Button */}
                    <button 
                        onClick={() => setTeamModalOpen(true)}
                        disabled={isNewForm}
                        className="flex items-center gap-1 bg-slate-100 text-slate-600 px-3 py-1 rounded-full text-xs font-bold border border-slate-200 hover:bg-slate-200 transition-colors disabled:opacity-50"
                    >
                        <Users size={12} /> Team
                    </button>
                </div>

                {form.headerImage && <img src={form.headerImage} alt="Form Header" className="w-full h-48 object-cover rounded-lg mb-4" />}
                
                <div className="flex justify-between items-start mt-8">
                    <div className="flex-1 mr-4">
                        {isEditingTitle ? (
                            <input
                                type="text"
                                value={currentTitle}
                                onChange={(e) => setCurrentTitle(e.target.value)}
                                onBlur={handleTitleSave}
                                onKeyDown={(e) => { if (e.key === 'Enter') handleTitleSave(); }}
                                className="text-4xl font-bold bg-transparent border-b-2 border-gray-300 focus:outline-none focus:border-indigo-500 text-gray-900 w-full"
                                autoFocus
                            />
                        ) : (
                            <h1
                                className="text-4xl font-bold cursor-pointer hover:bg-gray-100 p-2 -m-2 rounded-md text-gray-900"
                                onClick={() => setIsEditingTitle(true)}
                                title="Click to edit title"
                            >
                                {currentTitle}
                            </h1>
                        )}
                        <p className="text-gray-500 mt-2 px-2">
                            {isNewForm ? "Draft Mode" : `ID: ${form._id}`}
                        </p>
                    </div>

                    <div className="flex flex-col gap-2">
                        <button 
                            onClick={() => setAiModalOpen(true)}
                            className="bg-gradient-to-r from-indigo-600 to-purple-600 text-white py-2 px-4 rounded-md shadow-lg hover:shadow-indigo-500/30 transition-all flex items-center justify-center gap-2 font-semibold"
                        >
                            <Sparkles size={18} />
                            AI Generate
                        </button>

                        <input type="file" ref={fileInputRef} onChange={handleHeaderImageUpload} style={{ display: 'none' }} accept="image/*" />
                        <button 
                            onClick={() => fileInputRef.current.click()} 
                            className="bg-gray-200 hover:bg-gray-300 text-gray-800 py-2 px-4 rounded-md disabled:opacity-50 disabled:cursor-not-allowed text-sm"
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
                            className="bg-white p-6 rounded-lg border border-gray-200 shadow-md hover:shadow-lg transition-shadow relative overflow-hidden"
                        >
                            <div className="flex justify-between items-center">
                                <div>
                                    <p className="text-xs font-bold text-indigo-500 uppercase tracking-wider mb-1">
                                        {question.type}
                                    </p>
                                    <p className="text-lg font-semibold text-gray-800 truncate max-w-xl">
                                        {question.content?.question || "Question Content"}
                                    </p>
                                </div>
                                <div className="flex gap-2">
                                    <button onClick={() => setEditingQuestion(question)} className="text-sm bg-blue-100 text-blue-700 hover:bg-blue-200 py-2 px-4 rounded-md font-medium">Edit</button>
                                    <button onClick={() => handleDeleteQuestion(question._id)} className="text-sm bg-red-100 text-red-700 hover:bg-red-200 py-2 px-4 rounded-md font-medium flex items-center gap-1">
                                        <Trash2 size={16} /> Delete
                                    </button>
                                </div>
                            </div>
                        </motion.div>
                    ))}
                </AnimatePresence>
            </div>

            {/* Builder Selection */}
            <div className="mt-10">
                {activeBuilder || editingQuestion ? (
                    <div className="border border-indigo-500/30 rounded-2xl overflow-hidden bg-white shadow-xl">
                         {renderBuilder()}
                    </div>
                ) : (
                    <div className="text-center p-8 border-2 border-dashed border-gray-300 rounded-lg bg-white/50">
                        <h3 className="text-xl font-semibold mb-4 text-gray-800">Add a New Question</h3>
                        <div className="grid grid-cols-2 md:grid-cols-4 gap-4 max-w-3xl mx-auto">
                            <button onClick={() => setActiveBuilder('multiplechoice')} className="bg-blue-500 text-white py-3 px-5 rounded-lg shadow hover:bg-blue-600 transition-colors font-medium">Multiple Choice</button>
                            <button onClick={() => setActiveBuilder('comprehension')} className="bg-purple-500 text-white py-3 px-5 rounded-lg shadow hover:bg-purple-600 transition-colors font-medium">Comprehension</button>
                            <button onClick={() => setActiveBuilder('categorize')} className="bg-emerald-500 text-white py-3 px-5 rounded-lg shadow hover:bg-emerald-600 transition-colors font-medium">Categorize</button>
                            <button onClick={() => setActiveBuilder('cloze')} className="bg-amber-500 text-white py-3 px-5 rounded-lg shadow hover:bg-amber-600 transition-colors font-medium">Cloze</button>
                        </div>
                    </div>
                )}
            </div>
      
            {/* Footer with Chat Mode */}
            <div className="mt-12 border-t border-gray-300 pt-6 flex justify-between items-center gap-4">
                <button
                    onClick={handleDeleteForm}
                    disabled={isNewForm}
                    className="py-2 px-5 rounded-lg text-white font-semibold bg-red-600 hover:bg-red-700 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
                >
                    Delete Form
                </button>
                <div className="flex justify-end items-center gap-4">
                    <button
                        onClick={handleShare}
                        disabled={isNewForm}
                        className={`py-2 px-5 rounded-lg text-white font-semibold transition-colors disabled:opacity-50 disabled:cursor-not-allowed ${
                            copied ? 'bg-green-600' : 'bg-purple-600 hover:bg-purple-700'
                        }`}
                    >
                        {copied ? 'Copied!' : 'Share'}
                    </button>
                    
                    <button
                        onClick={handleChatMode}
                        disabled={isNewForm}
                        className="py-2 px-5 rounded-lg text-white font-semibold bg-pink-500 hover:bg-pink-600 transition-colors disabled:opacity-50 disabled:cursor-not-allowed flex items-center gap-2"
                    >
                        <MessageSquareText size={18} /> Chat Mode
                    </button>

                    <button
                        onClick={handleViewForm}
                        disabled={isNewForm}
                        className="py-2 px-5 rounded-lg text-white font-semibold bg-blue-600 hover:bg-blue-700 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
                    >
                        Preview
                    </button>
                </div>
            </div>
        </motion.div>
    );
};

export default FormEditor;