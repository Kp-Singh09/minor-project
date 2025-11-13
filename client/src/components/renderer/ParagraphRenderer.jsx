// client/src/components/renderer/ParagraphRenderer.jsx
import React from 'react';

const ParagraphRenderer = ({ text, theme }) => {
  return (
    <p className={`text-base ${theme.secondaryText}`}>
      {text}
    </p>
  );
};

export default ParagraphRenderer;