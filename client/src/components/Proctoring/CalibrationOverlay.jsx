// client/src/components/Proctoring/CalibrationOverlay.jsx
import { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Target, Scan, CheckCircle } from 'lucide-react';

const CALIBRATION_POINTS = [
  { id: 1, pos: 'top-10 left-10' }, { id: 2, pos: 'top-10 left-1/2 -translate-x-1/2' }, { id: 3, pos: 'top-10 right-10' },
  { id: 4, pos: 'top-1/2 left-10 -translate-y-1/2' }, { id: 5, pos: 'top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2' }, { id: 6, pos: 'top-1/2 right-10 -translate-y-1/2' },
  { id: 7, pos: 'bottom-10 left-10' }, { id: 8, pos: 'bottom-10 left-1/2 -translate-x-1/2' }, { id: 9, pos: 'bottom-10 right-10' }
];

export default function CalibrationOverlay({ onComplete }) {
  const [clickedPoints, setClickedPoints] = useState([]);
  const [step, setStep] = useState('intro'); // intro, calibrating, complete

  const handlePointClick = (id) => {
    if (!clickedPoints.includes(id)) {
      const updated = [...clickedPoints, id];
      setClickedPoints(updated);
      if (updated.length === CALIBRATION_POINTS.length) {
        setStep('complete');
        setTimeout(() => onComplete(), 2000);
      }
    }
  };

  return (
    <div className="fixed inset-0 z-[500] bg-black/90 backdrop-blur-3xl flex items-center justify-center">
      <AnimatePresence mode="wait">
        {step === 'intro' && (
          <motion.div 
            key="intro"
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, scale: 0.9 }}
            className="text-center max-w-md"
          >
            <div className="w-20 h-20 bg-indigo-500/10 rounded-3xl flex items-center justify-center mx-auto mb-8 border border-indigo-500/20">
              <Scan className="text-indigo-400" size={40} />
            </div>
            <h2 className="text-3xl font-bold text-white mb-4">Neural Sync Required</h2>
            <p className="text-white/40 mb-10 text-sm leading-relaxed">
              To ensure assessment integrity, we need to calibrate the eye-tracking system. Please follow and click the 9 targets that appear.
            </p>
            <button 
              onClick={() => setStep('calibrating')}
              className="w-full py-4 rounded-xl bg-indigo-500 text-white font-bold uppercase tracking-widest text-xs hover:bg-indigo-400 transition-all"
            >
              Initialize Calibration
            </button>
          </motion.div>
        )}

        {step === 'calibrating' && (
          <motion.div key="points" className="fixed inset-0">
            {CALIBRATION_POINTS.map((pt) => (
              <motion.button
                key={pt.id}
                initial={{ scale: 0 }}
                animate={{ scale: 1 }}
                onClick={() => handlePointClick(pt.id)}
                className={`absolute ${pt.pos} w-12 h-12 rounded-full border-2 flex items-center justify-center transition-all duration-500 ${
                  clickedPoints.includes(pt.id) ? 'bg-indigo-500 border-indigo-500 text-white' : 'bg-transparent border-white/20 text-white/20 hover:border-white/60'
                }`}
              >
                <Target size={20} className={clickedPoints.includes(pt.id) ? '' : 'animate-pulse'} />
              </motion.button>
            ))}
            <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 text-center pointer-events-none">
              <p className="text-[10px] font-mono uppercase tracking-[0.4em] text-white/20">
                Sync Progress: {clickedPoints.length} / 9
              </p>
            </div>
          </motion.div>
        )}

        {step === 'complete' && (
          <motion.div 
            key="complete"
            initial={{ opacity: 0, scale: 0.5 }}
            animate={{ opacity: 1, scale: 1 }}
            className="text-center"
          >
            <CheckCircle className="text-green-500 mx-auto mb-6" size={64} />
            <h2 className="text-3xl font-bold text-white mb-2">Sync Successful</h2>
            <p className="text-white/40 font-mono text-[10px] uppercase tracking-widest">Neural Link Established</p>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}