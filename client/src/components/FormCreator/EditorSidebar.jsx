// client/src/components/FormCreator/EditorSidebar.jsx
import { motion } from 'framer-motion';
import { 
  Sparkles, 
  Type, 
  CheckSquare, 
  Layers, 
  Columns, 
  History, 
  Plus, 
  MessageSquare, 
  Layout, 
  Hash, 
  Mail, 
  CheckCircle2, 
  ChevronDown, 
  ToggleRight, 
  Image 
} from 'lucide-react';

// Added onOpenAiModal to the props
export default function EditorSidebar({ onAddQuestion, activeTab, setActiveTab, onOpenAiModal }) {
  const questionTypes = [
    { id: 'MultipleChoice', label: 'Multiple Choice', icon: CheckCircle2 },
    { id: 'ShortAnswer', label: 'Short Answer', icon: Type },
    { id: 'LongAnswer', label: 'Long Answer', icon: MessageSquare },
    { id: 'Categorize', label: 'Categorize', icon: Columns },
    { id: 'Comprehension', label: 'Comprehension', icon: Layout },
    { id: 'Cloze', label: 'Cloze Test', icon: Hash },
    { id: 'Email', label: 'Email Address', icon: Mail },
    { id: 'Dropdown', label: 'Dropdown Menu', icon: ChevronDown },
    { id: 'Switch', label: 'Switch / Toggle', icon: ToggleRight },
    { id: 'PictureChoice', label: 'Picture Choice', icon: Image },
  ];

  return (
    <motion.div 
      initial={{ x: 20, opacity: 0 }}
      animate={{ x: 0, opacity: 1 }}
      className="w-80 h-[calc(100vh-160px)] sticky top-24 flex flex-col gap-6"
    >
      <div className="glass-card p-6 border-white/10 h-full flex flex-col overflow-hidden bg-black/40 backdrop-blur-xl">
        
        {/* NEW: AI Generation Button */}
        {activeTab === 'elements' && (
          <motion.button 
            whileHover={{ scale: 1.02 }}
            whileTap={{ scale: 0.98 }}
            onClick={onOpenAiModal} // Triggers the modal in FormEditorUI
            className="w-full mb-6 p-4 rounded-xl bg-gradient-to-r from-indigo-600 to-purple-600 text-white flex items-center justify-center gap-2 font-bold text-xs uppercase tracking-widest hover:shadow-lg hover:shadow-indigo-500/30 transition-all border border-white/10"
          >
            <Sparkles size={16} className="animate-pulse" /> 
            Generate with AI
          </motion.button>
        )}

        {/* Tab Selection Logic */}
        <div className="flex bg-white/5 rounded-xl p-1 mb-8 border border-white/5">
          <button 
            onClick={() => setActiveTab('elements')}
            className={`flex-1 flex items-center justify-center gap-2 py-2.5 rounded-lg text-xs font-bold transition-all ${activeTab === 'elements' ? 'bg-white/10 text-white shadow-lg' : 'text-white/30 hover:text-white'}`}
          >
            <Plus size={14} /> Elements
          </button>
          <button 
            onClick={() => setActiveTab('history')}
            className={`flex-1 flex items-center justify-center gap-2 py-2.5 rounded-lg text-xs font-bold transition-all ${activeTab === 'history' ? 'bg-white/10 text-white shadow-lg' : 'text-white/30 hover:text-white'}`}
          >
            <History size={14} /> History
          </button>
        </div>

        {/* Question Types List */}
        <div className="flex-1 overflow-y-auto pr-2 custom-scrollbar">
          {activeTab === 'elements' ? (
            <div className="space-y-3">
              <p className="text-[10px] uppercase tracking-[0.2em] text-white/20 font-black mb-4">Core Modules</p>
              {questionTypes.map((type) => (
                <button
                  key={type.id}
                  onClick={() => onAddQuestion(type.id)}
                  className="w-full flex items-center gap-4 p-3.5 rounded-xl bg-white/[0.03] border border-white/5 text-white/60 hover:text-white hover:bg-white/[0.08] hover:border-white/10 transition-all group"
                >
                  <div className="p-2 rounded-lg bg-white/5 group-hover:bg-indigo-500/20 group-hover:text-indigo-400 transition-colors">
                    <type.icon size={18} />
                  </div>
                  <span className="text-sm font-medium tracking-tight">{type.label}</span>
                  <Plus size={14} className="ml-auto opacity-0 group-hover:opacity-100 transition-opacity" />
                </button>
              ))}
            </div>
          ) : (
            <div className="text-center py-12">
              <History size={32} className="mx-auto text-white/10 mb-4" />
              <p className="text-xs text-white/30 font-mono italic">Accessing previous states...</p>
            </div>
          )}
        </div>
      </div>
    </motion.div>
  );
}