// client/src/pages/FormRenderer.jsx
import { useState, useEffect, useCallback } from 'react';
import axios from 'axios';
import { useParams, useNavigate } from 'react-router-dom';
import { useUser } from '@clerk/clerk-react';

// --- Import ALL Renderers ---
import ComprehensionRenderer from '../components/renderer/ComprehensionRenderer';
import CategorizeRenderer from '../components/renderer/CategorizeRenderer';
import ClozeRenderer from '../components/renderer/ClozeRenderer';
import HeadingRenderer from '../components/renderer/HeadingRenderer';
import ParagraphRenderer from '../components/renderer/ParagraphRenderer';
import BannerRenderer from '../components/renderer/BannerRenderer';

import { themes as themesObject } from '../themes';

const gridBackground = "bg-[#f8f7f4] bg-[length:80px_80px] bg-[linear-gradient(transparent_78px,rgba(59,130,246,0.3)_80px),linear-gradient(90deg,transparent_78px,rgba(59,130,246,0.3)_80px)]";

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
      setLoading(true); // Set loading state
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
    } finally {
        setLoading(false); // Unset loading state
    }
  };

  if (loading && !form) return <div className="min-h-screen bg-gray-50 flex items-center justify-center text-gray-800 text-xl">Loading Form...</div>;
  if (error) return <div className="min-h-screen bg-gray-50 flex items-center justify-center text-red-500 text-xl">{error}</div>;
  if (!form) return null;

  const theme = themesObject[form.theme] || themesObject['Default'];

  return (
    <div className={`min-h-screen py-16 px-4 transition-colors duration-300 ${gridBackground}`}>
      <div className="max-w-4xl mx-auto">
        {/* --- Form Header Canvas --- */}
        <div className={`p-8 rounded-lg shadow-md mb-10 text-center ${theme.cardBg}`}>
          {form.headerImage && (
            <img 
              src={form.headerImage} 
              alt="Form Header" 
              className="w-full h-56 object-cover rounded-md mb-8" 
            />
          )}
          <h1 className={`text-4xl font-bold ${theme.text}`}>{form.title}</h1>
        </div>
        
        {/* --- UPDATED: Main Render Loop --- */}
        <div className="space-y-8">
            {form.questions.map(question => {
                // --- Pass theme prop to all renderers ---
                switch (question.type) {
                // Simple Display Components
                case 'Heading':
                    return <HeadingRenderer key={question._id} text={question.text} theme={theme} />;
                case 'Paragraph':
                    return <ParagraphRenderer key={question._id} text={question.text} theme={theme} />;
                case 'Banner':
                    return <BannerRenderer key={question._id} imageSrc={question.image} theme={theme} />;

                // Complex Question Components
                case 'Comprehension':
                    return <ComprehensionRenderer key={question._id} question={question} onAnswerChange={handleAnswerChange} theme={theme} />;
                case 'Categorize':
                    return <CategorizeRenderer key={question._id} question={question} onAnswerChange={handleAnswerChange} theme={theme} />;
                case 'Cloze':
                    return <ClozeRenderer key={question._id} question={question} onAnswerChange={handleAnswerChange} theme={theme} />;
                
                // --- Add other question types here ---

                default:
                    return null;
                }
            })}
        </div>

        <div className="mt-12 text-center">
          <button onClick={handleSubmit} className={theme.button} disabled={loading}>
            {loading ? 'Submitting...' : 'Submit Form'}
          </button>
        </div>
      </div>
    </div>
  );
};

export default FormRenderer;