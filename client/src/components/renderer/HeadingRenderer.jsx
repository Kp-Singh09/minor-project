const HeadingRenderer = ({ question, theme }) => {
  const content = question.content || {};
  const text = content.question || content.text || '';

  return (
    <div className="py-4">
      <h2 className={`text-3xl font-bold ${theme.text} border-b border-white/10 pb-2`}>
        {text}
      </h2>
    </div>
  );
};
export default HeadingRenderer;