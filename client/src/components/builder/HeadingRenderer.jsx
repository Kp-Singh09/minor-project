// client/src/components/renderer/HeadingRenderer.jsx
import React from 'react';

const HeadingRenderer = ({ text, theme }) => {
  return (
    <h2 className={`text-3xl font-bold ${theme.text}`}>
      {text}
    </h2>
  );
};

export default HeadingRenderer;