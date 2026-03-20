// client/src/components/FormCreator/SecuritySettings.jsx
import { useState, useEffect } from 'react';
import { Clock, Lock, Users, Eye, AlertTriangle } from 'lucide-react';

const SecuritySettings = ({ settings, onUpdate, theme }) => {
  const [localSettings, setLocalSettings] = useState({
    privacy: 'public',
    password: '',
    expiresAt: '',
    limitOneResponse: false,
    proctoring: 'none',
    ...settings
  });

  const currentTheme = theme || { 
    name: 'Light',
    cardBg: 'bg-transparent', 
    text: 'text-gray-900', 
    secondaryText: 'text-gray-500', 
    input: 'bg-white border-gray-300 text-gray-900' 
  };
  
  const isDark = ['Dark', 'Navy Pop', 'Futuristic', 'Cyber Dawn'].includes(currentTheme.name);

  useEffect(() => {
    setLocalSettings(prev => ({ ...prev, ...settings }));
  }, [settings]);

  const handleChange = (field, value) => {
    const updated = { ...localSettings, [field]: value };
    setLocalSettings(updated);
    onUpdate(updated);
  };

  return (
    <div className="p-6 animate-fadeIn space-y-7">
      
      {/* 1. Privacy Access */}
      <div>
        <label className={`block font-semibold mb-3 ${currentTheme.text}`}>Access Control</label>
        <div className="grid grid-cols-3 gap-3">
          {['public', 'private', 'protected'].map((type) => (
            <button
              key={type}
              onClick={() => handleChange('privacy', type)}
              className={`py-2.5 px-4 rounded-xl text-sm font-medium border transition-all capitalize ${
                localSettings.privacy === type
                  ? 'bg-emerald-500 text-white border-emerald-500 shadow-lg shadow-emerald-500/20'
                  : `${isDark ? 'bg-white/5 border-white/10 text-gray-300 hover:bg-white/10' : 'bg-gray-50 border-gray-200 text-gray-600 hover:bg-gray-100'}`
              }`}
            >
              {type}
            </button>
          ))}
        </div>
      </div>

      {/* Password Field (Conditional) */}
      {localSettings.privacy === 'protected' && (
        <div className="animate-fadeIn bg-amber-500/10 border border-amber-500/20 p-4 rounded-xl">
          <label className={`font-semibold mb-2 flex items-center gap-2 ${currentTheme.text}`}>
            <Lock size={16} className="text-amber-500" /> Assessment Password
          </label>
          <input
            type="text"
            value={localSettings.password || ''}
            onChange={(e) => handleChange('password', e.target.value)}
            placeholder="Set a secure password"
            className={`w-full p-3 rounded-lg focus:ring-2 focus:ring-amber-500 focus:border-transparent focus:outline-none ${currentTheme.input} mt-1`}
          />
        </div>
      )}

      {/* 2. Proctoring Level */}
      <div>
        <label className={`font-semibold mb-3 flex items-center gap-2 ${currentTheme.text}`}>
          <Eye size={16} className="text-indigo-400" /> Monitoring Level
        </label>
        <select
          value={localSettings.proctoring || 'none'}
          onChange={(e) => handleChange('proctoring', e.target.value)}
          className={`w-full p-3 rounded-xl focus:ring-2 focus:ring-indigo-500 focus:border-transparent focus:outline-none cursor-pointer ${currentTheme.input}`}
        >
          <option value="none">No Monitoring (Standard Form)</option>
          <option value="basic">Basic Integrity (Tab Switch + Copy/Paste)</option>
          <option value="full">Full AI Proctor (Face + Gaze + Basic)</option>
        </select>
        
        {localSettings.proctoring === 'full' && (
           <p className="text-xs text-amber-500/80 mt-2 flex items-center gap-1.5 font-medium">
             <AlertTriangle size={14} /> Requires camera permissions for gaze tracking.
           </p>
        )}
      </div>

      {/* 3. Expiration */}
      <div>
        <label className={`font-semibold mb-3 flex items-center gap-2 ${currentTheme.text}`}>
          <Clock size={16} className="text-blue-400" /> Expiration Date (TTL)
        </label>
        <input
          type="datetime-local"
          value={localSettings.expiresAt ? new Date(localSettings.expiresAt).toISOString().slice(0, 16) : ''}
          onChange={(e) => handleChange('expiresAt', e.target.value)}
          className={`w-full p-3 rounded-xl focus:ring-2 focus:ring-blue-500 focus:border-transparent focus:outline-none ${currentTheme.input} [color-scheme:dark]`}
        />
      </div>

      {/* 4. Limit Response */}
      <div className="flex items-center justify-between pt-4 border-t border-white/5">
        <span className={`font-medium flex items-center gap-2 ${currentTheme.text}`}>
          <Users size={16} className="text-purple-400" /> Limit to 1 Response
        </span>
        <button
          onClick={() => handleChange('limitOneResponse', !localSettings.limitOneResponse)}
          className={`w-12 h-6 rounded-full transition-colors relative shadow-inner ${
            localSettings.limitOneResponse ? 'bg-emerald-500' : 'bg-white/10'
          }`}
        >
          <div className={`absolute top-1 left-1 bg-white w-4 h-4 rounded-full transition-transform shadow-md ${
            localSettings.limitOneResponse ? 'translate-x-6' : 'translate-x-0'
          }`} />
        </button>
      </div>

    </div>
  );
};

export default SecuritySettings;