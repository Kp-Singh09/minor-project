// client/src/components/Public/AccessGate.jsx
import { useState } from 'react';
import { motion } from 'framer-motion';
import { Lock, ArrowRight, ShieldCheck, AlertCircle } from 'lucide-react';
import { GlassButton } from '../ui/GlassButton';

export default function AccessGate({ title, error, onUnlock }) {
  const [password, setPassword] = useState('');
  const [shake, setShake] = useState(false);

  const handleSubmit = (e) => {
    e.preventDefault();
    if (!password) {
      setShake(true);
      setTimeout(() => setShake(false), 500);
      return;
    }
    onUnlock(password);
  };

  return (
    <div className="min-h-screen w-full flex items-center justify-center bg-slate-950 p-4">
      <motion.div 
        initial={{ opacity: 0, scale: 0.9 }}
        animate={{ opacity: 1, scale: 1 }}
        className="w-full max-w-md"
      >
        <div className="glass-card p-8 border-indigo-500/20 shadow-[0_0_50px_rgba(79,70,229,0.15)] text-center relative overflow-hidden">
          
          {/* Background decoration */}
          <div className="absolute top-0 left-0 w-full h-1 bg-gradient-to-r from-indigo-500 via-purple-500 to-indigo-500" />
          
          <div className="mb-6 flex justify-center">
            <div className="p-4 rounded-full bg-slate-900/50 border border-white/10 shadow-inner">
              <Lock size={32} className="text-indigo-400" />
            </div>
          </div>

          <h1 className="text-2xl font-bold text-white mb-2">{title}</h1>
          <p className="text-slate-400 text-sm mb-8">
            This assessment is protected. Please enter your access credentials to proceed.
          </p>

          <form onSubmit={handleSubmit} className="space-y-4">
            <motion.div 
              animate={shake ? { x: [-10, 10, -10, 10, 0] } : {}}
              className="relative"
            >
              <input
                type="password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                placeholder="Enter Access Password"
                className="w-full bg-black/40 border border-white/10 rounded-xl py-4 px-6 text-center text-white focus:border-indigo-500 focus:outline-none transition-all placeholder:text-slate-600 text-lg tracking-widest"
                autoFocus
              />
            </motion.div>

            {error && (
              <motion.div 
                initial={{ opacity: 0, y: -10 }}
                animate={{ opacity: 1, y: 0 }}
                className="flex items-center justify-center gap-2 text-rose-400 text-xs bg-rose-500/10 py-2 rounded-lg"
              >
                <AlertCircle size={14} />
                <span>{error}</span>
              </motion.div>
            )}

            <GlassButton 
              type="submit"
              className="w-full py-4 bg-indigo-600/20 hover:bg-indigo-600/30 border-indigo-500/50 text-indigo-300 font-bold tracking-wide flex items-center justify-center gap-2"
            >
              AUTHENTICATE <ArrowRight size={18} />
            </GlassButton>
          </form>

          <div className="mt-8 pt-6 border-t border-white/5 flex justify-center items-center gap-2 text-[10px] text-slate-500 uppercase tracking-widest">
            <ShieldCheck size={12} />
            Secured via Neural Encryption
          </div>
        </div>
      </motion.div>
    </div>
  );
}