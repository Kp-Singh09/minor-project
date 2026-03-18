// client/src/components/builder/PictureChoiceBuilder.jsx
import { useState, useEffect } from 'react';
import axios from 'axios';

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
    } catch (err) { alert('Failed to upload image.'); } 
    finally { setIsUploading(false); }
  };

  return (
    <div className="flex items-center gap-4 bg-white/[0.02] p-3 rounded-xl border border-white/5 hover:border-indigo-500/30 transition-colors">
      <input
        type="radio"
        name="correct-pic-answer"
        checked={option.isCorrect}
        onChange={() => onCorrectSet(index)}
        className="ml-2 h-5 w-5 text-indigo-500 focus:ring-indigo-500 border-white/20 bg-transparent cursor-pointer"
      />
      <div className="w-16 h-16 rounded-lg border border-white/10 bg-black/20 flex-shrink-0 overflow-hidden flex items-center justify-center">
        {option.image ? (
            <img src={option.image} alt="Option" className="w-full h-full object-cover" />
        ) : ( <span className="text-xs text-white/30">No Img</span> )}
      </div>
      <div className="flex-grow">
          <input
            type="file"
            accept="image/*"
            onChange={handleFileChange}
            className="block w-full text-sm text-white/60 file:mr-4 file:py-2 file:px-4 file:rounded-md file:border-0 file:text-sm file:font-semibold cursor-pointer file:bg-white/10 file:text-white hover:file:bg-white/20 transition-all"
            disabled={isUploading}
          />
          {isUploading && <span className="text-xs text-indigo-400 mt-1 block">Uploading to neural net...</span>}
      </div>
      <button onClick={onRemove} className="p-3 mr-1 rounded-lg transition-colors text-white/40 hover:text-red-400 hover:bg-red-500/10">✕</button>
    </div>
  );
};

const PictureChoiceBuilder = ({ onSave, onCancel, initialData = null }) => {
  const [questionText, setQuestionText] = useState('');
  const [options, setOptions] = useState([{ image: '', isCorrect: true }, { image: '', isCorrect: false }]);

  useEffect(() => {
    if (initialData) {
      const data = initialData.content || initialData;
      setQuestionText(data.question || data.text || 'Which one is correct?');
      if (data.options && data.options.length > 0) {
        setOptions(data.options.map(imgUrl => ({ image: imgUrl, isCorrect: imgUrl === data.correctAnswer })));
      }
    } else { setQuestionText('Which one is correct?'); }
  }, [initialData]);

  const handleImageUpload = (index, url) => {
    const newOptions = [...options];
    newOptions[index].image = url;
    setOptions(newOptions);
  };

  const setCorrect = (index) => setOptions(options.map((opt, i) => ({ ...opt, isCorrect: i === index })));
  const addOption = () => setOptions([...options, { image: '', isCorrect: false }]);
  const removeOption = (index) => {
    if (options.length <= 2) return alert('Must have at least two options');
    setOptions(options.filter((_, i) => i !== index));
  };

  const handleSave = () => {
    const correctOption = options.find(opt => opt.isCorrect);
    if (options.some(opt => !opt.image)) return alert("Please upload an image for all options.");
    onSave({ 
      _id: initialData?._id, type: 'PictureChoice', 
      content: { question: questionText, options: options.map(opt => opt.image), correctAnswer: correctOption ? correctOption.image : null }
    });
  };

  return (
    <div className="p-8 shadow-2xl animate-fadeIn bg-slate-900 text-white rounded-xl border border-indigo-500/20 relative">
      <div className="absolute top-0 left-0 w-full h-1 bg-gradient-to-r from-indigo-500 to-blue-500 rounded-t-xl"></div>
      <h3 className="text-xl font-bold mb-6 pb-4 border-b border-white/10 text-white tracking-tight">Edit Picture Choice</h3>
      
      <label className="block font-medium mb-2 text-white/70 text-sm uppercase tracking-wider">Question Text</label>
      <input
        type="text"
        className="w-full p-4 rounded-xl focus:ring-2 focus:ring-indigo-500 focus:border-transparent focus:outline-none mb-8 bg-white/5 border border-white/10 text-white placeholder-white/30 transition-all font-medium"
        placeholder="Enter your question"
        value={questionText}
        onChange={(e) => setQuestionText(e.target.value)}
      />

      <label className="block font-medium mb-3 text-white/70 text-sm uppercase tracking-wider">Options <span className="text-xs font-normal opacity-70 ml-1 normal-case tracking-normal">(Select correct image)</span></label>
      <div className="space-y-4">
        {options.map((option, index) => (
          <PictureOption key={index} option={option} index={index} onImageUpload={handleImageUpload} onRemove={() => removeOption(index)} onCorrectSet={setCorrect} />
        ))}
      </div>
      
      <button onClick={addOption} className="mt-6 text-sm font-medium py-3 px-6 rounded-xl transition-colors border border-dashed border-white/20 text-indigo-400 hover:bg-indigo-500/10 hover:border-indigo-500/50">
        + Add Picture Option
      </button>

      <div className="flex justify-end gap-4 mt-10 pt-6 border-t border-white/10">
        <button onClick={onCancel} className="px-6 py-3 rounded-xl font-medium transition-colors bg-white/5 text-white/80 hover:bg-white/10 border border-white/10">Cancel</button>
        <button onClick={handleSave} className="bg-indigo-600 text-white font-semibold py-3 px-8 rounded-xl hover:bg-indigo-500 shadow-lg shadow-indigo-500/25 transition-all">Save Question</button>
      </div>
    </div>
  );
};
export default PictureChoiceBuilder;