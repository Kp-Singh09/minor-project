const BannerRenderer = ({ question }) => {
  const content = question.content || {};
  const image = content.image || '';

  if (!image) return null;

  return (
    <div className="w-full mb-8 rounded-2xl overflow-hidden shadow-2xl border border-white/10 relative">
      <div className="absolute inset-0 border-4 border-amber-500/20 rounded-2xl pointer-events-none z-10"></div>
      <img src={image} alt="Form Banner" className="w-full h-auto object-cover max-h-96" />
    </div>
  );
};
export default BannerRenderer;