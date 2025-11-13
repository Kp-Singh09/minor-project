// client/src/components/FormCreator/EditorSidebar.jsx
import React, { useState } from 'react';
import { motion } from 'framer-motion';
import { Link } from 'react-router-dom'; 

const fieldCategories = [
    {
        name: "Frequently used",
        fields: [
            { icon: "📝", name: "Short answer", type: 'ShortAnswer' },
            { icon: "📄", name: "Long answer", type: 'LongAnswer' }, // <-- ADD THIS LINE
            { icon: "✅", name: "Multiple choice", type: 'MultipleChoice' },
            { icon: "✉️", name: "Email input", type: 'Email' },
        ]
    },
    // ... (rest of the categories are unchanged)
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
            { icon: "🎚️", name: "Switch", type: 'Switch' },
            { icon: "☑️", name: "Checkbox", type: 'Checkbox' },
        ]
    },
    {
        name: "Question Types",
        fields: [
            { icon: "📚", name: "Comprehension", type: 'Comprehension' },
            { icon: "✍️", name: "Cloze", type: 'Cloze' },
            { icon: "🗂️", name: "Categorize", type: 'Categorize' },
        ]
    },
];

// ... (FieldItem component is unchanged)
const FieldItem = ({ icon, name, type, onClick }) => (
    <motion.div
        whileHover={{ scale: 1.05, boxShadow: "0 4px 6px -1px rgba(0, 0, 0, 0.1)" }}
        whileTap={{ scale: 0.95 }}
        className="flex flex-col items-center justify-center p-3 bg-white rounded-lg shadow-sm cursor-grab active:cursor-grabbing text-gray-800 hover:bg-sky-300/50 transition-colors"
        onClick={() => onClick(type)} 
    >
        <span className="text-xl mb-1">{icon}</span>
        <span className="text-xs text-center font-medium">{name}</span>
    </motion.div>
);


const EditorSidebar = ({ setActiveBuilder, onAddSimpleField }) => {
    
    const [searchTerm, setSearchTerm] = useState('');

    const handleFieldClick = (type) => {
        switch(type) {
            // Complex types open a builder
            case 'Comprehension':
            case 'Cloze':
            case 'Categorize':
                setActiveBuilder(type); 
                break;
                
            // Simple types are added directly
            case 'Heading':
            case 'Paragraph':
            case 'Banner':
            case 'ShortAnswer':
            case 'LongAnswer': // <-- ADD THIS LINE
            case 'MultipleChoice':
            case 'Email':
            case 'Dropdown':
            case 'PictureChoice':
            case 'Multiselect':
            case 'Switch':
            case 'Checkbox':
                if (onAddSimpleField) {
                    onAddSimpleField(type);
                } else {
                    console.error("onAddSimpleField handler is missing");
                }
                break;
            default:
                console.log("Adding field (unhandled):", type);
        }
    };

    // ... (rest of the component is unchanged)
    const lowerSearchTerm = searchTerm.toLowerCase();
    const filteredFieldCategories = fieldCategories.map(category => {
        const filteredFields = category.fields.filter(field => 
            field.name.toLowerCase().includes(lowerSearchTerm)
        );
        return { ...category, fields: filteredFields };
    }).filter(category => 
        category.fields.length > 0
    );


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
                        value={searchTerm}
                        onChange={(e) => setSearchTerm(e.target.value)}
                    />
                </div>

                {filteredFieldCategories.map((category, index) => (
                    <div key={index} className="mb-6">
                        <h3 className="text-md font-semibold text-sky-800 mb-3 border-b pb-2 border-sky-300/70">{category.name}</h3>
                        <div className="grid grid-cols-3 gap-3">
                            {category.fields.map((field) => (
                                <FieldItem 
                                    key={field.name} 
                                    icon={field.icon} 
                                    name={field.name} 
                                    type={field.type}
                                    onClick={handleFieldClick} 
                                />
                            ))}
                        </div>
                    </div>
                ))}

                {filteredFieldCategories.length === 0 && searchTerm && (
                    <div className="text-center text-gray-500 mt-6">
                        <p>No fields found for "{searchTerm}"</p>
                    </div>
                )}
            </div>
        </aside>
    );
};

export default EditorSidebar;