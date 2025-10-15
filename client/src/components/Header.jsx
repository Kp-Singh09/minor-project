// src/components/Header.jsx
import { SignedIn, SignedOut, UserButton } from "@clerk/clerk-react";
import { Link } from "react-router-dom";
import { motion } from 'framer-motion';
import { useState, useEffect } from "react";

const Header = () => {
  const [scrolled, setScrolled] = useState(false);

  useEffect(() => {
    const handleScroll = () => {
      setScrolled(window.scrollY > 10);
    };
    window.addEventListener("scroll", handleScroll);
    return () => window.removeEventListener("scroll", handleScroll);
  }, []);

  return (
    <motion.header 
      initial={{ y: -100 }}
      animate={{ y: 0 }}
      transition={{ duration: 0.5 }}
      // Updated classes for light theme
      className={`fixed top-0 left-0 w-full z-50 transition-colors duration-300 ${scrolled ? 'bg-[#f8f7f4]/80 backdrop-blur-sm border-b border-gray-200' : 'bg-transparent'}`}
    >
      <div className="max-w-7xl mx-auto flex justify-between items-center px-6 py-4">
        {/* Updated text color to be dark */}
        <Link to="/" className="text-3xl font-bold text-gray-800 drop-shadow-md">
          Structa<span className="text-blue-600">Quiz</span>
        </Link>
        <div className="flex items-center gap-6">
          <SignedIn>
            {/* Updated text color to be dark */}
            <Link to="/dashboard" className="text-sm font-medium text-gray-600 hover:text-gray-900 transition-colors">
              Dashboard
            </Link>
          </SignedIn>
          <SignedOut>
            {/* The glow-btn already looks great */}
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