// client/src/components/FormCreator/SecuritySettings.jsx
import { useState, useEffect } from 'react';
import { Shield, Clock, Lock, Users, Eye, AlertTriangle } from 'lucide-react';

const SecuritySettings = ({ settings, onUpdate, theme }) => {
  // Local state to manage inputs before saving to parent
  const [localSettings, setLocalSettings] = useState({
    privacy: 'public',
    password: '',
    expiresAt: '',
    limitOneResponse: false,
    proctoring: 'none', // Default
    ...settings
  });

  const currentTheme = theme || { 
    name: 'Light',
    cardBg: 'bg-white', 
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
    onUpdate(updated); // Propagate to parent FormEditor
  };

  return (
    <div className={`p-6 rounded-lg shadow-md animate-fadeIn border ${currentTheme.cardBg} ${isDark ? 'border-gray-600' : 'border-gray-200'}`}>
      <h3 className={`text-xl font-bold mb-6 pb-4 border-b flex items-center gap-2 ${currentTheme.text} ${isDark ? 'border-gray-600' : 'border-gray-100'}`}>
        <Shield className="text-emerald-500" size={24} /> Security & Integrity
      </h3>

      <div className="space-y-6">
        
        {/* 1. Privacy Access */}
        <div>
          <label className={`block font-semibold mb-2 ${currentTheme.text}`}>Access Control</label>
          <div className="grid grid-cols-3 gap-3">
            {['public', 'private', 'protected'].map((type) => (
              <button
                key={type}
                onClick={() => handleChange('privacy', type)}
                className={`py-2 px-4 rounded-lg text-sm font-medium border transition-all capitalize ${
                  localSettings.privacy === type
                    ? 'bg-emerald-500 text-white border-emerald-500 shadow-md'
                    : `${isDark ? 'bg-white/5 border-gray-600 text-gray-300 hover:bg-white/10' : 'bg-gray-50 border-gray-200 text-gray-600 hover:bg-gray-100'}`
                }`}
              >
                {type}
              </button>
            ))}
          </div>
        </div>

        {/* Password Field (Conditional) */}
        {localSettings.privacy === 'protected' && (
          <div className="animate-fadeIn">
            <label className={`block font-semibold mb-2 flex items-center gap-2 ${currentTheme.text}`}>
              <Lock size={16} className="text-amber-500" /> Assessment Password
            </label>
            <input
              type="text"
              value={localSettings.password || ''}
              onChange={(e) => handleChange('password', e.target.value)}
              placeholder="Set a secure password"
              className={`w-full p-3 rounded-md focus:ring-2 focus:ring-emerald-500 focus:outline-none ${currentTheme.input}`}
            />
          </div>
        )}

        {/* 2. Proctoring Level (NEW) */}
        <div>
          <label className={`block font-semibold mb-2 flex items-center gap-2 ${currentTheme.text}`}>
            <Eye size={16} className="text-indigo-500" /> Monitoring Level
          </label>
          <select
            value={localSettings.proctoring || 'none'}
            onChange={(e) => handleChange('proctoring', e.target.value)}
            className={`w-full p-3 rounded-md focus:ring-2 focus:ring-emerald-500 focus:outline-none cursor-pointer ${currentTheme.input}`}
          >
            <option value="none">No Monitoring (Standard Form)</option>
            <option value="basic">Basic Integrity (Tab Switch + Copy/Paste)</option>
            <option value="full">Full AI Proctor (Face + Gaze + Basic)</option>
          </select>
          
          {localSettings.proctoring === 'full' && (
             <p className="text-xs text-amber-500 mt-2 flex items-center gap-1">
               <AlertTriangle size={12} /> Requires webcam access.
             </p>
          )}
        </div>

        {/* 3. Expiration */}
        <div>
          <label className={`block font-semibold mb-2 flex items-center gap-2 ${currentTheme.text}`}>
            <Clock size={16} className="text-blue-500" /> Expiration Date (TTL)
          </label>
          <input
            type="datetime-local"
            value={localSettings.expiresAt ? new Date(localSettings.expiresAt).toISOString().slice(0, 16) : ''}
            onChange={(e) => handleChange('expiresAt', e.target.value)}
            className={`w-full p-3 rounded-md focus:ring-2 focus:ring-emerald-500 focus:outline-none ${currentTheme.input} [color-scheme:dark]`}
          />
        </div>

        {/* 4. Limit Response */}
        <div className="flex items-center justify-between pt-2">
          <span className={`font-medium flex items-center gap-2 ${currentTheme.text}`}>
            <Users size={16} className="text-purple-500" /> Limit to 1 Response
          </span>
          <button
            onClick={() => handleChange('limitOneResponse', !localSettings.limitOneResponse)}
            className={`w-12 h-6 rounded-full transition-colors relative ${
              localSettings.limitOneResponse ? 'bg-emerald-500' : 'bg-gray-600'
            }`}
          >
            <div className={`absolute top-1 left-1 bg-white w-4 h-4 rounded-full transition-transform ${
              localSettings.limitOneResponse ? 'translate-x-6' : 'translate-x-0'
            }`} />
          </button>
        </div>

      </div>
    </div>
  );
};

export default SecuritySettings;