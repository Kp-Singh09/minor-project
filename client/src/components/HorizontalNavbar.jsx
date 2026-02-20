// client/src/components/HorizontalNavbar.jsx
import { useState } from 'react';
import { UserButton } from '@clerk/clerk-react';
import { Search, Bell, Share2, Shield, Clock, Lock } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';
import { GlassButton } from './ui/GlassButton';

export default function HorizontalNavbar() {
  const [showShareModal, setShowShareModal] = useState(false);

  return (
    <nav className="h-20 px-8 flex items-center justify-between sticky top-0 z-40 backdrop-blur-md bg-[#050505]/50 border-b border-white/5">
      <div className="relative w-96 group">
        <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-white/20 group-focus-within:text-indigo-400 transition-colors" size={18} />
        <input 
          type="text" 
          placeholder="Search forms, analytics, or folders..." 
          className="w-full glass-input pl-10 bg-white/5 border-white/5 focus:border-indigo-500/50"
        />
      </div>

      <div className="flex items-center gap-6">
        <button 
          onClick={() => setShowShareModal(true)}
          className="flex items-center gap-2 px-4 py-2 rounded-lg bg-indigo-500/10 text-indigo-400 border border-indigo-500/20 hover:bg-indigo-500 hover:text-white transition-all text-xs font-bold uppercase tracking-widest"
        >
          <Share2 size={16} /> Share
        </button>

        <button className="relative p-2 text-white/40 hover:text-white transition-colors">
          <Bell size={20} />
          <span className="absolute top-2 right-2 w-2 h-2 bg-indigo-500 rounded-full border-2 border-[#050505]" />
        </button>
        <div className="h-8 w-px bg-white/10" />
        <UserButton appearance={{ elements: { userButtonAvatarBox: 'w-10 h-10 border border-white/10' } }} />
      </div>

      {/* Share & Security Modal */}
      <AnimatePresence>
        {showShareModal && (
          <div className="fixed inset-0 z-[100] flex items-center justify-center p-6 bg-black/60 backdrop-blur-sm">
            <motion.div 
              initial={{ opacity: 0, scale: 0.95, y: 20 }}
              animate={{ opacity: 1, scale: 1, y: 0 }}
              exit={{ opacity: 0, scale: 0.95, y: 20 }}
              className="glass-card w-full max-w-lg p-8 border-white/10 relative"
            >
              <h3 className="text-2xl font-bold mb-6">Access & Security</h3>
              
              <div className="space-y-6">
                <div className="flex items-center justify-between p-4 glass-card border-white/5">
                  <div className="flex items-center gap-3">
                    <Lock className="text-indigo-400" size={20} />
                    <div>
                      <p className="text-sm font-semibold">Password Protection</p>
                      <p className="text-[10px] text-white/40">Require a password to view this form</p>
                    </div>
                  </div>
                  <input type="checkbox" className="accent-indigo-500" />
                </div>

                <div className="flex items-center justify-between p-4 glass-card border-white/5">
                  <div className="flex items-center gap-3">
                    <Clock className="text-indigo-400" size={20} />
                    <div>
                      <p className="text-sm font-semibold">Self-Destruct (TTL)</p>
                      <p className="text-[10px] text-white/40">Form link expires after a set date</p>
                    </div>
                  </div>
                  <input type="date" className="glass-input text-xs" />
                </div>

                <div className="p-4 glass-card border-white/5">
                  <div className="flex items-center gap-3 mb-4">
                    <Shield className="text-indigo-400" size={20} />
                    <p className="text-sm font-semibold">Role-Based Permissions</p>
                  </div>
                  <div className="space-y-2">
                    {['Admin', 'Editor', 'Viewer'].map(role => (
                      <div key={role} className="flex items-center justify-between text-xs text-white/60">
                        <span>{role} Access</span>
                        <input type="checkbox" defaultChecked={role === 'Viewer'} />
                      </div>
                    ))}
                  </div>
                </div>
              </div>

              <div className="mt-8 flex gap-3">
                <GlassButton 
                  onClick={() => setShowShareModal(false)}
                  className="flex-1 bg-indigo-500 text-white border-none py-3"
                >
                  Apply Settings
                </GlassButton>
                <button 
                  onClick={() => setShowShareModal(false)}
                  className="flex-1 py-3 text-white/40 hover:text-white transition-colors text-sm"
                >
                  Cancel
                </button>
              </div>
            </motion.div>
          </div>
        )}
      </AnimatePresence>
    </nav>
  );
}