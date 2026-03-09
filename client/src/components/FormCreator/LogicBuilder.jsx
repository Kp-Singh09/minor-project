// client/src/components/FormCreator/LogicBuilder.jsx
import { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Split, ArrowRight, Trash2, Plus } from 'lucide-react';
import { GlassButton } from '../ui/GlassButton';

export default function LogicBuilder({ question, allQuestions, onUpdate }) {
  const [rules, setRules] = useState(question.logic || []);

  // Sync internal state if props change
  useEffect(() => {
    setRules(question.logic || []);
  }, [question.logic]);

  const addRule = () => {
    const newRule = {
      condition: '',
      action: 'jump_to',
      destination: ''
    };
    const updatedRules = [...rules, newRule];
    setRules(updatedRules);
    onUpdate(updatedRules);
  };

  const removeRule = (index) => {
    const updatedRules = rules.filter((_, i) => i !== index);
    setRules(updatedRules);
    onUpdate(updatedRules);
  };

  const updateRule = (index, field, value) => {
    const updatedRules = [...rules];
    updatedRules[index] = { ...updatedRules[index], [field]: value };
    setRules(updatedRules);
    onUpdate(updatedRules);
  };

  // Filter questions that come AFTER the current one to prevent infinite loops
  const currentQIndex = allQuestions.findIndex(q => q.id === question.id);
  const availableDestinations = allQuestions.slice(currentQIndex + 1);

  return (
    <div className="p-6 bg-slate-900/50 rounded-xl border border-white/5 mt-4">
      <div className="flex items-center gap-2 mb-6 text-indigo-400">
        <Split size={18} />
        <h3 className="font-bold text-sm uppercase tracking-wider">Branching Logic</h3>
      </div>

      <div className="space-y-4">
        <AnimatePresence>
          {rules.map((rule, index) => (
            <motion.div
              key={index}
              initial={{ opacity: 0, height: 0 }}
              animate={{ opacity: 1, height: 'auto' }}
              exit={{ opacity: 0, height: 0 }}
              className="flex flex-col md:flex-row gap-3 items-center bg-black/20 p-3 rounded-lg border border-white/5"
            >
              {/* IF Condition */}
              <div className="flex items-center gap-2 w-full md:w-auto">
                <span className="text-xs text-slate-500 font-mono">IF ANSWER IS</span>
                {['MultipleChoice', 'Dropdown', 'PictureChoice'].includes(question.type) ? (
                  <select
                    value={rule.condition}
                    onChange={(e) => updateRule(index, 'condition', e.target.value)}
                    className="bg-slate-800 text-white text-sm rounded px-3 py-1.5 border border-white/10 focus:outline-none focus:border-indigo-500"
                  >
                    <option value="">Select Option</option>
                    {question.options?.map((opt, i) => (
                      <option key={i} value={opt}>{opt}</option>
                    ))}
                  </select>
                ) : (
                  <input
                    type="text"
                    value={rule.condition}
                    onChange={(e) => updateRule(index, 'condition', e.target.value)}
                    placeholder="Enter value match..."
                    className="bg-slate-800 text-white text-sm rounded px-3 py-1.5 border border-white/10 w-full"
                  />
                )}
              </div>

              {/* ACTION */}
              <ArrowRight size={14} className="text-slate-600 hidden md:block" />
              
              <div className="flex items-center gap-2 w-full md:w-auto">
                 <span className="text-xs text-slate-500 font-mono">THEN</span>
                 <select
                    value={rule.action}
                    onChange={(e) => updateRule(index, 'action', e.target.value)}
                    className="bg-slate-800 text-white text-sm rounded px-3 py-1.5 border border-white/10"
                  >
                    <option value="jump_to">Jump To</option>
                    <option value="end_form">End Form</option>
                  </select>
              </div>

              {/* DESTINATION (If Jump) */}
              {rule.action === 'jump_to' && (
                <select
                  value={rule.destination}
                  onChange={(e) => updateRule(index, 'destination', e.target.value)}
                  className="bg-slate-800 text-white text-sm rounded px-3 py-1.5 border border-white/10 flex-1 w-full md:w-auto"
                >
                  <option value="">Select Question</option>
                  {availableDestinations.map((q, i) => (
                    <option key={q.id} value={q.id}>
                      {currentQIndex + 1 + i + 1}. {q.title?.substring(0, 20) || 'Untitled'}...
                    </option>
                  ))}
                </select>
              )}

              <button 
                onClick={() => removeRule(index)}
                className="p-2 text-slate-500 hover:text-red-400 transition-colors"
              >
                <Trash2 size={16} />
              </button>
            </motion.div>
          ))}
        </AnimatePresence>

        <button
          onClick={addRule}
          className="flex items-center gap-2 text-xs font-bold text-indigo-400 hover:text-indigo-300 transition-colors mt-2"
        >
          <Plus size={14} /> ADD LOGIC BRANCH
        </button>
      </div>
    </div>
  );
}