// src/pages/HomePage.jsx
import { motion } from "framer-motion";
import { useState } from "react";
import { Link } from "react-router-dom";
import { AnimatePresence } from "framer-motion";
import { useUser } from "@clerk/clerk-react"; 


const features = [
  {
    icon: "📝",
    title: "Dynamic Form Builder",
    description: "Create custom quizzes with three unique and engaging question types."
  },
  {
    icon: "📊",
    title: "Instant Analytics",
    description: "Review submission scores and detailed answer breakdowns for each user."
  },
  {
    icon: "🖼️",
    title: "Image Uploads",
    description: "Enhance your quizzes by adding a header image or visuals to each question."
  },
  {
    icon: "🏆",
    title: "Leaderboard & Stats",
    description: "Track your performance and see how you rank against other quiz creators."
  },
  {
    icon: "🔒",
    title: "Secure & Private",
    description: "Your forms and responses are secure, requiring user authentication to submit."
  },
  {
    icon: "🚀",
    title: "Fast & Responsive",
    description: "A smooth and intuitive experience for both creators and quiz-takers."
  },
];

const faqData = [
    { question: "What is StructaQuiz?", answer: "StructaQuiz is a modern platform for building interactive and engaging quizzes with unique question types like Categorize, Cloze, and Comprehension." },
    { question: "How do I create a form?", answer: "After signing in, navigate to your dashboard and click the 'Create New Form' button to start building." },
    { question: "Can I add images to my questions?", answer: "Yes, you can upload a header image for the entire form and individual images for each question to make them more visual." },
    { question: "How do I view responses?", answer: "From your dashboard, you can click on 'Responses' in the sidebar to see a list of your forms and view the submissions for each." },
];

