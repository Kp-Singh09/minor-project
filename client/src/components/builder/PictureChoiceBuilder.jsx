// client/src/components/builder/PictureChoiceBuilder.jsx
import { useState, useEffect } from 'react';
import axios from 'axios';

// A single option with image upload
const PictureOption = ({ option, index, onOptionChange, onImageUpload, onRemove, onCorrectSet }) => {
  const [isUploading, setIsUploading] = useState(false);

  const handleFileChange = async (e) => {
    const file = e.target.files[0];
    if (!file) return;

    setIsUploading(true);
    try {
      const authResponse = await axios.get(`${import.meta.env.VITE_API_BASE_URL}/api/imagekit/auth`);
      const formData = new FormData();
      formData.append('file', file);
      formData.append('fileName', file.name);
      formData.append('publicKey', import.meta.env.VITE_IMAGEKIT_PUBLIC_KEY);
      formData.append('signature', authResponse.data.signature);
      formData.append('expire', authResponse.data.expire);
      formData.append('token', authResponse.data.token);

      const uploadResponse = await axios.post('https://upload.imagekit.io/api/v1/files/upload', formData);
      onImageUpload(index, uploadResponse.data.url);
    } catch (err) {
      alert('Failed to upload image.');
      console.error(err);
    } finally {
      setIsUploading(false);
    }
  };

  return (
    <div className="flex items-center gap-2 p-3 bg-gray-50 border border-gray-200 rounded-md">
      <input
        type="radio"
        name="correct-pic-answer"
        checked={option.isCorrect}
        onChange={() => onCorrectSet(index)}
        className="h-5 w-5 text-blue-600 focus:ring-blue-500 border-gray-300"
      />
      <div className="w-16 h-16 rounded-md border border-gray-300 bg-gray-100 flex-shrink-0">
        {option.image && <img src={option.image} alt="Option" className="w-full h-full object-cover rounded-md" />}
      </div>
      <input
        type="file"
        accept="image/*"
        onChange={handleFileChange}
        className="text-sm text-gray-700 file:mr-2 file:py-1 file:px-2 file:rounded-md file:border-0 file:text-sm file:font-semibold file:bg-blue-50 file:text-blue-700 hover:file:bg-blue-100"
        disabled={isUploading}
      />
      <button onClick={onRemove} className="text-red-500 hover:text-red-700 p-1 ml-auto" title="Remove option">
        &#x2715;
      </button>
    </div>
  );
};


const PictureChoiceBuilder = ({ onSave, onCancel, initialData = null }) => {
  const [questionText, setQuestionText] = useState('');
  const [options, setOptions] = useState([
    { image: '', isCorrect: true },
    { image: '', isCorrect: false }
  ]);

  useEffect(() => {
    if (initialData) {
      setQuestionText(initialData.text || 'Which one is correct?');
      if (initialData.options && initialData.options.length > 0) {
        setOptions(
          initialData.options.map(imgUrl => ({
            image: imgUrl,
            isCorrect: imgUrl === initialData.correctAnswer
          }))
        );
      }
    } else {
      setQuestionText('Which one is correct?');
    }
  }, [initialData]);

  const handleImageUpload = (index, url) => {
    const newOptions = [...options];
    newOptions[index].image = url;
    setOptions(newOptions);
  };

  const setCorrect = (index) => {
    setOptions(
      options.map((opt, i) => ({
        ...opt,
        isCorrect: i === index
      }))
    );
  };

  const addOption = () => setOptions([...options, { image: '', isCorrect: false }]);

  const removeOption = (index) => {
    if (options.length <= 2) return alert('Must have at least two options');
    setOptions(options.filter((_, i) => i !== index));
  };

  const handleSave = () => {
    const correctOption = options.find(opt => opt.isCorrect);
    if (options.some(opt => !opt.image)) {
      return alert("Please upload an image for all options.");
    }
    
    onSave({ 
      ...initialData, 
      type: 'PictureChoice', 
      text: questionText, 
      options: options.map(opt => opt.image), // Save only the image URLs
      correctAnswer: correctOption ? correctOption.image : null
    });
  };

  return (
    <div className="bg-white p-6 rounded-lg border border-gray-200 shadow-md mt-6 animate-fadeIn">
      <h3 className="text-xl font-bold text-gray-900 mb-4">Edit Picture Choice</h3>
      
      <label className="block text-gray-700 font-semibold mb-2">Question Text</label>
      <input
        type="text"
        className="w-full p-3 bg-gray-50 border border-gray-300 rounded-md text-gray-900 mb-4 focus:ring-2 focus:ring-blue-500 focus:outline-none"
        placeholder="Enter your question"
        value={questionText}
        onChange={(e) => setQuestionText(e.target.value)}
      />

      <label className="block text-gray-700 font-semibold mb-2">Options (Select the correct one)</label>
      <div className="space-y-3">
        {options.map((option, index) => (
          <PictureOption
            key={index}
            option={option}
            index={index}
            onImageUpload={handleImageUpload}
            onRemove={() => removeOption(index)}
            onCorrectSet={setCorrect}
          />
        ))}
      </div>
      <button onClick={addOption} className="mt-3 text-sm text-blue-600 hover:underline">
        + Add Picture
      </button>

      <div className="flex justify-end gap-4 mt-8 border-t border-gray-200 pt-4">
        <button onClick={onCancel} className="bg-gray-200 text-gray-800 py-2 px-5 rounded-md hover:bg-gray-300">Cancel</button>
        <button onClick={handleSave} className="bg-green-600 text-white py-2 px-5 rounded-md hover:bg-green-700">Save</button>
      </div>
    </div>
  );
};

export default PictureChoiceBuilder;