// client/src/pages/DashboardPage.jsx
import { useState, useEffect } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { useUser } from '@clerk/clerk-react';
import axios from 'axios';
import { motion } from 'framer-motion';

const DashboardPage = () => {
  const navigate = useNavigate();
  const { user } = useUser();
  const [forms, setForms] = useState([]);
  const [loading, setLoading] = useState(true);
  const [copiedFormId, setCopiedFormId] = useState(null);

  useEffect(() => {
    if (user) {
      const fetchUserForms = async () => {
        try {
          const response = await axios.get(`${import.meta.env.VITE_API_BASE_URL}/api/forms/user/${user.id}`);
          setForms(response.data);
        } catch (error) {
          console.error("Failed to fetch user forms", error);
        } finally {
          setLoading(false);
        }
      };
      fetchUserForms();
    }
  }, [user]);

  const handleCreateForm = () => {
    navigate('/editor/new');
  };

  const handleShare = (formId, event) => {
    event.preventDefault();
    event.stopPropagation();
    
    const shareLink = `${window.location.origin}/form/${formId}`;
    navigator.clipboard.writeText(shareLink).then(() => {
      setCopiedFormId(formId);
      setTimeout(() => setCopiedFormId(null), 2000);
    });
  };

  const handleDelete = async (formId, formTitle, event) => {
    event.preventDefault();
    event.stopPropagation();

    if (window.confirm(`Are you sure you want to delete "${formTitle}"? This action cannot be undone.`)) {
      try {
        await axios.delete(`${import.meta.env.VITE_API_BASE_URL}/api/forms/${formId}`);
        setForms(forms.filter(form => form._id !== formId));
      } catch (error) {
        console.error("Failed to delete form", error);
        alert("Could not delete the form. Please try again.");
      }
    }
  };

  if (loading) {
    return (
        <div className="flex items-center justify-center p-8">
            <p className="text-gray-500">Loading your forms...</p>
        </div>
    );
  }

  return (
    <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }}>
        <div className="flex justify-between items-center mb-10">
            <h1 className="text-4xl font-bold text-gray-900">Your Forms</h1>
            <motion.button 
                whileHover={{ scale: 1.05 }}
                whileTap={{ scale: 0.95 }}
                onClick={handleCreateForm} 
                className="glow-btn"
            >
                + Create New Form
            </motion.button>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
            {forms.length > 0 ? (
                forms.map((form) => (
                    <div key={form._id} className="flex flex-col bg-white rounded-xl shadow-md border border-gray-200 border-t-4 border-t-blue-400">
                        <Link to={`/editor/${form._id}`} className="block p-6 flex-grow hover:bg-gray-50 rounded-t-xl transition-colors">
                            <h3 className="text-xl font-semibold mb-2 truncate text-gray-800">{form.title}</h3>
                            <p className="text-gray-500 text-sm">{form.responses.length} response(s)</p>
                        </Link>
                        <div className="p-4 flex gap-2 border-t border-gray-200">
                            <button 
                              onClick={(e) => handleShare(form._id, e)}
                              className={`w-full py-2 rounded-lg text-sm font-semibold transition-colors ${
                                copiedFormId === form._id 
                                ? 'bg-green-100 text-green-700' 
                                : 'bg-purple-100 text-purple-700 hover:bg-purple-200'
                              }`}
                            >
                              {copiedFormId === form._id ? 'Copied!' : 'Share'}
                            </button>
                            <Link to={`/editor/${form._id}`} className="w-full">
                                <button className="w-full bg-blue-100 text-blue-700 py-2 rounded-lg text-sm font-semibold hover:bg-blue-200 transition-colors">
                                  Edit
                                </button>
                            </Link>
                            <button 
                              onClick={(e) => handleDelete(form._id, form.title, e)}
                              className="p-2 px-3 bg-red-100 text-red-700 rounded-lg text-sm font-semibold hover:bg-red-200 transition-colors"
                              title="Delete Form"
                            >
                              🗑️
                            </button>
                        </div>
                    </div>
                ))
            ) : (
                <div className="col-span-full text-center py-16 bg-white rounded-xl border border-gray-200 shadow-md border-t-4 border-t-blue-400">
                    <h3 className="text-2xl font-semibold text-gray-800">No forms yet!</h3>
                    <p className="text-gray-500 mt-2">Click "Create New Form" to get started.</p>
                </div>
            )}
        </div>
    </motion.div>
  );
};

export default DashboardPage;