const HeadingRenderer = ({ question }) => {
  const content = question.content || {};
  const text = content.question || content.text || '';

  return (
    <div className="py-6 border-b border-white/10 relative">
      <div className="absolute top-0 left-0 w-16 h-1 bg-gradient-to-r from-amber-500 to-orange-500 rounded-full"></div>
      <h2 className="text-4xl font-extrabold text-white tracking-tight pt-2">
        {text}
      </h2>
    </div>
  );
};
export default HeadingRenderer;