// client/src/pages/FormRenderer.jsx
import { useState, useEffect, useCallback } from 'react';
import axios from 'axios';
import { useParams, useNavigate } from 'react-router-dom';
import { useUser } from '@clerk/clerk-react';

// --- Renderers ---
import ComprehensionRenderer from '../components/renderer/ComprehensionRenderer';
import CategorizeRenderer from '../components/renderer/CategorizeRenderer';
import ClozeRenderer from '../components/renderer/ClozeRenderer';
import HeadingRenderer from '../components/renderer/HeadingRenderer';
import ParagraphRenderer from '../components/renderer/ParagraphRenderer';
import BannerRenderer from '../components/renderer/BannerRenderer';
import ShortAnswerRenderer from '../components/renderer/ShortAnswerRenderer';
import LongAnswerRenderer from '../components/renderer/LongAnswerRenderer'; 
import MultipleChoiceRenderer from '../components/renderer/MultipleChoiceRenderer';
import EmailRenderer from '../components/renderer/EmailRenderer';
import CheckboxRenderer from '../components/renderer/CheckboxRenderer';
import DropdownRenderer from '../components/renderer/DropdownRenderer';
import SwitchRenderer from '../components/renderer/SwitchRenderer';
import PictureChoiceRenderer from '../components/renderer/PictureChoiceRenderer';

import { themes as themesObject, themesArray } from '../themes';
import Header from '../components/Header';

const gridOnly = "bg-[length:80px_80px] bg-[linear-gradient(transparent_78px,rgba(59,130,246,0.3)_80px),linear-gradient(90deg,transparent_78px,rgba(59,130,246,0.3)_80px)]";

const ThemeSwitcher = ({ currentThemeName, onThemeChange }) => {
  return (
    <div className="fixed right-4 z-50">
      <select
        value={currentThemeName}
        onChange={(e) => onThemeChange(e.target.value)}
        className="bg-white border border-gray-300 rounded-md shadow-lg py-2 px-3 text-gray-800 focus:outline-none focus:ring-2 focus:ring-blue-500"
      >
        <option value="" disabled>Change Theme</option>
        {themesArray.map(theme => (
          <option key={theme.name} value={theme.name}>
            {theme.name}
          </option>
        ))}
      </select>
    </div>
  );
};

const FormRenderer = () => {
  const { formId } = useParams();
  const { user } = useUser(); 
  const navigate = useNavigate();
  const [form, setForm] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [answers, setAnswers] = useState({});

  const [selectedThemeName, setSelectedThemeName] = useState('Light');

  useEffect(() => {
    const fetchForm = async () => {
      try {
        const response = await axios.get(`${import.meta.env.VITE_API_BASE_URL}/api/forms/${formId}`);
        setForm(response.data);
        setSelectedThemeName(response.data.theme || 'Light');
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
      setLoading(true); 
      
      // --- FIX: Robust Name Construction for Clerk ---
      // 1. Try fullName directly
      // 2. Try combining firstName + lastName
      // 3. Try username
      // 4. Fallback to "Anonymous"
      let submitName = "Anonymous";
      
      if (user.fullName) {
        submitName = user.fullName;
      } else if (user.firstName) {
        submitName = `${user.firstName} ${user.lastName || ''}`.trim();
      } else if (user.username) {
        submitName = user.username;
      }

      console.log("Submitting as:", submitName); // Debug log

      const response = await axios.post(`${import.meta.env.VITE_API_BASE_URL}/api/responses`, {
        formId,
        answers: Object.entries(answers).map(([questionId, answer]) => ({ questionId, answer })),
        userId: user.id,
        userEmail: user.primaryEmailAddress.emailAddress,
        username: submitName, // Send the constructed name
      });
      
      const { responseId } = response.data;
      if (responseId) {
        navigate(`/results/${responseId}`);
      } else {
        alert('Form submitted, but could not redirect to results.');
      }

    } catch (err) {
      console.error(err);
      alert('Error submitting form. Please try again.');
    } finally {
        setLoading(false);
    }
  };

  const theme = themesObject[selectedThemeName] || themesObject['Light'];
  const darkThemes = ['Dark', 'Navy Pop', 'Futuristic', 'Cyber Dawn'];
  const currentThemeMode = darkThemes.includes(selectedThemeName) ? 'dark' : 'light';

  if (loading && !form) return <div className="min-h-screen bg-gray-50 flex items-center justify-center text-gray-800 text-xl">Loading Form...</div>;
  if (error) return <div className="min-h-screen bg-gray-50 flex items-center justify-center text-red-500 text-xl">{error}</div>;
  if (!form) return null;

  const questionsToAnswer = form.questions.filter(q => 
    q.type !== 'Heading' && q.type !== 'Paragraph' && q.type !== 'Banner'
  );

  return (
    <div className={`min-h-screen px-4 pb-16 transition-colors duration-300 ${theme.background} ${gridOnly}`}>
      
      <Header themeMode={currentThemeMode} />

      <ThemeSwitcher 
        currentThemeName={selectedThemeName}
        onThemeChange={setSelectedThemeName}
      />
      
      <div className="max-w-4xl mx-auto">
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
        
        <div className="space-y-8">
            {form.questions.map(question => {
                switch (question.type) {
                case 'Heading': return <HeadingRenderer key={question._id} text={question.text} theme={theme} />;
                case 'Paragraph': return <ParagraphRenderer key={question._id} text={question.text} theme={theme} />;
                case 'Banner': return <BannerRenderer key={question._id} imageSrc={question.image} theme={theme} />;
                case 'ShortAnswer': return <ShortAnswerRenderer key={question._id} question={question} onAnswerChange={handleAnswerChange} theme={theme} />;
                case 'LongAnswer': return <LongAnswerRenderer key={question._id} question={question} onAnswerChange={handleAnswerChange} theme={theme} />;
                case 'Email': return <EmailRenderer key={question._id} question={question} onAnswerChange={handleAnswerChange} theme={theme} />;
                case 'MultipleChoice': return <MultipleChoiceRenderer key={question._id} question={question} onAnswerChange={handleAnswerChange} theme={theme} />;
                case 'Checkbox': return <CheckboxRenderer key={question._id} question={question} onAnswerChange={handleAnswerChange} theme={theme} />;
                case 'Dropdown': return <DropdownRenderer key={question._id} question={question} onAnswerChange={handleAnswerChange} theme={theme} />;
                case 'Switch': return <SwitchRenderer key={question._id} question={question} onAnswerChange={handleAnswerChange} theme={theme} />;
                case 'PictureChoice': return <PictureChoiceRenderer key={question._id} question={question} onAnswerChange={handleAnswerChange} theme={theme} />;
                case 'Comprehension': return <ComprehensionRenderer key={question._id} question={question} onAnswerChange={handleAnswerChange} theme={theme} />;
                case 'Categorize': return <CategorizeRenderer key={question._id} question={question} onAnswerChange={handleAnswerChange} theme={theme} />;
                case 'Cloze': return <ClozeRenderer key={question._id} question={question} onAnswerChange={handleAnswerChange} theme={theme} />;
                default: return null;
                }
            })}
        </div>

        {questionsToAnswer.length > 0 && (
          <div className="mt-12 text-center">
            <button onClick={handleSubmit} className={theme.button} disabled={loading}>
              {loading ? 'Submitting...' : 'Submit Form'}
            </button>
          </div>
        )}
      </div>
    </div>
  );
};

export default FormRenderer;