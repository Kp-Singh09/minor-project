// client/src/components/FormCreator/EditorSidebar.jsx
import React from 'react';
import { motion } from 'framer-motion';
import { Link } from 'react-router-dom'; 

const fieldCategories = [
    {
        name: "Frequently used",
        fields: [
            { icon: "📝", name: "Short answer", type: 'ShortAnswer' },
            { icon: "✅", name: "Multiple choice", type: 'MultipleChoice' },
            { icon: "✉️", name: "Email input", type: 'Email' },
        ]
    },
    {
        name: "Display text",
        fields: [
            { icon: "H1", name: "Heading", type: 'Heading' },
            { icon: "¶", name: "Paragraph", type: 'Paragraph' },
            { icon: "📢", name: "Banner", type: 'Banner' },
        ]
    },
    {
        name: "Choices",
        fields: [
            { icon: "🔽", name: "Dropdown", type: 'Dropdown' },
            { icon: "🖼️", name: "Picture choice", type: 'PictureChoice' },
            { icon: "🔠", name: "Multiselect", type: 'Multiselect' },
            { icon: "🎚️", name: "Switch", type: 'Switch' },
            { icon: "☑️", name: "Checkbox", type: 'Checkbox' },
        ]
    },
    {
        name: "Question Types",
        fields: [
            // --- ADDED TYPES ---
            { icon: "📚", name: "Comprehension", type: 'Comprehension' },
            { icon: "✍️", name: "Cloze", type: 'Cloze' },
            { icon: "🗂️", name: "Categorize", type: 'Categorize' },
        ]
    },
];

// --- UPDATED FieldItem ---
const FieldItem = ({ icon, name, type, onClick }) => (
    <motion.div
        whileHover={{ scale: 1.05, boxShadow: "0 4px 6px -1px rgba(0, 0, 0, 0.1)" }}
        whileTap={{ scale: 0.95 }}
        className="flex flex-col items-center justify-center p-3 bg-white rounded-lg shadow-sm cursor-grab active:cursor-grabbing text-gray-800 hover:bg-sky-300/50 transition-colors"
        onClick={() => onClick(type)} // Call the passed onClick function
    >
        <span className="text-xl mb-1">{icon}</span>
        <span className="text-xs text-center font-medium">{name}</span>
    </motion.div>
);

// --- UPDATED Sidebar ---
// Receives setActiveBuilder as a prop
const EditorSidebar = ({ setActiveBuilder }) => {
    
    // Handle clicks from FieldItem
    const handleFieldClick = (type) => {
        // Here you can differentiate between simple fields and builders
        switch(type) {
            case 'Comprehension':
            case 'Cloze':
            case 'Categorize':
                setActiveBuilder(type); // This opens the builder
                break;
            default:
                // For "Short answer", etc.
                console.log("Adding field:", type);
                // Later, this will add the field directly to the form
        }
    };

    return (
        <aside className="fixed top-0 left-0 w-80 h-full bg-sky-100 z-40 flex flex-col border-r border-sky-300/70">
            
            <div className="h-20 flex items-center px-6 border-b border-sky-300/70 flex-shrink-0">
                <Link to="/" className="text-3xl font-bold text-slate-800 drop-shadow-md">
                Form<span className="text-blue-600">ify</span>
                </Link>
            </div> 
            
            <div className="p-4 overflow-y-auto">
                <div className="mb-6">
                    <input 
                        type="text" 
                        placeholder="Search fields" 
                        className="w-full p-2 pl-4 rounded-full bg-white border border-gray-300 focus:outline-none focus:ring-2 focus:ring-blue-400"
                    />
                </div>

                {fieldCategories.map((category, index) => (
                    <div key={index} className="mb-6">
                        <h3 className="text-md font-semibold text-sky-800 mb-3 border-b pb-2 border-sky-300/70">{category.name}</h3>
                        <div className="grid grid-cols-3 gap-3">
                            {category.fields.map((field) => (
                                <FieldItem 
                                    key={field.name} 
                                    icon={field.icon} 
                                    name={field.name} 
                                    type={field.type}
                                    onClick={handleFieldClick} // Pass the click handler
                                />
                            ))}
                        </div>
                    </div>
                ))}
            </div>
        </aside>
    );
};

export default EditorSidebar;