// client/src/components/Proctoring/GazeMonitor.jsx
import { useEffect, useRef, useState } from 'react';
import { motion } from 'framer-motion';
import * as faceapi from 'face-api.js';
import { Eye, ShieldAlert, CameraOff, UserX, Users, BrainCircuit } from 'lucide-react';
import { toast } from 'react-hot-toast';

export default function GazeMonitor({ isActive, onViolation }) {
  const videoRef = useRef(null);
  const [modelLoaded, setModelLoaded] = useState(false);
  const [violationType, setViolationType] = useState(null);
  const [debugMsg, setDebugMsg] = useState("Initializing Neural Net...");

  // 1. Load Free/Open-Source Models locally
  useEffect(() => {
    const loadModels = async () => {
      const MODEL_URL = '/models'; // Refers to client/public/models
      try {
        await Promise.all([
          faceapi.nets.tinyFaceDetector.loadFromUri(MODEL_URL),
          faceapi.nets.faceLandmark68Net.loadFromUri(MODEL_URL),
        ]);
        setModelLoaded(true);
        setDebugMsg("Neural Engine Active");
      } catch (err) {
        console.error("AI Model Load Failed:", err);
        setDebugMsg("Model Error: Check /public/models");
      }
    };
    loadModels();
  }, []);

  // 2. Start/Stop Camera
  useEffect(() => {
    if (isActive && modelLoaded) {
      startVideo();
    } else {
      stopVideo();
    }
    return () => stopVideo();
  }, [isActive, modelLoaded]);

  const startVideo = () => {
    navigator.mediaDevices.getUserMedia({ video: {} })
      .then((stream) => {
        if (videoRef.current) {
          videoRef.current.srcObject = stream;
        }
      })
      .catch((err) => toast.error("Camera access denied"));
  };

  const stopVideo = () => {
    if (videoRef.current && videoRef.current.srcObject) {
      videoRef.current.srcObject.getTracks().forEach(track => track.stop());
    }
  };

  // 3. The Main Vision Loop
  const handleVideoOnPlay = () => {
    const interval = setInterval(async () => {
      if (!videoRef.current) return;

      // Detect Faces using the lightweight TinyFaceDetector
      const detections = await faceapi.detectAllFaces(
        videoRef.current, 
        new faceapi.TinyFaceDetectorOptions()
      ).withFaceLandmarks();

      // Rule 1: User Presence
      if (detections.length === 0) {
        triggerViolation("No Face Detected", UserX);
      } 
      // Rule 2: Multiple People (Collaboration)
      else if (detections.length > 1) {
        triggerViolation("Multiple Faces Detected", Users);
      } 
      // Rule 3: Gaze/Head Direction
      else {
        const landmarks = detections[0].landmarks;
        const nose = landmarks.getNose();
        const jaw = landmarks.getJawOutline();
        
        // Calculate Head Yaw (Turning Left/Right)
        const noseX = nose[0].x;
        const leftJawX = jaw[0].x;
        const rightJawX = jaw[16].x;
        const faceWidth = rightJawX - leftJawX;
        
        // Ratio: 0.5 is perfectly center. <0.3 is looking left, >0.7 is looking right.
        const lookRatio = (noseX - leftJawX) / faceWidth;

        if (lookRatio < 0.25 || lookRatio > 0.75) {
          triggerViolation("Looking Away", Eye);
        } else {
          setViolationType(null); // Clear violation if compliant
        }
      }
    }, 1000); // Check every second

    return () => clearInterval(interval);
  };

  const triggerViolation = (type, Icon) => {
    if (violationType !== type) {
      setViolationType(type);
      onViolation(type);
      // Optional: Visual feedback
      toast.custom((t) => (
        <div className="bg-rose-500/90 backdrop-blur text-white px-4 py-3 rounded-xl flex items-center gap-3 shadow-2xl border border-white/20">
          <Icon size={20} />
          <div className="flex flex-col">
            <span className="font-bold text-sm">Proctor Alert</span>
            <span className="text-xs opacity-90">{type}</span>
          </div>
        </div>
      ), { duration: 3000 });
    }
  };

  // 4. Tab Switch Detection (Browser API - Also Free)
  useEffect(() => {
    const handleBlur = () => triggerViolation("Tab Switch Detected", ShieldAlert);
    window.addEventListener("blur", handleBlur);
    return () => window.removeEventListener("blur", handleBlur);
  }, []);

  return (
    <div className="fixed bottom-6 right-6 z-[100]">
      <motion.div 
        initial={{ opacity: 0, scale: 0.8 }}
        animate={{ opacity: 1, scale: 1 }}
        className={`glass-card p-1.5 overflow-hidden rounded-2xl border transition-all duration-500 ${violationType ? 'border-rose-500 shadow-[0_0_30px_rgba(244,63,94,0.4)]' : 'border-indigo-500/30'}`}
      >
        <div className="relative w-44 h-32 bg-slate-950 rounded-xl overflow-hidden">
          <video 
            ref={videoRef} 
            autoPlay 
            muted 
            onPlay={handleVideoOnPlay}
            className={`w-full h-full object-cover transition-opacity ${violationType ? 'opacity-50 grayscale' : 'opacity-80'}`}
          />

          {/* Neural HUD */}
          <div className="absolute inset-0 flex flex-col justify-between p-3 pointer-events-none">
            <div className="flex justify-between items-start">
               <div className={`px-1.5 py-0.5 rounded text-[8px] font-bold uppercase tracking-widest border ${violationType ? 'bg-rose-500/20 border-rose-500 text-rose-200' : 'bg-emerald-500/20 border-emerald-500/50 text-emerald-400'}`}>
                 {violationType ? 'FLAGGED' : 'SECURE'}
               </div>
               {violationType ? <ShieldAlert size={14} className="text-rose-500 animate-pulse" /> : <BrainCircuit size={14} className="text-emerald-500" />}
            </div>
            
            {/* Status Line */}
            <div className="space-y-1">
              <div className="flex justify-between text-[8px] text-white/50 font-mono">
                <span>NEURAL_NET</span>
                <span>{modelLoaded ? 'ONLINE' : 'LOADING...'}</span>
              </div>
              <div className="h-0.5 w-full bg-white/10 rounded-full overflow-hidden">
                <motion.div 
                  animate={{ width: modelLoaded ? '100%' : '5%' }}
                  className={`h-full ${violationType ? 'bg-rose-500' : 'bg-indigo-500'}`} 
                />
              </div>
            </div>
          </div>
          
          {/* Fallback Message */}
          {!modelLoaded && (
             <div className="absolute inset-0 flex items-center justify-center bg-black/80 backdrop-blur-sm text-white/40 text-[10px] text-center px-4">
               {debugMsg}
             </div>
          )}
        </div>
      </motion.div>
    </div>
  );
}