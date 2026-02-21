// client/src/components/Proctoring/GazeMonitor.jsx
import { useEffect, useRef, useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Eye, ShieldAlert, Camera, CameraOff } from 'lucide-react';
import { toast } from 'react-hot-toast';

export default function GazeMonitor({ isActive, onViolation }) {
  const videoRef = useRef(null);
  const [hasPermission, setHasPermission] = useState(false);
  const [isLookingAway, setIsLookingAway] = useState(false);
  const lookAwayTimer = useRef(null);

  useEffect(() => {
    if (isActive) {
      startProctoring();
    } else {
      stopProctoring();
    }
    return () => stopProctoring();
  }, [isActive]);

  const startProctoring = async () => {
    try {
      const stream = await navigator.mediaDevices.getUserMedia({ video: true });
      if (videoRef.current) {
        videoRef.current.srcObject = stream;
        setHasPermission(true);
        // Here we would normally initialize a gaze library
        // For now, we simulate the "Neural Gaze" tracking logic
        monitorWindowFocus();
      }
    } catch (err) {
      toast.error("Proctoring requires camera access.");
      setHasPermission(false);
    }
  };

  const stopProctoring = () => {
    if (videoRef.current?.srcObject) {
      videoRef.current.srcObject.getTracks().forEach(track => track.stop());
    }
    window.onblur = null;
    window.onfocus = null;
  };

  const monitorWindowFocus = () => {
    // Detect if the user switches tabs or minimizes (Easiest form of proctoring)
    window.onblur = () => {
      setIsLookingAway(true);
      toast.error("Neural Link Lost: Tab Switch Detected", { duration: 5000 });
      onViolation("Tab Switch");
    };
    window.onfocus = () => {
      setIsLookingAway(false);
    };
  };

  return (
    <div className="fixed bottom-8 right-8 z-[400]">
      <motion.div 
        initial={{ opacity: 0, scale: 0.8 }}
        animate={{ opacity: 1, scale: 1 }}
        className={`glass-card p-1 overflow-hidden rounded-2xl border-2 transition-colors duration-500 ${isLookingAway ? 'border-red-500 shadow-[0_0_20px_rgba(239,68,68,0.4)]' : 'border-indigo-500/30'}`}
      >
        <div className="relative w-48 h-36 bg-black rounded-xl overflow-hidden">
          {hasPermission ? (
            <video 
              ref={videoRef} 
              autoPlay 
              muted 
              className="w-full h-full object-cover grayscale opacity-60"
            />
          ) : (
            <div className="flex flex-col items-center justify-center h-full text-white/20">
              <CameraOff size={24} />
            </div>
          )}

          {/* Neural HUD Overlay */}
          <div className="absolute inset-0 pointer-events-none flex flex-col justify-between p-3">
            <div className="flex justify-between items-start">
              <div className="px-2 py-0.5 rounded-md bg-black/60 text-[8px] font-mono text-indigo-400 border border-indigo-500/30 uppercase tracking-widest">
                Gaze: {isLookingAway ? 'Out-of-Bounds' : 'Centered'}
              </div>
              <Eye size={12} className={isLookingAway ? 'text-red-500' : 'text-indigo-500'} />
            </div>
            
            <div className="flex justify-between items-end">
              <div className="h-1 w-full bg-white/5 rounded-full overflow-hidden">
                <motion.div 
                  animate={{ width: isLookingAway ? '100%' : '20%' }}
                  className={`h-full ${isLookingAway ? 'bg-red-500' : 'bg-indigo-500'}`} 
                />
              </div>
            </div>
          </div>
        </div>
      </motion.div>
    </div>
  );
}