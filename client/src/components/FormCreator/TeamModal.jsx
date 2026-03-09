// client/src/components/FormCreator/TeamModal.jsx
import { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Users, UserPlus, X, Trash2, Shield } from 'lucide-react';
import { GlassButton } from '../ui/GlassButton';
import axios from '../../api/axiosConfig';
import toast from 'react-hot-toast';

export default function TeamModal({ isOpen, onClose, formId, collaborators, onUpdate }) {
  const [email, setEmail] = useState('');
  const [role, setRole] = useState('Editor');
  const [loading, setLoading] = useState(false);

  const handleInvite = async () => {
    if (!email.trim()) return;
    setLoading(true);
    try {
      const res = await axios.post(`/api/forms/${formId}/collaborators`, { email, role });
      onUpdate(res.data); // Update parent state with new list
      setEmail('');
      toast.success("Invitation Sent");
    } catch (err) {
      toast.error(err.response?.data?.message || "Failed to invite");
    } finally {
      setLoading(false);
    }
  };

  const handleRemove = async (emailToRemove) => {
    if (!confirm(`Remove ${emailToRemove}?`)) return;
    try {
      // Axios DELETE with body requires "data" key
      const res = await axios.delete(`/api/forms/${formId}/collaborators`, { 
        data: { email: emailToRemove } 
      });
      onUpdate(res.data);
      toast.success("User removed");
    } catch (err) {
      toast.error("Failed to remove user");
    }
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-[60] flex items-center justify-center bg-black/60 backdrop-blur-sm p-4">
      <motion.div 
        initial={{ opacity: 0, scale: 0.95 }}
        animate={{ opacity: 1, scale: 1 }}
        exit={{ opacity: 0, scale: 0.95 }}
        className="w-full max-w-md glass-card border border-white/10 shadow-2xl overflow-hidden"
      >
        {/* Header */}
        <div className="p-6 bg-gradient-to-r from-emerald-600/20 to-teal-600/20 border-b border-white/5 flex justify-between items-center">
          <div className="flex items-center gap-3">
            <div className="p-2 bg-emerald-500 rounded-lg shadow-lg">
              <Users className="text-white" size={20} />
            </div>
            <div>
              <h2 className="text-lg font-bold text-white">Manage Team</h2>
              <p className="text-xs text-emerald-200">Collaborate in real-time</p>
            </div>
          </div>
          <button onClick={onClose} className="text-white/40 hover:text-white">
            <X size={20} />
          </button>
        </div>

        <div className="p-6 space-y-6">
          
          {/* Invite Section */}
          <div className="space-y-3">
            <label className="text-xs font-mono text-slate-400 uppercase">Invite by Email</label>
            <div className="flex gap-2">
              <input 
                type="email" 
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                placeholder="colleague@example.com"
                className="flex-1 bg-black/20 border border-white/10 rounded-lg px-4 py-2 text-sm text-white focus:outline-none focus:border-emerald-500"
              />
              <select 
                value={role}
                onChange={(e) => setRole(e.target.value)}
                className="bg-black/20 border border-white/10 rounded-lg px-3 py-2 text-sm text-white focus:outline-none focus:border-emerald-500"
              >
                <option value="Editor">Editor</option>
                <option value="Viewer">Viewer</option>
              </select>
            </div>
            <GlassButton 
              onClick={handleInvite}
              disabled={loading || !email}
              className="w-full flex items-center justify-center gap-2 bg-emerald-600/20 text-emerald-400 border-emerald-500/50 hover:bg-emerald-600/30"
            >
              <UserPlus size={16} /> {loading ? "Sending..." : "Send Invite"}
            </GlassButton>
          </div>

          {/* List Section */}
          <div className="space-y-3">
            <label className="text-xs font-mono text-slate-400 uppercase">Current Access</label>
            <div className="bg-black/20 rounded-xl p-2 max-h-48 overflow-y-auto space-y-1">
              {collaborators && collaborators.length > 0 ? (
                collaborators.map((member, i) => (
                  <div key={i} className="flex justify-between items-center p-3 rounded-lg hover:bg-white/5 group">
                    <div className="flex items-center gap-3">
                      <div className="w-8 h-8 rounded-full bg-slate-700 flex items-center justify-center text-xs font-bold text-white">
                        {member.email[0].toUpperCase()}
                      </div>
                      <div>
                        <p className="text-sm text-white">{member.email}</p>
                        <span className="text-[10px] bg-slate-800 px-2 py-0.5 rounded text-slate-400 border border-white/5">
                          {member.role}
                        </span>
                      </div>
                    </div>
                    <button 
                      onClick={() => handleRemove(member.email)}
                      className="p-2 text-slate-500 hover:text-rose-400 opacity-0 group-hover:opacity-100 transition-all"
                    >
                      <Trash2 size={16} />
                    </button>
                  </div>
                ))
              ) : (
                <p className="text-center text-xs text-slate-500 py-4">No active collaborators</p>
              )}
            </div>
          </div>

        </div>
      </motion.div>
    </div>
  );
}