// client/src/components/FormCreator/EditorSidebar.jsx
import { motion } from 'framer-motion';
import { 
  Type, 
  Hash, 
  CheckSquare, 
  AlignLeft, 
  Layout, 
  Columns, 
  Layers,
  History,
  Plus
} from 'lucide-react';

const questionTypes = [
  { id: 'header', label: 'Section Header', icon: Layout, color: 'text-blue-400' },
  { id: 'mcq', label: 'Multiple Choice', icon: CheckSquare, color: 'text-green-400' },
  { id: 'categorize', label: 'Categorize', icon: Layers, color: 'text-purple-400' },
  { id: 'cloze', label: 'Fill Blanks', icon: Columns, color: 'text-orange-400' },
  { id: 'comprehension', label: 'Comprehension', icon: AlignLeft, color: 'text-pink-400' },
];

export default function EditorSidebar({ onAddQuestion, activeTab, setActiveTab }) {
  return (
    <motion.div 
      initial={{ x: 20, opacity: 0 }}
      animate={{ x: 0, opacity: 1 }}
      className="w-72 h-[calc(100vh-120px)] sticky top-24 flex flex-col gap-6"
    >
      <div className="glass-card p-6 border-white/10 h-full flex flex-col">
        {/* Tab Selection */}
        <div className="flex bg-white/5 rounded-lg p-1 mb-6">
          <button 
            onClick={() => setActiveTab('elements')}
            className={`flex-1 flex items-center justify-center gap-2 py-2 rounded-md text-xs font-mono transition-all ${activeTab === 'elements' ? 'bg-white/10 text-white shadow-sm' : 'text-white/40'}`}
          >
            <Plus size={14} /> Elements
          </button>
          <button 
            onClick={() => setActiveTab('history')}
            className={`flex-1 flex items-center justify-center gap-2 py-2 rounded-md text-xs font-mono transition-all ${activeTab === 'history' ? 'bg-white/10 text-white shadow-sm' : 'text-white/40'}`}
          >
            <History size={14} /> History
          </button>
        </div>

        {activeTab === 'elements' ? (
          <div className="flex flex-col gap-3 overflow-y-auto pr-2 custom-scrollbar">
            <h3 className="text-[10px] font-mono uppercase tracking-widest text-white/40 mb-2">Structure</h3>
            {questionTypes.map((type) => (
              <motion.button
                key={type.id}
                whileHover={{ x: 5, backgroundColor: 'rgba(255,255,255,0.05)' }}
                whileTap={{ scale: 0.98 }}
                onClick={() => onAddQuestion(type.id)}
                className="flex items-center gap-4 p-4 rounded-xl border border-white/5 bg-white/[0.02] text-left transition-colors group"
              >
                <div className={`p-2 rounded-lg bg-white/5 group-hover:bg-white/10 transition-colors ${type.color}`}>
                  <type.icon size={18} />
                </div>
                <span className="text-sm font-medium text-white/70 group-hover:text-white transition-colors">
                  {type.label}
                </span>
              </motion.button>
            ))}
          </div>
        ) : (
          <div className="flex flex-col items-center justify-center h-full text-center text-white/20">
            <History size={32} className="mb-4 opacity-50" />
            <p className="text-xs font-mono uppercase tracking-widest">Select a version from the main timeline to rollback</p>
          </div>
        )}

        <div className="mt-auto pt-6 border-t border-white/10">
          <div className="glass-card p-4 bg-indigo-500/10 border-indigo-500/20">
            <p className="text-[10px] font-mono text-indigo-400 uppercase mb-2">Editor Pro Tip</p>
            <p className="text-xs text-white/50 leading-relaxed">
              {activeTab === 'elements' 
                ? "Drag and drop elements directly onto the canvas to reorder them."
                : "Versions are automatically created every time you save changes."}
            </p>
          </div>
        </div>
      </div>
    </motion.div>
  );
}