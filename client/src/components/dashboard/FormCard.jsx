// client/src/components/dashboard/FormCard.jsx
import { motion } from 'framer-motion';
import { useNavigate } from 'react-router-dom';
import { FileText, Users, Calendar, ArrowUpRight, Zap, Trash2 } from 'lucide-react';

export default function FormCard({ form, onDelete }) {
  const navigate = useNavigate();

  // Determine a color based on the form title length or ID for visual variety
  const accentColor = form._id.charCodeAt(form._id.length - 1) % 2 === 0 ? 'text-indigo-400' : 'text-purple-400';
  const glowColor = form._id.charCodeAt(form._id.length - 1) % 2 === 0 ? 'bg-indigo-500/20' : 'bg-purple-500/20';

  // Calculate actual interactive modules, ignoring UI structure components
  const interactiveModuleCount = form.questions?.filter(
    q => !['Banner', 'Heading', 'Paragraph'].includes(q.type)
  ).length || 0;

  return (
    <motion.div
      whileHover={{ y: -8, scale: 1.02 }}
      className="group relative glass-card p-8 border-white/5 bg-white/[0.02] overflow-hidden rounded-[32px] cursor-pointer"
      onClick={() => navigate(`/editor/${form._id}`)}
    >
      {/* Background Ambient Glow */}
      <div className={`absolute -right-10 -top-10 w-32 h-32 blur-[60px] opacity-0 group-hover:opacity-100 transition-opacity duration-500 ${glowColor}`} />

      <div className="relative z-10">
        <div className="flex justify-between items-start mb-6">
          <div className={`p-4 rounded-2xl bg-white/5 ${accentColor} border border-white/5`}>
            <Zap size={24} />
          </div>
          <div className="flex gap-2">
             <button 
              onClick={(e) => {
                e.stopPropagation();
                navigate(`/submissions?formId=${form._id}`);
              }}
              className="p-2 rounded-lg hover:bg-white/10 text-white/20 hover:text-white transition-all"
            >
              <Users size={18} />
            </button>
            <button 
              className="p-2 rounded-lg hover:bg-red-500/10 text-white/20 hover:text-red-400 transition-all"
              onClick={(e) => {
                e.stopPropagation();
                onDelete(form._id);
              }}
            >
              <Trash2 size={18} />
            </button>
          </div>
        </div>

        <h3 className="text-2xl font-bold text-white mb-2 truncate group-hover:text-indigo-300 transition-colors">
          {form.title}
        </h3>
        
        <div className="flex items-center gap-4 text-white/30 font-mono text-[10px] uppercase tracking-widest mb-8">
          <span className="flex items-center gap-1.5">
            <Calendar size={12} />
            {new Date(form.createdAt).toLocaleDateString()}
          </span>
          <span className="w-1 h-1 rounded-full bg-white/10" />
          <span className="flex items-center gap-1.5" title="Interactive modules only">
            <FileText size={12} />
            {interactiveModuleCount} Modules
          </span>
        </div>

        <div className="pt-6 border-t border-white/5 flex justify-between items-center">
          <span className="text-[10px] font-black uppercase tracking-[0.2em] text-white/20 group-hover:text-white/40 transition-colors">
            Access Terminal
          </span>
          <ArrowUpRight className="text-white/10 group-hover:text-white group-hover:translate-x-1 group-hover:-translate-y-1 transition-all" size={20} />
        </div>
      </div>
    </motion.div>
  );
}