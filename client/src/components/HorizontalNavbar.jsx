// src/components/HorizontalNavbar.jsx
import { UserButton } from "@clerk/clerk-react";
import { motion } from "framer-motion";

// Accept props for title and click handler
const HorizontalNavbar = ({ 
  sidebarWidthClass = "md:left-64", 
  title, 
  onTitleClick 
}) => {
  return (
    <motion.header 
      initial={{ y: -80, opacity: 0 }}
      animate={{ y: 0, opacity: 1 }}
      transition={{ duration: 0.5 }}
      // Use prop for sidebar width and change to justify-between
      className={`fixed top-0 left-0 ${sidebarWidthClass} right-0 h-20 bg-sky-100 backdrop-blur-sm border-b border-sky-300/70 z-30 flex items-center justify-between px-8`}
    >
      {/* --- Form Title (Clickable) --- */}
      <div className="flex items-center gap-4">
        {title && (
          // This button now contains both the title and the edit icon
          <button 
            onClick={onTitleClick} 
            className="flex items-center gap-2 text-xl font-bold text-gray-900 hover:bg-sky-200 p-2 -ml-2 rounded-md transition-colors duration-200"
            title="Edit form name"
          >
            <span>{title}</span>
            <span className="text-lg" aria-label="Edit title">✏️</span>
          </button>
        )}
      </div>
      
      {/* --- User Button (Right side) --- */}
      <div className="flex items-center gap-4">
        <UserButton afterSignOutUrl="/" />
      </div>
    </motion.header>
  );
};

export default HorizontalNavbar;