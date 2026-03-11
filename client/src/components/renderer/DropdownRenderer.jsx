const DropdownRenderer = ({ question, onAnswerChange, theme, savedAnswer }) => {
  const content = question.content || {};
  const text = content.question || content.text || 'Question';
  const options = content.options || [];

  return (
    <div className={`p-6 rounded-lg shadow-md border ${theme.cardBg} border-white/10`}>
      <p className={`font-semibold text-lg mb-4 ${theme.text}`}>{text}</p>
      <select
        className={`w-full p-3 rounded-md bg-black/20 border border-white/10 focus:border-indigo-500 focus:outline-none ${theme.text}`}
        value={savedAnswer || ''}
        onChange={(e) => onAnswerChange(question._id, e.target.value)}
      >
        <option value="" disabled>Select an option</option>
        {options.map((opt, i) => (
          <option key={i} value={opt} className="bg-slate-800">{opt}</option>
        ))}
      </select>
    </div>
  );
};
export default DropdownRenderer;