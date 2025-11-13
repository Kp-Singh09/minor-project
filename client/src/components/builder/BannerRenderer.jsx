// client/src/components/renderer/BannerRenderer.jsx
import React from 'react';

const BannerRenderer = ({ imageSrc, theme }) => {
  if (!imageSrc) return null;
  return (
    <div className={`w-full rounded-lg overflow-hidden ${theme.cardBg}`}>
        <img src={imageSrc} alt="Form Banner" className="w-full h-auto object-cover" />
    </div>
  );
};

export default BannerRenderer;