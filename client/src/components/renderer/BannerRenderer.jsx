const BannerRenderer = ({ question }) => {
  const content = question.content || {};
  const image = content.image || '';

  if (!image) return null;

  return (
    <div className="w-full mb-6 rounded-xl overflow-hidden shadow-lg border border-white/10">
      <img src={image} alt="Form Banner" className="w-full h-auto object-cover max-h-64" />
    </div>
  );
};
export default BannerRenderer;