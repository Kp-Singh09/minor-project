// client/src/components/FormCreator/EditorSidebar.jsx
import React from 'react';
import { motion } from 'framer-motion';
import { Link } from 'react-router-dom'; 

const fieldCategories = [
    {
        name: "Frequently used",
        fields: [
            { icon: "📝", name: "Short answer" },
            { icon: "✅", name: "Multiple choice" },
            { icon: "✉️", name: "Email input" },
        ]
    },
    {
        name: "Display text",
        fields: [
            { icon: "H1", name: "Heading" },
            { icon: "¶", name: "Paragraph" },
            { icon: "📢", name: "Banner" },
        ]
    },
    {
        name: "Choices",
        fields: [
            { icon: "🔽", name: "Dropdown" },
            { icon: "🖼️", name: "Picture choice" },
            { icon: "🔠", name: "Multiselect" },
            { icon: "🎚️", name: "Switch" },
            { icon: "☑️", name: "Checkbox" },
        ]
    },
];

const FieldItem = ({ icon, name }) => (
    <motion.div
        whileHover={{ scale: 1.05, boxShadow: "0 4px 6px -1px rgba(0, 0, 0, 0.1)" }}
        whileTap={{ scale: 0.95 }}
        className="flex flex-col items-center justify-center p-3 bg-white rounded-lg shadow-sm cursor-grab active:cursor-grabbing hover:bg-gray-50 transition-colors"
    >
        <span className="text-xl mb-1">{icon}</span>
        <span className="text-xs text-gray-700 text-center">{name}</span>
    </motion.div>
);

const EditorSidebar = () => {
    return (
        <aside className="fixed top-0 left-0 w-80 h-full bg-sky-100 z-40 flex flex-col border-r border-sky-300/70">
            
            {/* Logo header */}
            <div className="h-20 flex items-center px-6 border-b border-sky-300/70 flex-shrink-0">
                <Link to="/" className="text-3xl font-bold text-slate-800 drop-shadow-md">
                Form<span className="text-blue-600">ify</span>
                </Link>
            </div> 
            
            <div className="p-4 overflow-y-auto">
                {/* Search Field */}
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
                            {category.fields.map((field, fIndex) => (
                                <FieldItem key={fIndex} icon={field.icon} name={field.name} />
                            ))}
                        </div>
                    </div>
                ))}
            </div>
        </aside>
    );
};

export default EditorSidebar;