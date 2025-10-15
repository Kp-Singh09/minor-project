// src/pages/SignUpPage.jsx
import { SignUp } from "@clerk/clerk-react";
import { motion } from "framer-motion";

const SignUpPage = () => {
  return (
    // Updated background color
    <div className="min-h-screen flex items-center justify-center bg-gray-50 p-4">
      <motion.div
        initial={{ opacity: 0, scale: 0.9 }}
        animate={{ opacity: 1, scale: 1 }}
        transition={{ duration: 0.5 }}
      >
        <SignUp 
          afterSignUpUrl="/dashboard"
          // Updated card styles for a light theme
          appearance={{
            elements: {
              rootBox: "shadow-xl",
              card: "bg-white",
            }
          }}
        />
      </motion.div>
    </div>
  );
};

export default SignUpPage;