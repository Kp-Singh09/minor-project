const LongAnswerRenderer = ({ question, onAnswerChange, savedAnswer }) => {
  const content = question.content || {};
  const text = content.question || content.text || 'Question';

  return (
    <div className="p-8 rounded-2xl shadow-xl border bg-slate-900 border-pink-500/20 relative overflow-hidden">
      <div className="absolute top-0 left-0 w-full h-1 bg-gradient-to-r from-pink-500 to-rose-500"></div>
      <p className="font-semibold text-2xl mb-8 text-white">{text}</p>
      <textarea
        rows={6}
        className="w-full p-5 rounded-xl bg-white/5 border border-white/10 focus:border-pink-500 focus:ring-2 focus:ring-pink-500/50 focus:outline-none text-white text-lg placeholder-white/30"
        placeholder="Type your detailed answer..." value={savedAnswer || ''} onChange={(e) => onAnswerChange(question._id, e.target.value)}
      />
    </div>
  );
};
export default LongAnswerRenderer;