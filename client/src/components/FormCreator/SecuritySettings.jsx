// client/src/components/FormCreator/SecuritySettings.jsx
import { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { Shield, Lock, Calendar, Clock, Globe, Users } from 'lucide-react';
import { GlassButton } from '../ui/GlassButton';

export default function SecuritySettings({ formSettings, onUpdate }) {
  const [settings, setSettings] = useState({
    privacy: 'public', // public, protected, private
    password: '',
    expiresAt: '',
    ...formSettings
  });

  useEffect(() => {
    onUpdate(settings);
  }, [settings]);

  return (
    <div className="p-6 bg-slate-900/50 rounded-xl border border-white/5 space-y-8">
      <div className="flex items-center gap-2 mb-6 text-emerald-400">
        <Shield size={18} />
        <h3 className="font-bold text-sm uppercase tracking-wider">Access Control Protocol</h3>
      </div>

      {/* Privacy Level */}
      <div className="space-y-4">
        <label className="text-xs font-mono text-slate-400 uppercase">Visibility Level</label>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
          {[
            { id: 'public', icon: Globe, label: 'Public', desc: 'Anyone with link' },
            { id: 'protected', icon: Lock, label: 'Password', desc: 'Requires key' },
            { id: 'private', icon: Users, label: 'Invite Only', desc: 'Specific emails' }
          ].map((mode) => (
            <button
              key={mode.id}
              onClick={() => setSettings({ ...settings, privacy: mode.id })}
              className={`flex flex-col items-center p-4 rounded-xl border transition-all ${
                settings.privacy === mode.id 
                  ? 'bg-indigo-500/20 border-indigo-500 text-white' 
                  : 'bg-black/20 border-white/5 text-slate-500 hover:bg-white/5'
              }`}
            >
              <mode.icon size={20} className="mb-2" />
              <span className="text-sm font-bold">{mode.label}</span>
              <span className="text-[10px] opacity-60">{mode.desc}</span>
            </button>
          ))}
        </div>
      </div>

      {/* Password Input (Conditional) */}
      {settings.privacy === 'protected' && (
        <motion.div 
          initial={{ opacity: 0, height: 0 }}
          animate={{ opacity: 1, height: 'auto' }}
          className="space-y-2"
        >
          <label className="text-xs font-mono text-slate-400 uppercase">Access Key (Password)</label>
          <div className="relative">
            <Lock size={16} className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-500" />
            <input 
              type="text" 
              value={settings.password || ''}
              onChange={(e) => setSettings({ ...settings, password: e.target.value })}
              placeholder="Set a secure password..."
              className="w-full bg-black/40 border border-white/10 rounded-lg py-2 pl-10 pr-4 text-sm text-white focus:border-indigo-500 focus:outline-none transition-colors"
            />
          </div>
        </motion.div>
      )}

      {/* Expiration (TTL) */}
      <div className="space-y-2 pt-4 border-t border-white/5">
        <div className="flex justify-between items-center">
          <label className="text-xs font-mono text-slate-400 uppercase flex items-center gap-2">
            <Clock size={14} /> Auto-Expiration (TTL)
          </label>
          <button 
            onClick={() => setSettings({ ...settings, expiresAt: '' })}
            className="text-[10px] text-red-400 hover:underline"
          >
            Clear
          </button>
        </div>
        <div className="relative">
          <Calendar size={16} className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-500" />
          <input 
            type="datetime-local" 
            value={settings.expiresAt ? new Date(settings.expiresAt).toISOString().slice(0, 16) : ''}
            onChange={(e) => setSettings({ ...settings, expiresAt: e.target.value })}
            className="w-full bg-black/40 border border-white/10 rounded-lg py-2 pl-10 pr-4 text-sm text-white focus:border-indigo-500 focus:outline-none [color-scheme:dark]"
          />
        </div>
        <p className="text-[10px] text-slate-600">
          Form will automatically lock after this time.
        </p>
      </div>
    </div>
  );
}