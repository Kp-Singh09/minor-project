const EmailRenderer = ({ question, onAnswerChange, theme, savedAnswer }) => {
  const content = question.content || {};
  const text = content.question || content.text || 'Email Address';

  return (
    <div className={`p-6 rounded-lg shadow-md border ${theme.cardBg} border-white/10`}>
      <label className={`block font-semibold text-lg mb-2 ${theme.text}`}>
        {text}
      </label>
      <input
        type="email"
        className={`w-full p-3 rounded-md bg-black/20 border border-white/10 focus:border-indigo-500 focus:outline-none ${theme.text}`}
        placeholder="name@example.com"
        value={savedAnswer || ''}
        onChange={(e) => onAnswerChange(question._id, e.target.value)}
      />
    </div>
  );
};
export default EmailRenderer;