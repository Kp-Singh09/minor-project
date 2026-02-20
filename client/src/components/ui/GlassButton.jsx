import { motion } from 'framer-motion';

export const GlassButton = ({ children, onClick, className = "" }) => (
  <motion.button
    whileHover={{ scale: 1.05, backgroundColor: "rgba(255, 255, 255, 0.1)" }}
    whileTap={{ scale: 0.95 }}
    onClick={onClick}
    className={`glass-card px-6 py-2 font-medium transition-colors border-white/20 ${className}`}
  >
    {children}
  </motion.button>
);