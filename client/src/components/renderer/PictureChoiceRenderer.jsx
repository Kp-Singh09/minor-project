// client/src/components/renderer/PictureChoiceRenderer.jsx
import { useState } from 'react';

const PictureChoiceRenderer = ({ question, onAnswerChange, theme }) => {
  const [selected, setSelected] = useState(null);

  const handleSelection = (image) => {
    setSelected(image);
    onAnswerChange(question._id, image);
  };

  return (
    <div className={`p-6 rounded-lg shadow-md border ${theme.cardBg}`}>
      <p className={`font-semibold text-lg mb-4 ${theme.text}`}>{question.text}</p>
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        {question.options.map((image, index) => (
          <div
            key={index}
            onClick={() => handleSelection(image)}
            className={`rounded-lg overflow-hidden border-4 transition-all cursor-pointer ${
              selected === image ? 'border-blue-500 ring-4 ring-blue-500/50' : `border-transparent hover:border-blue-300`
            }`}
          >
            <img src={image} alt={`Option ${index + 1}`} className="w-full h-full object-cover" />
          </div>
        ))}
      </div>
    </div>
  );
};
export default PictureChoiceRenderer;