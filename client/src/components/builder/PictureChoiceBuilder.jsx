// client/src/components/builder/PictureChoiceBuilder.jsx
import { useState, useEffect } from 'react';
import axios from 'axios';

const PictureOption = ({ option, index, onOptionChange, onImageUpload, onRemove, onCorrectSet, theme, isDark }) => {
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
    <div className={`flex items-center gap-4 p-3 border rounded-md ${isDark ? 'bg-white/5 border-gray-600' : 'bg-gray-50 border-gray-200'}`}>
      <input
        type="radio"
        name="correct-pic-answer"
        checked={option.isCorrect}
        onChange={() => onCorrectSet(index)}
        className="h-5 w-5 text-blue-600 focus:ring-blue-500 border-gray-300 cursor-pointer"
      />
      <div className={`w-16 h-16 rounded-md border flex-shrink-0 overflow-hidden ${isDark ? 'border-gray-600 bg-gray-800' : 'border-gray-300 bg-gray-100'}`}>
        {option.image ? (
            <img src={option.image} alt="Option" className="w-full h-full object-cover" />
        ) : (
            <div className="w-full h-full flex items-center justify-center text-xs text-gray-400">No Img</div>
        )}
      </div>
      
      <div className="flex-grow">
          <input
            type="file"
            accept="image/*"
            onChange={handleFileChange}
            className={`block w-full text-sm file:mr-4 file:py-2 file:px-4 file:rounded-md file:border-0 file:text-sm file:font-semibold cursor-pointer ${isDark ? 'text-gray-300 file:bg-gray-700 file:text-white hover:file:bg-gray-600' : 'text-gray-700 file:bg-blue-50 file:text-blue-700 hover:file:bg-blue-100'}`}
            disabled={isUploading}
          />
          {isUploading && <span className="text-xs text-blue-500 mt-1">Uploading...</span>}
      </div>

      <button onClick={onRemove} className="text-red-500 hover:text-red-700 p-2" title="Remove option">
        &#x2715;
      </button>
    </div>
  );
};

const PictureChoiceBuilder = ({ onSave, onCancel, initialData = null, theme }) => {
  const [questionText, setQuestionText] = useState('');
  const [options, setOptions] = useState([
    { image: '', isCorrect: true },
    { image: '', isCorrect: false }
  ]);

  const currentTheme = theme || { 
    name: 'Light',
    cardBg: 'bg-white', 
    text: 'text-gray-900', 
    input: 'bg-white border-gray-300 text-gray-900' 
  };
  const isDark = ['Dark', 'Navy Pop', 'Futuristic', 'Cyber Dawn'].includes(currentTheme.name);

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
      options: options.map(opt => opt.image), 
      correctAnswer: correctOption ? correctOption.image : null
    });
  };

  return (
    <div className={`p-6 rounded-lg shadow-md animate-fadeIn border ${currentTheme.cardBg} ${isDark ? 'border-gray-600' : 'border-gray-200'}`}>
      <h3 className={`text-xl font-bold mb-4 pb-4 border-b ${currentTheme.text} ${isDark ? 'border-gray-600' : 'border-gray-100'}`}>Edit Picture Choice</h3>
      
      <label className={`block font-semibold mb-2 ${currentTheme.text}`}>Question Text</label>
      <input
        type="text"
        className={`w-full p-3 rounded-md focus:ring-2 focus:ring-blue-500 focus:outline-none mb-6 ${currentTheme.input}`}
        placeholder="Enter your question"
        value={questionText}
        onChange={(e) => setQuestionText(e.target.value)}
      />

      <label className={`block font-semibold mb-3 ${currentTheme.text}`}>Options <span className="text-sm font-normal opacity-70">(Select the correct image)</span></label>
      <div className="space-y-3">
        {options.map((option, index) => (
          <PictureOption
            key={index}
            option={option}
            index={index}
            onImageUpload={handleImageUpload}
            onRemove={() => removeOption(index)}
            onCorrectSet={setCorrect}
            theme={currentTheme}
            isDark={isDark}
          />
        ))}
      </div>
      
      <button 
        onClick={addOption} 
        className={`mt-4 text-sm font-medium py-2 px-4 rounded-md transition-colors border border-dashed ${isDark ? 'border-gray-500 text-blue-400 hover:bg-white/5' : 'border-gray-300 text-blue-600 hover:bg-blue-50'}`}
      >
        + Add Picture
      </button>

      <div className={`flex justify-end gap-4 mt-8 pt-4 border-t ${isDark ? 'border-gray-600' : 'border-gray-200'}`}>
        <button onClick={onCancel} className={`px-6 py-2.5 rounded-lg font-medium transition-colors ${isDark ? 'bg-gray-700 text-white hover:bg-gray-600' : 'bg-gray-100 text-gray-700 hover:bg-gray-200'}`}>Cancel</button>
        <button onClick={handleSave} className="bg-green-600 text-white font-semibold py-2.5 px-6 rounded-lg hover:bg-green-700 shadow-md transition-colors">Save Question</button>
      </div>
    </div>
  );
};

export default PictureChoiceBuilder;