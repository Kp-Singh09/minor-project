// src/pages/FormRenderer.jsx
import { useState, useEffect, useCallback } from 'react';
import axios from 'axios';
import { useParams, useNavigate } from 'react-router-dom';
import { useUser } from '@clerk/clerk-react';
import ComprehensionRenderer from '../components/renderer/ComprehensionRenderer';
import CategorizeRenderer from '../components/renderer/CategorizeRenderer';
import ClozeRenderer from '../components/renderer/ClozeRenderer';

const FormRenderer = () => {
  const { formId } = useParams();
  const { user } = useUser(); 
  const navigate = useNavigate();
  const [form, setForm] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [answers, setAnswers] = useState({});

  useEffect(() => {
    const fetchForm = async () => {
      try {
        const response = await axios.get(`${import.meta.env.VITE_API_BASE_URL}/api/forms/${formId}`);
        setForm(response.data);
      } catch (err) {
        setError('Failed to fetch form. Please check the URL.');
      } finally {
        setLoading(false);
      }
    };
    fetchForm();
  }, [formId]);

  const handleAnswerChange = useCallback((questionId, answer) => {
    setAnswers(prev => ({ ...prev, [questionId]: answer }));
  }, []);

  const handleSubmit = async () => {
    if (!user) {
      alert("You must be signed in to submit a response.");
      return;
    }
    try {
      const response = await axios.post(`${import.meta.env.VITE_API_BASE_URL}/api/responses`, {
        formId,
        answers: Object.entries(answers).map(([questionId, answer]) => ({ questionId, answer })),
        userId: user.id,
        userEmail: user.primaryEmailAddress.emailAddress,
      });
      
      const { responseId } = response.data;
      if (responseId) {
        navigate(`/results/${responseId}`);
      } else {
        alert('Form submitted, but could not redirect to results.');
      }

    } catch (err) {
      alert('Error submitting form. Please try again.');
    }
  };

  if (loading) return <div className="min-h-screen bg-gray-50 flex items-center justify-center text-gray-800 text-xl">Loading Form...</div>;
  if (error) return <div className="min-h-screen bg-gray-50 flex items-center justify-center text-red-500 text-xl">{error}</div>;
  if (!form) return null;

  return (
    <div className="min-h-screen text-gray-800 py-16 px-4 bg-[#f8f7f4] bg-[length:80px_80px] bg-[linear-gradient(transparent_78px,rgba(59,130,246,0.3)_80px),linear-gradient(90deg,transparent_78px,rgba(59,130,246,0.3)_80px)]">
      <div className="max-w-4xl mx-auto">
        {/* The blue top border has been removed from this card */}
        <div className="bg-white p-8 rounded-lg shadow-md mb-10 text-center border border-gray-200">
          {form.headerImage && (
            <img 
              src={form.headerImage} 
              alt="Form Header" 
              className="w-full h-56 object-cover rounded-md mb-8" 
            />
          )}
          <h1 className="text-4xl font-bold text-gray-900">{form.title}</h1>
        </div>
        
        <div className="space-y-8">
            {form.questions.map(question => {
                switch (question.type) {
                case 'Comprehension':
                    return <ComprehensionRenderer key={question._id} question={question} onAnswerChange={handleAnswerChange} />;
                case 'Categorize':
                    return <CategorizeRenderer key={question._id} question={question} onAnswerChange={handleAnswerChange} />;
                case 'Cloze':
                    return <ClozeRenderer key={question._id} question={question} onAnswerChange={handleAnswerChange} />;
                default:
                    return null;
                }
            })}
        </div>

        <div className="mt-12 text-center">
          <button onClick={handleSubmit} className="glow-btn text-xl">
            Submit Form
          </button>
        </div>
      </div>
    </div>
  );
};

export default FormRenderer;