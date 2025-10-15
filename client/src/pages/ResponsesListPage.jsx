// src/pages/ResponsesListPage.jsx
import { useState, useEffect } from 'react';
import { useUser } from '@clerk/clerk-react';
import axios from 'axios';
import { Link } from 'react-router-dom';
import { motion } from 'framer-motion';

const ResponsesListPage = () => {
  const { user } = useUser();
  const [forms, setForms] = useState([]);
  const [loading, setLoading] = useState(true);

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

  if (loading) return <p className="text-center text-gray-500">Loading your forms...</p>;

  return (
    <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }}>
      <h1 className="text-4xl font-bold mb-8 text-gray-900">Form Responses</h1>
      
      {forms.length > 0 ? (
        <div className="space-y-6">
          {forms.map(form => (
            <div key={form._id} className="bg-white p-6 rounded-lg flex justify-between items-center border border-gray-200 shadow-md border-t-4 border-t-blue-400">
              <div>
                <h2 className="text-xl font-semibold text-gray-800">{form.title}</h2>
                <p className="text-sm text-gray-500 mt-1">{form.responses.length} response(s)</p>
              </div>
              {/* Updated button color to match the active sidebar link */}
              <Link to={`/responses/${form._id}`} className="bg-sky-500 hover:bg-sky-600 text-white font-bold py-2 px-5 rounded-lg transition-colors">
                Check Responses
              </Link>
            </div>
          ))}
        </div>
      ) : (
        <div className="text-center py-16 bg-white rounded-lg border border-gray-200 shadow-md border-t-4 border-t-blue-400">
          <h3 className="text-2xl font-semibold text-gray-800">You haven't created any forms yet.</h3>
          <p className="text-gray-500 mt-2">Create a new form to start collecting responses.</p>
        </div>
      )}
    </motion.div>
  );
};

export default ResponsesListPage;