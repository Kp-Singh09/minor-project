// src/components/HorizontalNavbar.jsx
import { UserButton } from "@clerk/clerk-react";
import { motion } from "framer-motion";

// Accept a prop for the sidebar width, default to the original 'md:left-64'
const HorizontalNavbar = ({ sidebarWidthClass = "md:left-64" }) => {
  return (
    <motion.header 
      initial={{ y: -80, opacity: 0 }}
      animate={{ y: 0, opacity: 1 }}
      transition={{ duration: 0.5 }}
      // Use the sidebarWidthClass prop here
      className={`fixed top-0 left-0 ${sidebarWidthClass} right-0 h-20 bg-sky-100 backdrop-blur-sm border-b border-sky-300/70 z-30 flex items-center justify-end px-8`}
    >
      <div className="flex items-center gap-4">
        <UserButton afterSignOutUrl="/" />
      </div>
    </motion.header>
  );
};

export default HorizontalNavbar;