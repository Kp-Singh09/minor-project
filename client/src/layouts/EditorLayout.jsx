// client/src/layouts/EditorLayout.jsx
import React, { useState, useEffect, useCallback } from 'react';
import { Outlet, useOutletContext, useParams, useSearchParams, useNavigate } from 'react-router-dom';
import { useUser } from '@clerk/clerk-react';
import axios from 'axios';

// Import Layout Components
import HorizontalNavbar from '../components/HorizontalNavbar'; 
import EditorSidebar from '../components/FormCreator/EditorSidebar';

// Import Builder Components
import ComprehensionBuilder from '../components/builder/ComprehensionBuilder';
import CategorizeBuilder from '../components/builder/CategorizeBuilder';
import ClozeBuilder from '../components/builder/ClozeBuilder';

// --- UPDATED THEMES OBJECT ---
// Now using CSS values for 'background' property
const themes = {
    'Default': { name: 'Default', background: 'linear-gradient(to bottom right, #60a5fa, #3b82f6)', text: 'text-white' },
    'Charcoal': { name: 'Charcoal', background: '#1f2937', text: 'text-gray-200' },
    'Bold': { name: 'Bold', background: '#ef4444', text: 'text-white' },
    'Navy Pop': { name: 'Navy Pop', background: '#1e3a8a', text: 'text-yellow-300' },
    'Forest Green': { name: 'Forest Green', background: '#15803d', text: 'text-green-100' },
    'Sunset': { name: 'Sunset', background: 'linear-gradient(to bottom right, #fb923c, #ec4899)', text: 'text-white' },
    'Minimal': { name: 'Minimal', background: '#ffffff', text: 'text-gray-800' }
};

const EditorLayout = () => {
  const { formId } = useParams(); // ID for existing forms
  const [searchParams] = useSearchParams(); // Theme for new forms
  const navigate = useNavigate();
  const { user } = useUser();

  const [form, setForm] = useState(null);
  const [loading, setLoading] = useState(true);
  const [activeBuilder, setActiveBuilder] = useState(null);
  const [editingQuestion, setEditingQuestion] = useState(null);

  const isNewForm = !formId;

  // --- Form Loading Logic ---
  useEffect(() => {
    const fetchForm = async (id) => {
      try {
        const response = await axios.get(`${import.meta.env.VITE_API_BASE_URL}/api/forms/${id}`);
        setForm(response.data);
      } catch (err) {
        console.error("Failed to fetch form", err);
        navigate("/dashboard"); // Redirect if form not found
      } finally {
        setLoading(false);
      }
    };

    if (isNewForm) {
      const themeName = searchParams.get('theme') || 'Default';
      setForm({
        title: 'Untitled Form',
        questions: [],
        theme: themeName, // Store the theme NAME
      });
      setLoading(false);
    } else {
      fetchForm(formId);
    }
  }, [formId, isNewForm, searchParams, navigate]);

  // --- Refetch form data (used after saving/deleting) ---
  const refetchForm = useCallback(async (idToFetch) => {
    if (idToFetch) {
      try {
        const response = await axios.get(`${import.meta.env.VITE_API_BASE_URL}/api/forms/${idToFetch}`);
        setForm(response.data);
      } catch (err) {
        console.error("Failed to refetch form", err);
      }
    }
  }, []);

  // --- Save Question Logic (from old FormEditor.jsx) ---
  const handleSaveQuestion = async (questionData) => {
    if (!user) return alert("You must be logged in.");

    let currentFormId = formId;

    try {
      // 1. If it's a new form, create the form first
      if (isNewForm) {
        const formResponse = await axios.post(`${import.meta.env.VITE_API_BASE_URL}/api/forms`, {
          title: form.title,
          userId: user.id,
          username: user.fullName || user.username,
          // You can save the theme here too if your Form model supports it
        });
        currentFormId = formResponse.data._id;
        // Navigate to the new editor URL so it's no longer a "new" form
        navigate(`/editor/${currentFormId}`, { replace: true });
      }

      // 2. Save the question (either new or update)
      if (editingQuestion) {
        await axios.put(`${import.meta.env.VITE_API_BASE_URL}/api/forms/questions/${editingQuestion._id}`, questionData);
      } else {
        await axios.post(`${import.meta.env.VITE_API_BASE_URL}/api/forms/${currentFormId}/questions`, questionData);
      }

      // 3. Reset UI and refetch form
      setActiveBuilder(null);
      setEditingQuestion(null);
      await refetchForm(currentFormId);

    } catch (err) {
      alert("Error: Could not save the question.");
      console.error(err);
    }
  };

  // --- Delete Question Logic ---
  const handleDeleteQuestion = async (questionId) => {
    if (!formId) return; // Can't delete from an unsaved form
    if (window.confirm('Are you sure you want to delete this question?')) {
      try {
        await axios.delete(`${import.meta.env.VITE_API_BASE_URL}/api/forms/${formId}/questions/${questionId}`);
        await refetchForm(formId);
      } catch (err) {
        alert('Failed to delete the question.');
        console.error(err);
      }
    }
  };

  // --- Function to render the correct builder ---
  const renderBuilder = () => {
    const builderProps = {
      onSave: handleSaveQuestion,
      onCancel: () => {
        setActiveBuilder(null);
        setEditingQuestion(null);
      },
      initialData: editingQuestion,
    };

    const builderType = editingQuestion ? editingQuestion.type : activeBuilder;

    switch (builderType) {
      case 'Comprehension':
        return <ComprehensionBuilder {...builderProps} />;
      case 'Categorize':
        return <CategorizeBuilder {...builderProps} />;
      case 'Cloze':
        return <ClozeBuilder {...builderProps} />;
      default:
        return null;
    }
  };

  // --- Context to pass to FormEditorUI ---
  const outletContext = {
    form,
    loading,
    themes, // Pass the CSS themes object
    activeBuilder,
    editingQuestion,
    renderBuilder, // Pass the render function
    setEditingQuestion, // Pass setters
    handleDeleteQuestion, // Pass actions
  };

  return (
    <div className="min-h-screen bg-sky-50 text-gray-800">
      <HorizontalNavbar sidebarWidthClass="md:left-80" />

      {/* Pass the state setter down to the sidebar */}
      <EditorSidebar setActiveBuilder={setActiveBuilder} /> 
      
      <main className="ml-0 md:ml-80 flex flex-col h-screen">
        <div className="h-20 flex-shrink-0" />
        <div className="flex-grow overflow-y-auto">
          {/* Pass all logic to the Outlet (which renders FormEditorUI) */}
          <Outlet context={outletContext} />
        </div>
      </main>
    </div>
  );
};

export default EditorLayout;