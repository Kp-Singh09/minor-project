// client/src/components/FormCreator/FormEditorUI.jsx
import React, { useState, useEffect } from 'react'; // Added useState and useEffect
import { motion } from 'framer-motion';
// --- Import both hooks ---
import { useSearchParams, useParams } from 'react-router-dom';

// Mock theme lookup
const themes = {
    'Default': { preview: 'bg-gradient-to-br from-blue-400 to-indigo-600', text: 'text-white' },
    'Charcoal': { preview: 'bg-gray-800', text: 'text-gray-200' },
    'Bold': { preview: 'bg-red-500', text: 'text-white' },
    'Navy Pop': { preview: 'bg-blue-900', text: 'text-yellow-300' },
    'Forest Green': { preview: 'bg-green-700', text: 'text-green-100' },
    'Sunset': { preview: 'bg-gradient-to-br from-orange-400 to-pink-500', text: 'text-white' },
    'Minimal': { preview: 'bg-white', text: 'text-gray-800' }
};

const FormEditorUI = () => {
    // --- Get theme from URL (for new forms) ---
    const [searchParams] = useSearchParams();
    // --- Get formId from URL (for existing forms) ---
    const { formId } = useParams();

    const [formTitle, setFormTitle] = useState("My New Form");
    const [selectedTheme, setSelectedTheme] = useState(themes['Default']);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        if (formId) {
            // This is an EXISTING form.
            // TODO: Fetch form data from /api/forms/:formId
            // For now, we'll just set a placeholder title and default theme
            setFormTitle("My Existing Form"); // Replace with fetched title
            setSelectedTheme(themes['Default']); // Replace with fetched theme
            setLoading(false);
        } else {
            // This is a NEW form.
            const themeName = searchParams.get('theme');
            setSelectedTheme(themes[themeName] || themes['Default']);
            setLoading(false);
        }
    }, [formId, searchParams]);


    if (loading) {
        return (
            <div className="p-8 text-center text-gray-600">
                Loading Editor...
            </div>
        );
    }

    return (
        // This is the canvas area inside the layout
        <motion.div 
            initial={{ opacity: 0 }} 
            animate={{ opacity: 1 }} 
            className="p-8"
        >
            <div 
                className="w-full max-w-2xl min-h-[600px] bg-white rounded-lg shadow-xl border border-gray-300 flex flex-col items-center justify-center p-8 mx-auto"
                style={{ background: selectedTheme.preview }}
            >
                <h3 className={`text-2xl font-bold mb-4 ${selectedTheme.text} text-center`}>
                    {formTitle}
                </h3>
                <p className={`text-center ${selectedTheme.text}`}>
                    Drag and drop questions from the left-hand side.
                </p>
                {/* Placeholder for form fields */}
            </div>
        </motion.div>
    );
};

export default FormEditorUI;