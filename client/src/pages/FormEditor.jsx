// client/src/pages/FormEditor.jsx
import { useState, useEffect, useRef } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { useUser } from '@clerk/clerk-react';
import axios from 'axios';
import ComprehensionBuilder from '../components/builder/ComprehensionBuilder';
import CategorizeBuilder from '../components/builder/CategorizeBuilder';
import ClozeBuilder from '../components/builder/ClozeBuilder';
import { motion } from 'framer-motion';

const FormEditor = () => {
    const { formId } = useParams();
    const navigate = useNavigate();
    const { user } = useUser();
    const isNewForm = !formId;

    const [form, setForm] = useState(null);
    const [loading, setLoading] = useState(!isNewForm);
    const [error, setError] = useState(null);
    const [activeBuilder, setActiveBuilder] = useState(null);
    const [isEditingTitle, setIsEditingTitle] = useState(false);
    const [currentTitle, setCurrentTitle] = useState("");
    const [copied, setCopied] = useState(false);
    const fileInputRef = useRef(null);

    const hasUnsavedChanges = form && currentTitle !== form.title;

    useEffect(() => {
        if (isNewForm) {
            const defaultTitle = 'Untitled Form';
            setForm({ title: defaultTitle, questions: [], headerImage: null });
            setCurrentTitle(defaultTitle);
            setLoading(false);
        } else {
            const fetchForm = async () => {
                try {
                    const response = await axios.get(`${import.meta.env.VITE_API_BASE_URL}/api/forms/${formId}`);
                    setForm(response.data);
                    setCurrentTitle(response.data.title);
                } catch (err) {
                    setError('Failed to fetch form data.');
                } finally {
                    setLoading(false);
                }
            };
            fetchForm();
        }
    }, [formId, isNewForm]);

    const handleTitleSave = async () => {
        if (!hasUnsavedChanges) {
            setIsEditingTitle(false);
            return;
        }
        try {
            if (isNewForm) {
                if (!user) throw new Error("User not found");
                const formResponse = await axios.post(`${import.meta.env.VITE_API_BASE_URL}/api/forms`, {
                    title: currentTitle,
                    userId: user.id,
                    username: user.fullName || user.username
                });
                navigate(`/editor/${formResponse.data._id}`, { replace: true });
            } else {
                const response = await axios.put(`${import.meta.env.VITE_API_BASE_URL}/api/forms/${formId}`, { title: currentTitle });
                setForm(response.data);
                setCurrentTitle(response.data.title);
            }
        } catch (err) {
            console.error("Failed to update title", err);
            if (form) {
                setCurrentTitle(form.title);
            }
        } finally {
            setIsEditingTitle(false);
        }
    };

    const handleSaveQuestion = async (questionData) => {
        try {
            let currentFormId = formId;
            if (isNewForm) {
                if (!user) throw new Error("User not found");
                const formResponse = await axios.post(`${import.meta.env.VITE_API_BASE_URL}/api/forms`, {
                    title: currentTitle,
                    userId: user.id,
                    username: user.fullName || user.username 
                });
                currentFormId = formResponse.data._id;
                navigate(`/editor/${currentFormId}`, { replace: true });
            }
            
            await axios.post(`${import.meta.env.VITE_API_BASE_URL}/api/forms/${currentFormId}/questions`, questionData);
            
            const updatedForm = await axios.get(`${import.meta.env.VITE_API_BASE_URL}/api/forms/${currentFormId}`);
            setForm(updatedForm.data);
            setActiveBuilder(null);

        } catch (err) {
            alert("Error: Could not save the question.");
            console.error(err);
        }
    };
  
    const handleHeaderImageUpload = async (event) => {
        const file = event.target.files[0];
        if (!file || isNewForm) return;

        try {
            const authResponse = await axios.get(`${import.meta.env.VITE_API_BASE_URL}/api/imagekit/auth`);
            const formData = new FormData();
            formData.append('file', file);
            formData.append('fileName', file.name);
            formData.append('publicKey', import.meta.env.VITE_IMAGEKIT_PUBLIC_KEY);
            formData.append('signature', authResponse.data.signature);
            formData.append('expire', authResponse.data.expire);
            formData.append('token', authResponse.data.token);

            const uploadResponse = await axios.post('https://upload.imagekit.io/api/v1/files/upload', formData);
            const imageUrl = uploadResponse.data.url;

            const updateResponse = await axios.put(`${import.meta.env.VITE_API_BASE_URL}/api/forms/${formId}`, { headerImage: imageUrl });
      
            setForm(updateResponse.data);
        } catch (err) {
            alert('Failed to upload header image.');
        }
    };
  
    const handleShare = () => {
        if (isNewForm) return;
        const shareLink = `${window.location.origin}/form/${formId}`;
        navigator.clipboard.writeText(shareLink).then(() => {
            setCopied(true);
            setTimeout(() => setCopied(false), 2000);
        });
    };

    const handleViewForm = () => {
        if (!isNewForm) {
            window.open(`/form/${formId}`, '_blank');
        }
    };

    const handleDeleteForm = async () => {
        if (isNewForm) return;

        if (window.confirm(`Are you sure you want to delete "${form.title}"? This is permanent.`)) {
            try {
                await axios.delete(`${import.meta.env.VITE_API_BASE_URL}/api/forms/${formId}`);
                alert('Form deleted successfully.');
                navigate('/dashboard'); 
            } catch (error) {
                console.error('Failed to delete form', error);
                alert('Could not delete form. Please try again.');
            }
        }
    };

    if (loading) return <div className="p-8 text-center text-xl font-semibold text-gray-600">Loading Editor...</div>;
    if (error) return <div className="p-8 text-center text-xl text-red-500">{error}</div>;
    if (!form) return null;

    return (
        // The max-w-5xl and mx-auto classes have been removed to prevent the "double background"
        <motion.div 
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
        >
            <div className="bg-white p-6 rounded-lg mb-8 border border-gray-200 shadow-md border-t-4 border-t-blue-400">
                {form.headerImage && <img src={form.headerImage} alt="Form Header" className="w-full h-48 object-cover rounded-lg mb-4" />}
                <div className="flex justify-between items-start">
                    <div>
                        {isEditingTitle ? (
                            <input
                                type="text"
                                value={currentTitle}
                                onChange={(e) => setCurrentTitle(e.target.value)}
                                onBlur={handleTitleSave}
                                onKeyDown={(e) => { if (e.key === 'Enter') handleTitleSave(); }}
                                className="text-4xl font-bold bg-transparent border-b-2 border-gray-300 focus:outline-none focus:border-blue-500 text-gray-900"
                                autoFocus
                            />
                        ) : (
                            <h1
                                className="text-4xl font-bold cursor-pointer hover:bg-gray-100 p-2 -m-2 rounded-md text-gray-900"
                                onClick={() => setIsEditingTitle(true)}
                                title={"Click to edit title"}
                            >
                                {currentTitle}
                            </h1>
                        )}
                        <p className="text-gray-500 mt-2 px-2">
                            {isNewForm ? "Add a question to save your new form." : `Form ID: ${form._id}`}
                        </p>
                    </div>
                    <div>
                        <input type="file" ref={fileInputRef} onChange={handleHeaderImageUpload} style={{ display: 'none' }} accept="image/*" />
                        <button 
                            onClick={() => fileInputRef.current.click()} 
                            className="bg-gray-200 hover:bg-gray-300 text-gray-800 py-2 px-4 rounded-md disabled:opacity-50 disabled:cursor-not-allowed"
                            disabled={isNewForm}
                            title={isNewForm ? "Save the form first to add a header" : "Upload header image"}
                        >
                            Upload Header
                        </button>
                    </div>
                </div>
            </div>

            <div className="space-y-6">
                {form.questions.map((question, index) => (
                    <div key={question._id || index} className="bg-white p-6 rounded-lg border border-gray-200 shadow-md border-t-4 border-t-blue-400">
                        <p className="text-lg font-semibold text-gray-800">Question {index + 1}: {question.type}</p>
                    </div>
                ))}
            </div>

            <div className="mt-10">
                {activeBuilder ? (
                    <div>
                        {activeBuilder === 'comprehension' && <ComprehensionBuilder onSave={handleSaveQuestion} onCancel={() => setActiveBuilder(null)}/>}
                        {activeBuilder === 'categorize' && <CategorizeBuilder onSave={handleSaveQuestion} onCancel={() => setActiveBuilder(null)}/>}
                        {activeBuilder === 'cloze' && <ClozeBuilder onSave={handleSaveQuestion} onCancel={() => setActiveBuilder(null)}/>}
                    </div>
                ) : (
                    // The blue top border has been removed from this dashed container
                    <div className="text-center p-8 border-2 border-dashed border-gray-300 rounded-lg bg-white/50">
                        <h3 className="text-xl font-semibold mb-4 text-gray-800">Add a New Question</h3>
                        <div className="flex justify-center gap-4">
                            <button onClick={() => setActiveBuilder('comprehension')} className="bg-blue-500 text-white py-2 px-5 rounded-lg shadow hover:bg-blue-600 transition-colors">Comprehension</button>
                            <button onClick={() => setActiveBuilder('categorize')} className="bg-purple-500 text-white py-2 px-5 rounded-lg shadow hover:bg-purple-600 transition-colors">Categorize</button>
                            <button onClick={() => setActiveBuilder('cloze')} className="bg-teal-500 text-white py-2 px-5 rounded-lg shadow hover:bg-teal-600 transition-colors">Cloze</button>
                        </div>
                    </div>
                )}
            </div>
      
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
                        onClick={handleViewForm}
                        disabled={isNewForm}
                        className="py-2 px-5 rounded-lg text-white font-semibold bg-blue-600 hover:bg-blue-700 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
                    >
                        Preview
                    </button>
                    <button
                        onClick={handleTitleSave}
                        disabled={!hasUnsavedChanges}
                        className="py-2 px-5 rounded-lg text-white font-semibold bg-green-600 hover:bg-green-700 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
                    >
                        Save Changes
                    </button>
                </div>
            </div>
        </motion.div>
    );
};

export default FormEditor;