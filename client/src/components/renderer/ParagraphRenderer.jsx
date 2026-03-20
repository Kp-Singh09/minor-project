const ParagraphRenderer = ({ question }) => {
  const content = question.content || {};
  const text = content.question || content.text || '';

  return (
    <div className="p-8 rounded-2xl bg-white/[0.03] border border-white/5 relative">
        <div className="absolute top-8 left-0 w-1 h-16 bg-gradient-to-b from-amber-500 to-transparent rounded-r-full"></div>
        <p className="text-xl leading-relaxed whitespace-pre-wrap text-white/80 pl-4 font-medium">
            {text}
        </p>
    </div>
  );
};
export default ParagraphRenderer;