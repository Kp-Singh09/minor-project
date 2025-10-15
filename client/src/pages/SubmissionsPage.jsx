// src/pages/SubmissionsPage.jsx
import { useState, useEffect } from 'react';
import { useUser } from '@clerk/clerk-react';
import axios from 'axios';
import { Link } from 'react-router-dom';
import { motion } from 'framer-motion';

const SubmissionsPage = () => {
  const { user } = useUser();
  const [submissions, setSubmissions] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (user) {
      const fetchSubmissions = async () => {
        try {
          const response = await axios.get(`${import.meta.env.VITE_API_BASE_URL}/api/responses/user/${user.id}`);
          setSubmissions(response.data);
        } catch (error) {
          console.error("Failed to fetch user submissions", error);
        } finally {
          setLoading(false);
        }
      };
      fetchSubmissions();
    }
  }, [user]);

  if (loading) return <p className="text-center text-gray-500">Loading your submissions...</p>;

  return (
    <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }}>
      <h1 className="text-4xl font-bold mb-8 text-gray-900">My Submissions</h1>
      
      {submissions.length > 0 ? (
        <div className="space-y-6">
          {submissions.map(submission => (
            <div key={submission._id} className="bg-white p-6 rounded-lg flex justify-between items-center border border-gray-200 shadow-md border-t-4 border-t-blue-400">
              <div>
                <h2 className="text-xl font-semibold text-gray-800">{submission.formId?.title || "Untitled Form"}</h2>
                <p className="text-sm text-gray-600 mt-1">
                  Score: {submission.score} / {submission.totalMarks}
                </p>
                <p className="text-xs text-gray-400 mt-1">
                  Submitted on: {new Date(submission.submittedAt).toLocaleDateString()}
                </p>
              </div>
              {/* This button color is now updated */}
              <Link to={`/results/${submission._id}`} className="bg-sky-500 hover:bg-sky-600 text-white font-bold py-2 px-5 rounded-lg transition-colors">
                View Result
              </Link>
            </div>
          ))}
        </div>
      ) : (
        <div className="text-center py-16 bg-white rounded-lg border border-gray-200 shadow-md border-t-4 border-t-blue-400">
          <h3 className="text-2xl font-semibold text-gray-800">You haven't submitted any forms yet.</h3>
          <p className="text-gray-500 mt-2">Your completed quizzes will appear here.</p>
        </div>
      )}
    </motion.div>
  );
};

export default SubmissionsPage;