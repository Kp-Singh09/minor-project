// client/src/components/builder/ComprehensionBuilder.jsx
import { useState, useRef, useEffect } from 'react';
import axios from 'axios';

const ComprehensionBuilder = ({ onSave, onCancel, initialData = null, theme }) => {
  const [passage, setPassage] = useState('');
  const [mcqs, setMcqs] = useState([{ questionText: '', options: ['', ''], correctAnswerIndex: 0 }]);
  const [imageFile, setImageFile] = useState(null);
  const [imagePreview, setImagePreview] = useState('');
  const fileInputRef = useRef(null);

  // Default theme fallback
  const currentTheme = theme || { 
    name: 'Light',
    cardBg: 'bg-white', 
    text: 'text-gray-900', 
    secondaryText: 'text-gray-500', 
    input: 'bg-white border-gray-300 text-gray-900' 
  };

  // Helper to detect ANY dark theme
  const isDark = ['Dark', 'Navy Pop', 'Futuristic', 'Cyber Dawn'].includes(currentTheme.name);

  useEffect(() => {
    if (initialData) {
      setPassage(initialData.comprehensionPassage || '');
      const initialMcqs = initialData.mcqs.map(mcq => ({
        ...mcq,
        correctAnswerIndex: mcq.options.indexOf(mcq.correctAnswer)
      }));
      setMcqs(initialMcqs);
      setImagePreview(initialData.image || '');
    }
  }, [initialData]);

  // ... (Keep existing handlers: handleMcqChange, handleOptionChange, etc.)
  const handleMcqChange = (index, field, value) => {
    const newMcqs = [...mcqs];
    newMcqs[index][field] = value;
    setMcqs(newMcqs);
  };

  const handleOptionChange = (mcqIndex, optionIndex, value) => {
    const newMcqs = [...mcqs];
    newMcqs[mcqIndex].options[optionIndex] = value;
    setMcqs(newMcqs);
  };

  const handleCorrectAnswerChange = (mcqIndex, optionIndex) => {
    const newMcqs = [...mcqs];
    newMcqs[mcqIndex].correctAnswerIndex = optionIndex;
    setMcqs(newMcqs);
  };

  const addOption = (mcqIndex) => {
    const newMcqs = [...mcqs];
    newMcqs[mcqIndex].options.push('');
    setMcqs(newMcqs);
  };

  const removeOption = (mcqIndex, optionIndex) => {
    const newMcqs = [...mcqs];
    if (newMcqs[mcqIndex].options.length > 2) {
      newMcqs[mcqIndex].options.splice(optionIndex, 1);
      if (newMcqs[mcqIndex].correctAnswerIndex >= newMcqs[mcqIndex].options.length) {
        newMcqs[mcqIndex].correctAnswerIndex = newMcqs[mcqIndex].options.length - 1;
      }
      setMcqs(newMcqs);
    } else {
      alert('A question must have at least two options.');
    }
  };

  const addMcq = () => {
    setMcqs([...mcqs, { questionText: '', options: ['', ''], correctAnswerIndex: 0 }]);
  };

  const handleQuestionImageUpload = (event) => {
    const file = event.target.files[0];
    if (!file) return;
    setImageFile(file);
    setImagePreview(URL.createObjectURL(file));
  };

  const handleSave = async () => {
    if (!passage.trim() || mcqs.some(q => !q.questionText.trim() || q.options.some(opt => !opt.trim()))) {
      alert('Please fill in the passage, all question texts, and all option fields.');
      return;
    }
    let imageUrl = imagePreview;
    if (imageFile) {
      try {
        const authResponse = await axios.get(`${import.meta.env.VITE_API_BASE_URL}/api/imagekit/auth`);
        const formData = new FormData();
        formData.append('file', imageFile);
        formData.append('fileName', imageFile.name);
        formData.append('publicKey', import.meta.env.VITE_IMAGEKIT_PUBLIC_KEY);
        formData.append('signature', authResponse.data.signature);
        formData.append('expire', authResponse.data.expire);
        formData.append('token', authResponse.data.token);
        const uploadResponse = await axios.post('https://upload.imagekit.io/api/v1/files/upload', formData);
        imageUrl = uploadResponse.data.url;
      } catch (err) {
        alert('Failed to upload question image. Please try again.');
        console.error(err);
        return;
      }
    }
    const questionData = {
      type: 'Comprehension',
      comprehensionPassage: passage,
      mcqs: mcqs.map(q => ({
        questionText: q.questionText,
        options: q.options,
        correctAnswer: q.options[q.correctAnswerIndex]
      })),
      image: imageUrl,
    };
    onSave(questionData);
  };

  return (
    <div className={`p-6 animate-fadeIn rounded-lg ${currentTheme.cardBg}`}>
      <div className={`flex justify-between items-center mb-4 border-b pb-4 ${isDark ? 'border-white/10' : 'border-gray-200'}`}>
        <h3 className={`text-xl font-bold ${currentTheme.text}`}>{initialData ? 'Edit' : 'Create'} Comprehension Question</h3>
        {!imagePreview && (
          <>
            <input type="file" ref={fileInputRef} onChange={handleQuestionImageUpload} style={{ display: 'none' }} accept="image/*" />
            <button 
              onClick={() => fileInputRef.current.click()} 
              className={`text-sm py-2 px-4 rounded-md transition-colors font-medium border ${isDark ? 'bg-white/10 border-white/20 text-white hover:bg-white/20' : 'bg-gray-100 border-gray-200 text-gray-700 hover:bg-gray-200'}`}
            >
              Add Image
            </button>
          </>
        )}
      </div>

      {imagePreview && (
        <div className={`mb-4 p-3 rounded-lg flex items-center gap-4 ${isDark ? 'bg-white/5 border-white/10' : 'bg-green-50 border-green-200'}`}>
          <img src={imagePreview} alt="Preview" className="w-16 h-16 object-cover rounded-md"/>
          <div className="flex-grow">
            <p className={`font-semibold ${currentTheme.text}`}>Image selected!</p>
            <p className={`text-xs truncate ${currentTheme.secondaryText}`}>{imageFile?.name || ''}</p>
          </div>
          <button onClick={() => { setImagePreview(''); setImageFile(null); }} className="text-red-500 hover:text-red-700 text-xs font-semibold">
            Remove
          </button>
        </div>
      )}

      <label className={`block font-semibold mb-2 ${currentTheme.text}`}>Passage</label>
      <textarea
        className={`w-full p-3 rounded-md focus:ring-2 focus:ring-blue-500 focus:outline-none ${currentTheme.input}`}
        rows="6"
        placeholder="Enter the reading passage here..."
        value={passage}
        onChange={(e) => setPassage(e.target.value)}
      />

      <div className="mt-6">
        <h4 className={`font-semibold text-lg mb-4 ${currentTheme.text}`}>Multiple Choice Questions</h4>
        {mcqs.map((mcq, index) => (
          // FIX: Use isDark to determine background of the MCQ card
          <div key={index} className={`p-4 rounded-md mb-4 border ${isDark ? 'bg-white/5 border-white/10' : 'bg-gray-50 border-gray-200'}`}>
            <input
              type="text"
              className={`w-full p-2 mb-3 rounded-md focus:ring-2 focus:ring-blue-500 focus:outline-none ${currentTheme.input}`}
              placeholder={`Question ${index + 1}`}
              value={mcq.questionText}
              onChange={(e) => handleMcqChange(index, 'questionText', e.target.value)}
            />
            <div className="pl-4 space-y-2">
              {mcq.options.map((option, optIndex) => (
                <div key={optIndex} className="flex items-center gap-2">
                  <input
                    type="radio"
                    name={`correct-answer-${index}`}
                    checked={mcq.correctAnswerIndex === optIndex}
                    onChange={() => handleCorrectAnswerChange(index, optIndex)}
                    className="h-5 w-5 text-blue-600 focus:ring-blue-500 border-gray-300"
                  />
                  <input
                    type="text"
                    className={`w-full p-2 rounded-md focus:ring-2 focus:ring-blue-500 focus:outline-none ${currentTheme.input}`}
                    placeholder={`Option ${optIndex + 1}`}
                    value={option}
                    onChange={(e) => handleOptionChange(index, optIndex, e.target.value)}
                  />
                  <button
                    onClick={() => removeOption(index, optIndex)}
                    className="text-red-500 hover:text-red-700 p-1 rounded-full"
                    title="Remove option"
                  >
                    &#x2715;
                  </button>
                </div>
              ))}
              <button onClick={() => addOption(index)} className="mt-2 text-sm text-blue-500 hover:underline">
                + Add Option
              </button>
            </div>
          </div>
        ))}
        <button onClick={addMcq} className="text-sm bg-blue-600 text-white py-2 px-4 rounded-md hover:bg-blue-700">
          Add Another MCQ
        </button>
      </div>

      <div className={`flex justify-end gap-4 mt-8 pt-4 border-t ${isDark ? 'border-white/10' : 'border-gray-200'}`}>
        <button 
          onClick={onCancel} 
          className={`px-6 py-2.5 rounded-lg font-medium transition-colors ${isDark ? 'bg-white/10 text-white hover:bg-white/20' : 'bg-gray-100 text-gray-700 hover:bg-gray-200'}`}
        >
          Cancel
        </button>
        {/* --- STANDARDIZED BUTTON --- */}
        <button onClick={handleSave} className="bg-green-600 text-white font-semibold py-2.5 px-6 rounded-lg hover:bg-green-700 shadow-md transition-colors">Save Question</button>
      </div>
    </div>
  );
};

export default ComprehensionBuilder;