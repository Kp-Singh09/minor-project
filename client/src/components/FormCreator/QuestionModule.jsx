// client/src/components/FormCreator/QuestionModule.jsx
import { motion } from 'framer-motion';
import { Trash2, GripVertical, Settings2, Copy } from 'lucide-react';

export default function QuestionModule({ children, index, typeLabel, onDelete }) {
  return (
    <motion.div
      initial={{ opacity: 0, y: 30 }}
      animate={{ opacity: 1, y: 0 }}
      exit={{ opacity: 0, scale: 0.95 }}
      className="group relative mb-8 glass-card p-1 border-white/5 bg-white/[0.01] hover:bg-white/[0.03] transition-all rounded-[28px]"
    >
      <div className="p-8">
        {/* Header Area */}
        <div className="flex items-center justify-between mb-8">
          <div className="flex items-center gap-4">
            <div className="cursor-grab active:cursor-grabbing text-white/10 hover:text-white/40 transition-colors">
              <GripVertical size={20} />
            </div>
            <div className="px-3 py-1 rounded-full bg-indigo-500/10 border border-indigo-500/20">
              <span className="text-[10px] font-black uppercase tracking-widest text-indigo-400">
                Module {index + 1}: {typeLabel}
              </span>
            </div>
          </div>

          <div className="flex items-center gap-2 opacity-0 group-hover:opacity-100 transition-opacity">
            <button className="p-2 rounded-lg text-white/20 hover:text-white hover:bg-white/5 transition-all">
              <Copy size={16} />
            </button>
            <button className="p-2 rounded-lg text-white/20 hover:text-white hover:bg-white/5 transition-all">
              <Settings2 size={16} />
            </button>
            <div className="w-px h-4 bg-white/10 mx-1" />
            <button 
              onClick={onDelete}
              className="p-2 rounded-lg text-white/20 hover:text-red-400 hover:bg-red-500/10 transition-all"
            >
              <Trash2 size={16} />
            </button>
          </div>
        </div>

        {/* Content Area */}
        <div className="relative">
          {children}
        </div>
      </div>

      {/* Visual Indicator of Focus */}
      <div className="absolute left-0 top-1/2 -translate-y-1/2 w-[2px] h-0 group-hover:h-1/2 bg-indigo-500 transition-all duration-500 rounded-full" />
    </motion.div>
  );
}