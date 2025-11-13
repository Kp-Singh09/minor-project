// src/components/Header.jsx
import { SignedIn, SignedOut, UserButton } from "@clerk/clerk-react";
import { Link } from "react-router-dom";
import { motion } from 'framer-motion';
// We no longer need useState or useEffect

const Header = ({ themeMode = 'light' }) => {
  // Determine logo color based on the themeMode prop
  const logoColor = themeMode === 'dark' ? 'text-white' : 'text-gray-800';

  return (
    <motion.header 
      initial={{ y: -100 }}
      animate={{ y: 0 }}
      transition={{ duration: 0.5 }}
      // REMOVED: All 'fixed', 'top-0', 'left-0', 'z-50', and scroll-related classes
      // ADDED: Padding and a bottom border for separation
      className="w-full z-40 bg-transparent"
    >
      <div className="max-w-7xl mx-auto flex justify-between items-center px-6 py-4">
        {/* UPDATED: className now uses the dynamic logoColor */}
        <Link to="/" className={`text-3xl font-bold ${logoColor} drop-shadow-md`}>
          Form<span className="text-blue-600">ify</span>
        </Link>
        <div className="flex items-center gap-6">
          <SignedIn>
            {/* UPDATED: Text color is now dynamic */}
            <Link 
              to="/dashboard" 
              className={`text-sm font-medium ${themeMode === 'dark' ? 'text-gray-300 hover:text-white' : 'text-gray-600 hover:text-gray-900'} transition-colors`}
            >
              Dashboard
            </Link>
          </SignedIn>
          <SignedOut>
            <Link to="/sign-in" className="glow-btn px-5 py-2 text-sm">
              Sign In
            </Link>
          </SignedOut>
          <SignedIn>
            <UserButton afterSignOutUrl="/" />
          </SignedIn>
        </div>
      </div>
    </motion.header>
  );
};

export default Header;