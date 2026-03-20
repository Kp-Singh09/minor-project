const DropdownRenderer = ({ question, onAnswerChange, savedAnswer }) => {
  const content = question.content || {};
  const text = content.question || content.text || 'Question';
  const options = content.options || [];

  return (
    <div className="p-8 rounded-2xl shadow-xl border bg-slate-900 border-indigo-500/20 relative overflow-hidden">
      <div className="absolute top-0 left-0 w-full h-1 bg-gradient-to-r from-indigo-500 to-blue-500"></div>
      <p className="font-semibold text-2xl mb-8 text-white">{text}</p>
      <select
        className="w-full p-5 rounded-xl bg-white/5 border border-white/10 focus:border-indigo-500 focus:ring-2 focus:ring-indigo-500/50 focus:outline-none text-white text-lg cursor-pointer"
        value={savedAnswer || ''} onChange={(e) => onAnswerChange(question._id, e.target.value)}
      >
        <option value="" disabled className="text-gray-500">Select an option</option>
        {options.map((opt, i) => ( <option key={i} value={opt} className="bg-slate-800 text-white">{opt}</option> ))}
      </select>
    </div>
  );
};
export default DropdownRenderer;