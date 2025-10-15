// src/pages/ResultsPage.jsx
import { useState, useEffect } from 'react';
import { useParams, Link } from 'react-router-dom';
import axios from 'axios';
import { motion } from 'framer-motion';
import AnswerCard from '../components/results/AnswerCard';

const ResultsPage = () => {
    const { responseId } = useParams();
    const [response, setResponse] = useState(null);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        const fetchResponse = async () => {
            try {
                const res = await axios.get(`${import.meta.env.VITE_API_BASE_URL}/api/responses/single/${responseId}`);
                setResponse(res.data);
            } catch (error) {
                console.error("Failed to fetch result", error);
            } finally {
                setLoading(false);
            }
        };
        fetchResponse();
    }, [responseId]);

    if (loading) return <p className="text-center text-gray-500 p-8">Loading result...</p>;
    if (!response) return <p className="text-center text-red-500 p-8">Could not load result.</p>;

    const percentage = response.totalMarks > 0 ? ((response.score / response.totalMarks) * 100).toFixed(2) : 0;

    return (
        <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} className="p-8">
            <Link to={`/responses/${response.formId}`} className="text-blue-600 hover:underline mb-6 block">&larr; Back to All Submissions</Link>
            
            <div className="bg-white p-8 rounded-lg mb-8 border border-gray-200 shadow-sm">
                <h1 className="text-3xl font-bold text-gray-900">Results for {response.userEmail}</h1>
                <div className="mt-4 flex items-baseline gap-4 text-gray-600">
                    <p className={`text-5xl font-bold ${percentage >= 50 ? 'text-green-500' : 'text-red-500'}`}>
                        {percentage}%
                    </p>
                    <p className="text-xl">Score: {response.score} / {response.totalMarks}</p>
                </div>
            </div>

            <h2 className="text-2xl font-bold mb-6 text-gray-900">Answer Breakdown</h2>
            <div className="space-y-6">
                {response.answers.map((answer, index) => (
                    <AnswerCard key={answer._id} answerData={answer} index={index} />
                ))}
            </div>
        </motion.div>
    );
};

export default ResultsPage;