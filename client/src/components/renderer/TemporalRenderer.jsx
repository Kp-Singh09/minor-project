// client/src/components/renderer/TemporalRenderer.jsx
import { CalendarClock } from 'lucide-react';

export default function TemporalRenderer({ question, onAnswerChange, savedAnswer }) {
  const content = question.content || question;
  
  return (
    <div className="space-y-6 w-full animate-fadeIn">
      <div className="flex items-center gap-3 mb-6 border-b border-white/10 pb-6">
        <CalendarClock className="text-pink-400 shrink-0" size={28} />
        <h2 className="text-2xl font-bold text-white tracking-tight">
          {content.question || 'Select a Date and Time'}
        </h2>
      </div>
      
      <div className="relative">
        <input
          type="datetime-local"
          value={savedAnswer || ''}
          onChange={(e) => onAnswerChange(question._id, e.target.value)}
          className="w-full p-4 bg-white/5 border border-white/10 rounded-xl text-white focus:outline-none focus:ring-2 focus:ring-pink-500 focus:border-transparent transition-all font-mono"
        />
      </div>
    </div>
  );
}