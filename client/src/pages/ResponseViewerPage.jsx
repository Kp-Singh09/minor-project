// src/pages/ResponseViewerPage.jsx
import { useState, useEffect } from 'react';
import { useParams, Link } from 'react-router-dom';
import axios from 'axios';
import { motion } from 'framer-motion';

const ResponseViewerPage = () => {
  const { formId } = useParams();
  const [responses, setResponses] = useState([]);
  const [form, setForm] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchData = async () => {
      try {
        const formRes = await axios.get(`${import.meta.env.VITE_API_BASE_URL}/api/forms/${formId}`);
        const responsesRes = await axios.get(`${import.meta.env.VITE_API_BASE_URL}/api/responses/${formId}`);
        
        setForm(formRes.data);
        setResponses(responsesRes.data);
      } catch (error) {
        console.error("Failed to fetch response data", error);
      } finally {
        setLoading(false);
      }
    };
    fetchData();
  }, [formId]);

  if (loading) return <p className="text-center text-gray-500 p-8">Loading responses...</p>;

  return (
    <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }}>
      <Link to="/responses" className="text-blue-600 hover:underline mb-6 block">&larr; Back to All Forms</Link>
      <h1 className="text-4xl font-bold mb-2 text-gray-900">Responses for "{form?.title}"</h1>
      <p className="text-gray-600 mb-8">{responses.length} total submission(s)</p>

      {responses.length > 0 ? (
        <div className="space-y-6">
          {responses.map((response) => (
            <div key={response._id} className="bg-white p-6 rounded-lg flex justify-between items-center transition-shadow hover:shadow-xl border border-gray-200 shadow-sm border-t-4 border-t-blue-400">
              <div>
                <p className="font-semibold text-gray-800">{response.userEmail}</p>
                <p className="text-sm text-gray-500 mt-1">
                  Score: {response.score} / {response.totalMarks}
                </p>
              </div>
              {/* This button color is now updated */}
              <Link 
                to={`/results/${response._id}`} 
                className="bg-sky-500 hover:bg-sky-600 text-white font-bold py-2 px-4 rounded-lg transition-transform hover:scale-105"
              >
                View Result
              </Link>
            </div>
          ))}
        </div>
      ) : (
        <div className="text-center py-16 bg-white rounded-lg border border-gray-200 shadow-sm border-t-4 border-t-blue-400">
          <h3 className="text-2xl font-semibold text-gray-800">No responses yet for this form.</h3>
        </div>
      )}
    </motion.div>
  );
};

export default ResponseViewerPage;