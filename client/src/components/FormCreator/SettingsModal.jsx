// client/src/components/FormCreator/SettingsModal.jsx
import { motion, AnimatePresence } from 'framer-motion';
import { X, Shield } from 'lucide-react';
import SecuritySettings from './SecuritySettings';

export default function SettingsModal({ isOpen, onClose, settings, onUpdate }) {
  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-[70] flex items-center justify-center bg-black/60 backdrop-blur-sm p-4">
      <motion.div 
        initial={{ opacity: 0, scale: 0.95 }}
        animate={{ opacity: 1, scale: 1 }}
        exit={{ opacity: 0, scale: 0.95 }}
        className="w-full max-w-lg glass-card border border-white/10 shadow-2xl overflow-hidden max-h-[90vh] flex flex-col"
      >
        {/* Header */}
        <div className="p-6 bg-gradient-to-r from-slate-800 to-slate-900 border-b border-white/5 flex justify-between items-center shrink-0">
          <div className="flex items-center gap-3">
            <div className="p-2 bg-emerald-500/10 rounded-lg text-emerald-400">
              <Shield size={20} />
            </div>
            <div>
              <h2 className="text-lg font-bold text-white">Form Settings</h2>
              <p className="text-xs text-slate-400">Security, Monitoring & Access</p>
            </div>
          </div>
          <button onClick={onClose} className="text-white/40 hover:text-white transition-colors">
            <X size={20} />
          </button>
        </div>

        {/* Scrollable Body */}
        <div className="overflow-y-auto p-1 bg-slate-900">
            <SecuritySettings 
                settings={settings} 
                onUpdate={onUpdate}
                theme={{ name: 'Dark', cardBg: 'bg-transparent', text: 'text-white', input: 'bg-black/30 border-white/10 text-white' }}
            />
        </div>
      </motion.div>
    </div>
  );
}