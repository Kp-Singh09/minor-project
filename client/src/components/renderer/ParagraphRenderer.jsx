const ParagraphRenderer = ({ question, theme }) => {
  const content = question.content || {};
  const text = content.question || content.text || '';

  return (
    <div className={`p-4 rounded-lg ${theme.cardBg}`}>
      <p className={`text-lg leading-relaxed whitespace-pre-wrap ${theme.text}`}>
        {text}
      </p>
    </div>
  );
};
export default ParagraphRenderer;