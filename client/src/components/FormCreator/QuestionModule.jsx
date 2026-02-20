import { motion } from 'framer-motion';
import { GripVertical, Trash2, Copy, ChevronUp, ChevronDown } from 'lucide-react';

export default function QuestionModule({ children, index, onDelete, typeLabel }) {
  return (
    <motion.div
      layout
      initial={{ opacity: 0, scale: 0.95 }}
      animate={{ opacity: 1, scale: 1 }}
      exit={{ opacity: 0, scale: 0.95 }}
      className="glass-card p-1 mb-6 border-white/5 hover:border-white/10 transition-colors group relative"
    >
      <div className="flex">
        {/* Drag Handle Area */}
        <div className="w-10 flex flex-col items-center py-6 border-r border-white/5 cursor-grab active:cursor-grabbing text-white/10 group-hover:text-white/30 transition-colors">
          <GripVertical size={20} />
        </div>

        {/* Content Area */}
        <div className="flex-1 p-8">
          <div className="flex justify-between items-center mb-6">
            <span className="px-3 py-1 rounded-full bg-white/5 border border-white/10 text-[10px] font-mono uppercase tracking-widest text-white/40">
              Q{index + 1} — {typeLabel}
            </span>
            <div className="flex items-center gap-2 opacity-0 group-hover:opacity-100 transition-opacity">
              <button className="p-2 hover:bg-white/5 rounded-lg text-white/40 hover:text-white"><Copy size={16} /></button>
              <button onClick={onDelete} className="p-2 hover:bg-red-500/10 rounded-lg text-white/40 hover:text-red-400"><Trash2 size={16} /></button>
            </div>
          </div>
          
          <div className="space-y-4">
            {children}
          </div>
        </div>
      </div>
    </motion.div>
  );
}