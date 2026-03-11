const ShortAnswerRenderer = ({ question, onAnswerChange, theme, savedAnswer }) => {
  const content = question.content || {};
  const text = content.question || content.text || 'Question';

  return (
    <div className={`p-6 rounded-lg shadow-md border ${theme.cardBg} border-white/10`}>
      <p className={`font-semibold text-lg mb-4 ${theme.text}`}>{text}</p>
      <input
        type="text"
        className={`w-full p-3 rounded-md bg-black/20 border border-white/10 focus:border-indigo-500 focus:outline-none ${theme.text}`}
        placeholder="Type your answer..."
        value={savedAnswer || ''}
        onChange={(e) => onAnswerChange(question._id, e.target.value)}
      />
    </div>
  );
};
export default ShortAnswerRenderer;