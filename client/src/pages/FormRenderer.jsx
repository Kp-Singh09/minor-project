import { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { ChevronRight, ChevronLeft, Send, Loader2 } from 'lucide-react';
import { GlassButton } from '../components/ui/GlassButton';

export default function FormRenderer() {
  const [currentStep, setCurrentStep] = useState(0);
  const [direction, setDirection] = useState(0); // 1 for next, -1 for prev

  // Mock data for UI locking
  const questions = [
    { id: 1, type: 'mcq', question: "What is your primary goal for 2024?" },
    { id: 2, type: 'categorize', question: "Sort these tech stacks by preference." },
    { id: 3, type: 'cloze', question: "Formify is a _____ application built with _____." },
  ];

  const paginate = (newDirection) => {
    setDirection(newDirection);
    setCurrentStep((prev) => prev + newDirection);
  };

  const variants = {
    enter: (direction) => ({
      x: direction > 0 ? 1000 : -1000,
      opacity: 0,
      scale: 0.8,
      rotateY: direction > 0 ? 45 : -45,
    }),
    center: {
      x: 0,
      opacity: 1,
      scale: 1,
      rotateY: 0,
      transition: { duration: 0.6, type: "spring", bounce: 0.3 }
    },
    exit: (direction) => ({
      x: direction < 0 ? 1000 : -1000,
      opacity: 0,
      scale: 0.8,
      rotateY: direction < 0 ? 45 : -45,
      transition: { duration: 0.4 }
    })
  };

  return (
    <div className="relative min-h-screen w-full flex flex-col items-center justify-center p-6">
      {/* Progress Indicator */}
      <div className="fixed top-12 w-full max-w-md px-6 z-50">
        <div className="h-1 w-full bg-white/5 rounded-full overflow-hidden">
          <motion.div 
            className="h-full bg-indigo-500 shadow-[0_0_20px_rgba(99,102,241,0.5)]"
            initial={{ width: 0 }}
            animate={{ width: `${((currentStep + 1) / questions.length) * 100}%` }}
          />
        </div>
        <div className="flex justify-between mt-2 text-[10px] font-mono uppercase tracking-widest text-white/30">
          <span>Question {currentStep + 1}</span>
          <span>{questions.length} Total</span>
        </div>
      </div>

      {/* Animation Container */}
      <div className="relative w-full max-w-3xl h-[500px] flex items-center justify-center">
        <AnimatePresence custom={direction} mode="wait">
          <motion.div
            key={currentStep}
            custom={direction}
            variants={variants}
            initial="enter"
            animate="center"
            exit="exit"
            className="absolute w-full glass-card p-12 border-white/10 shadow-2xl backdrop-blur-2xl"
          >
            <div className="space-y-8">
              <span className="text-indigo-400 font-mono text-sm uppercase tracking-widest">
                {questions[currentStep].type}
              </span>
              <h2 className="text-3xl md:text-4xl font-bold leading-tight">
                {questions[currentStep].question}
              </h2>
              
              <div className="min-h-[150px] py-4">
                {/* Individual Question Renderers (MCQ, Categorize, etc) will go here */}
                <div className="p-4 rounded-xl border border-white/5 bg-white/[0.02] text-white/40 italic">
                  Interactive content placeholder...
                </div>
              </div>
            </div>
          </motion.div>
        </AnimatePresence>
      </div>

      {/* Navigation Controls */}
      <div className="fixed bottom-12 flex items-center gap-6 z-50">
        <button 
          onClick={() => paginate(-1)}
          disabled={currentStep === 0}
          className="p-4 rounded-full glass-card border-white/5 text-white/40 hover:text-white disabled:opacity-0 transition-all"
        >
          <ChevronLeft size={24} />
        </button>

        {currentStep === questions.length - 1 ? (
          <GlassButton className="bg-green-500/20 text-green-400 border-green-500/50 px-8 py-4 flex items-center gap-2">
            Submit Assessment <Send size={18} />
          </GlassButton>
        ) : (
          <GlassButton 
            onClick={() => paginate(1)}
            className="bg-white/10 text-white px-8 py-4 flex items-center gap-2"
          >
            Continue <ChevronRight size={18} />
          </GlassButton>
        )}
      </div>
    </div>
  );
}