export default function HomePage() {
  const [openIndex, setOpenIndex] = useState(null);
  const { isSignedIn } = useUser();
  const toggleFAQ = (idx) => setOpenIndex(openIndex === idx ? null : idx);

  return (
    <>
      {/* Background Gradient Orbs */}
      <div className="fixed inset-0 -z-10">
        <motion.div initial={{ opacity: 0, scale: 0.8 }} animate={{ opacity: 0.3, scale: 1 }} transition={{ duration: 2 }} className="absolute left-[-10vw] top-[-10vh] w-[40vw] h-[40vw] bg-blue-500/30 rounded-full blur-3xl" />
        <motion.div initial={{ opacity: 0, scale: 0.8 }} animate={{ opacity: 0.2, scale: 1 }} transition={{ duration: 2, delay: 0.5 }} className="absolute right-[-10vw] top-[20vh] w-[30vw] h-[30vw] bg-purple-500/20 rounded-full blur-2xl" />
      </div>

      <motion.main
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ duration: 0.8 }}
        className="min-h-screen pt-28 bg-[#f8f7f4] text-gray-800 relative bg-[length:80px_80px] bg-[linear-gradient(transparent_78px,rgba(59,130,246,0.3)_80px),linear-gradient(90deg,transparent_78px,rgba(59,130,246,0.3)_80px)]"
      >

        {/* HERO SECTION */}
        <section className="text-center pt-16 md:pt-24 px-4">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6 }}
            className="max-w-4xl mx-auto"
          >
            <h1 className="text-4xl md:text-6xl font-bold leading-tight text-gray-900 drop-shadow-xl">
              Build Interactive Quizzes That <span className="text-blue-600">Engage</span> and <span className="text-purple-600">Impress</span>
            </h1>
            <p className="mt-6 text-base md:text-lg text-gray-600 max-w-2xl mx-auto">
              Go beyond simple multiple-choice. With StructaQuiz, you can create dynamic assessments with unique question formats that challenge users and provide deeper insights.
            </p>
            <Link to={isSignedIn ? "/dashboard" : "/sign-in"}>
                <motion.button
                  whileHover={{ scale: 1.05, boxShadow: "0 0 24px #60a5fa" }}
                  whileTap={{ scale: 0.98 }}
                  className="glow-btn text-base mx-auto mt-10"
                >
                  Get Started for Free
                </motion.button>
            </Link>
          </motion.div>
        </section>

        {/* FEATURES SECTION */}
        <section className="max-w-6xl mx-auto mt-24 md:mt-32 px-4 sm:px-6">
            <h2 className="text-3xl font-bold mb-12 text-center text-gray-800">Everything You Need to Build Better Quizzes</h2>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
                {features.map((feature, index) => (
                    <motion.div
                    key={index}
                    initial={{ opacity: 0, y: 30 }}
                    whileInView={{ opacity: 1, y: 0 }}
                    transition={{ delay: index * 0.1, duration: 0.5 }}
                    viewport={{ once: true }}
                    // Add shadow-md for more depth
                    className="bg-white p-6 rounded-2xl border border-gray-200 shadow-md"
                >
                    <div className="flex items-center justify-center w-12 h-12 rounded-full bg-blue-100 shadow-lg text-3xl mb-4">{feature.icon}</div>
                    <h3 className="text-lg font-semibold text-gray-900 mb-2">{feature.title}</h3>
                    <p className="text-gray-600 text-sm">{feature.description}</p>
                </motion.div>
                ))}
            </div>
        </section>

        {/* FAQ SECTION */}
        <section className="max-w-3xl mx-auto mt-24 md:mt-32 mb-20 px-4 sm:px-6">
          <h2 className="text-3xl font-bold mb-8 text-center text-blue-600">Frequently Asked Questions</h2>
          <div className="space-y-4">
            {faqData.map((item, idx) => (
              <div key={idx}>
                <button
                  onClick={() => toggleFAQ(idx)}
                  className={`w-full bg-white text-left px-5 py-4 rounded-lg border border-blue-200/40 text-lg font-semibold focus:outline-none flex justify-between items-center transition-all duration-300 shadow-sm ${openIndex === idx ? 'ring-2 ring-blue-400' : 'hover:bg-gray-50'}`}
                >
                  <span className="text-gray-900">{item.question}</span><span className={`ml-4 text-blue-600 transition-transform duration-300 ${openIndex === idx ? 'rotate-180' : ''}`}>▼</span>
                </button>
                <AnimatePresence>
                {openIndex === idx && (
                  <motion.div
                    initial={{ opacity: 0, height: 0, marginTop: 0 }}
                    animate={{ opacity: 1, height: 'auto', marginTop: '0.5rem' }}
                    exit={{ opacity: 0, height: 0, marginTop: 0 }}
                    className="overflow-hidden"
                  >
                    <div className="px-5 py-3 bg-gray-50 text-gray-700 border-l-4 border-blue-400/60 rounded-b-lg">
                      {item.answer}
                    </div>
                  </motion.div>
                )}
                </AnimatePresence>
              </div>
            ))}
          </div>
        </section>

        {/* FOOTER */}
        <footer className="text-center text-gray-500 py-6 mt-20 ">
          <p className="mb-2">
              Made by{' '}
              <a 
                href="https://portfolio-kp-singh.vercel.app/" 
                target="_blank" 
                rel="noopener noreferrer" 
                className="font-semibold underline text-blue-600 hover:underline transition-colors"
              >
                Karanpreet Singh
              </a>
            </p>
          <div className="flex justify-center space-x-4">
            {/* GitHub Link */}
            <a 
              href="https://github.com/Kp-Singh09" 
              target="_blank" 
              rel="noopener noreferrer" 
              className="text-gray-500 hover:text-gray-800 transition-colors"
              aria-label="GitHub Profile"
            >
              <svg className="h-6 w-6" fill="currentColor" viewBox="0 0 24 24" aria-hidden="true">
                <path fillRule="evenodd" d="M12 2C6.477 2 2 6.477 2 12c0 4.418 2.865 8.165 6.839 9.49.5.092.682-.217.682-.482 0-.237-.009-.868-.014-1.703-2.782.605-3.369-1.343-3.369-1.343-.454-1.158-1.11-1.466-1.11-1.466-.908-.62.069-.608.069-.608 1.003.07 1.531 1.032 1.531 1.032.892 1.53 2.341 1.088 2.91.832.092-.647.35-1.088.636-1.338-2.22-.253-4.555-1.113-4.555-4.951 0-1.093.39-1.988 1.031-2.688-.103-.253-.446-1.272.098-2.65 0 0 .84-.27 2.75 1.026A9.564 9.564 0 0112 6.844c.85.004 1.705.115 2.504.337 1.909-1.296 2.747-1.027 2.747-1.027.546 1.379.203 2.398.1 2.651.64.7 1.03 1.595 1.03 2.688 0 3.848-2.338 4.695-4.566 4.943.359.309.678.92.678 1.855 0 1.338-.012 2.419-.012 2.747 0 .268.18.58.688.482A10.001 10.001 0 0022 12c0-5.523-4.477-10-10-10z" clipRule="evenodd"/>
              </svg>
            </a>
            {/* LinkedIn Link */}
            <a 
              href="https://www.linkedin.com/in/kp-singh-/" 
              target="_blank" 
              rel="noopener noreferrer" 
              className="text-gray-500 hover:text-gray-800 transition-colors"
              aria-label="LinkedIn Profile"
            >
              <svg className="h-6 w-6" fill="currentColor" viewBox="0 0 24 24" aria-hidden="true">
                <path d="M19 0h-14c-2.761 0-5 2.239-5 5v14c0 2.761 2.239 5 5 5h14c2.762 0 5-2.239 5-5v-14c0-2.761-2.238-5-5-5zm-11 19h-3v-11h3v11zm-1.5-12.268c-.966 0-1.75-.79-1.75-1.764s.784-1.764 1.75-1.764 1.75.79 1.75 1.764-.783 1.764-1.75 1.764zm13.5 12.268h-3v-5.604c0-3.368-4-3.113-4 0v5.604h-3v-11h3v1.765c1.396-2.586 7-2.777 7 2.476v6.759z"/>
              </svg>
            </a>
          </div>
        </footer>
      </motion.main>
    </>
  );
}