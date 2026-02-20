import { Canvas } from '@react-three/fiber';
import { motion } from 'framer-motion';
import FloatingForm from '../components/canvas/FloatingForm';
import { GlassButton } from '../components/ui/GlassButton';
import { useNavigate } from 'react-router-dom';

export default function HomePage() {
  const navigate = useNavigate();

  return (
    <div className="relative min-h-screen w-full flex flex-col items-center justify-center px-6 overflow-hidden">
      
      {/* 3D Visual Section */}
      <div className="absolute inset-0 z-0 h-full w-full">
        <Canvas>
          <FloatingForm />
        </Canvas>
      </div>

      {/* Content Section */}
      <div className="relative z-10 text-center max-w-4xl">
        <motion.h1 
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="text-6xl md:text-8xl font-extrabold tracking-tighter bg-clip-text text-transparent bg-gradient-to-b from-white to-white/40 mb-6"
        >
          Formify <span className="text-indigo-500">Pro</span>
        </motion.h1>

        <motion.p 
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.1 }}
          className="text-lg md:text-xl text-white/60 mb-10 max-w-2xl mx-auto leading-relaxed"
        >
          Experience the next generation of interactive assessments. 
          Powered by AI, secured by biometrics, and delivered in stunning 3D.
        </motion.p>

        <motion.div 
          initial={{ opacity: 0, scale: 0.9 }}
          animate={{ opacity: 1, scale: 1 }}
          transition={{ delay: 0.2 }}
          className="flex flex-wrap items-center justify-center gap-4"
        >
          <GlassButton 
            onClick={() => navigate('/dashboard')}
            className="bg-indigo-600/20 text-white border-indigo-500/50 hover:bg-indigo-600/40"
          >
            Get Started Free
          </GlassButton>
          
          <GlassButton 
            onClick={() => navigate('/editor/new')}
            className="bg-white/5 text-white/80"
          >
            Create a Form
          </GlassButton>
        </motion.div>
      </div>

      {/* Modern Badge */}
      <motion.div 
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ delay: 0.5 }}
        className="absolute bottom-10 px-4 py-1 rounded-full border border-white/10 bg-white/5 backdrop-blur-md text-xs font-mono text-white/40 uppercase tracking-widest"
      >
        Built for Major Production Grade Deployment
      </motion.div>
    </div>
  );
}