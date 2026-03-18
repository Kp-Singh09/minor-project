// client/src/components/builder/ComprehensionBuilder.jsx
import { useState, useRef, useEffect } from 'react';
import axios from 'axios';

const ComprehensionBuilder = ({ onSave, onCancel, initialData = null }) => {
  const [passage, setPassage] = useState('');
  const [mcqs, setMcqs] = useState([{ questionText: '', options: ['', ''], correctAnswerIndex: 0 }]);
  const [imageFile, setImageFile] = useState(null);
  const [imagePreview, setImagePreview] = useState('');
  const fileInputRef = useRef(null);

  useEffect(() => {
    if (initialData) {
      const data = initialData.content || initialData;
      setPassage(data.comprehensionPassage || '');
      const initialMcqs = (data.mcqs || []).map(mcq => ({ ...mcq, correctAnswerIndex: mcq.options.indexOf(mcq.correctAnswer) }));
      setMcqs(initialMcqs);
      setImagePreview(data.image || '');
    }
  }, [initialData]);

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
      if (newMcqs[mcqIndex].correctAnswerIndex >= newMcqs[mcqIndex].options.length) newMcqs[mcqIndex].correctAnswerIndex = newMcqs[mcqIndex].options.length - 1;
      setMcqs(newMcqs);
    } else { alert('A question must have at least two options.'); }
  };

  const addMcq = () => setMcqs([...mcqs, { questionText: '', options: ['', ''], correctAnswerIndex: 0 }]);

  const handleQuestionImageUpload = (event) => {
    const file = event.target.files[0];
    if (!file) return;
    setImageFile(file);
    setImagePreview(URL.createObjectURL(file));
  };

  const handleSave = async () => {
    if (!passage.trim() || mcqs.some(q => !q.questionText.trim() || q.options.some(opt => !opt.trim()))) {
      return alert('Please fill in the passage, all question texts, and all option fields.');
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
      } catch (err) { return alert('Failed to upload question image. Please try again.'); }
    }
    onSave({
      _id: initialData?._id, type: 'Comprehension',
      content: {
        comprehensionPassage: passage, image: imageUrl,
        mcqs: mcqs.map(q => ({ questionText: q.questionText, options: q.options, correctAnswer: q.options[q.correctAnswerIndex] }))
      }
    });
  };

  return (
    <div className="p-8 shadow-2xl animate-fadeIn bg-slate-900 text-white rounded-xl border border-emerald-500/20 relative">
      <div className="absolute top-0 left-0 w-full h-1 bg-gradient-to-r from-emerald-500 to-teal-500 rounded-t-xl"></div>
      
      <div className="flex justify-between items-center mb-6 pb-4 border-b border-white/10">
        <h3 className="text-xl font-bold text-white tracking-tight">{initialData ? 'Edit' : 'Create'} Comprehension</h3>
        {!imagePreview && (
          <>
            <input type="file" ref={fileInputRef} onChange={handleQuestionImageUpload} style={{ display: 'none' }} accept="image/*" />
            <button onClick={() => fileInputRef.current.click()} className="text-sm py-2 px-4 rounded-lg transition-colors font-medium border bg-white/5 border-white/10 text-white hover:bg-white/10">
              + Add Image
            </button>
          </>
        )}
      </div>

      {imagePreview && (
        <div className="mb-6 p-4 rounded-xl flex items-center gap-4 bg-white/5 border border-white/10">
          <img src={imagePreview} alt="Preview" className="w-16 h-16 object-cover rounded-lg shadow-md"/>
          <div className="flex-grow">
            <p className="font-semibold text-white">Image Uploaded</p>
            <p className="text-xs truncate text-white/50">{imageFile?.name || 'Linked Image'}</p>
          </div>
          <button onClick={() => { setImagePreview(''); setImageFile(null); }} className="text-red-400 hover:text-red-300 text-sm font-semibold bg-red-500/10 px-3 py-1 rounded-md">Remove</button>
        </div>
      )}

      <label className="block font-medium mb-2 text-white/70 text-sm uppercase tracking-wider">Passage</label>
      <textarea
        className="w-full p-4 rounded-xl focus:ring-2 focus:ring-emerald-500 focus:outline-none bg-white/5 border border-white/10 text-white placeholder-white/30 transition-all font-medium mb-8"
        rows="6" placeholder="Enter the reading passage here..." value={passage} onChange={(e) => setPassage(e.target.value)}
      />

      <div>
        <h4 className="font-semibold text-lg mb-4 text-white">Multiple Choice Questions</h4>
        {mcqs.map((mcq, index) => (
          <div key={index} className="p-5 rounded-xl mb-4 border bg-white/[0.02] border-white/10 shadow-inner">
            <input
              type="text"
              className="w-full p-3 mb-4 rounded-lg focus:ring-2 focus:ring-emerald-500 focus:outline-none bg-white/5 border border-white/10 text-white transition-all font-medium"
              placeholder={`Question ${index + 1}`} value={mcq.questionText} onChange={(e) => handleMcqChange(index, 'questionText', e.target.value)}
            />
            <div className="pl-2 space-y-3">
              {mcq.options.map((option, optIndex) => (
                <div key={optIndex} className="flex items-center gap-3">
                  <input
                    type="radio" name={`correct-answer-${index}`} checked={mcq.correctAnswerIndex === optIndex}
                    onChange={() => handleCorrectAnswerChange(index, optIndex)}
                    className="h-5 w-5 text-emerald-500 focus:ring-emerald-500 border-white/20 bg-transparent cursor-pointer"
                  />
                  <input
                    type="text" className="w-full p-2.5 rounded-lg focus:ring-2 focus:ring-emerald-500 focus:outline-none bg-white/5 border border-white/10 text-white transition-all"
                    placeholder={`Option ${optIndex + 1}`} value={option} onChange={(e) => handleOptionChange(index, optIndex, e.target.value)}
                  />
                  <button onClick={() => removeOption(index, optIndex)} className="text-white/40 hover:text-red-400 p-2 rounded-lg hover:bg-red-500/10 transition-colors">✕</button>
                </div>
              ))}
              <button onClick={() => addOption(index)} className="mt-2 text-sm text-emerald-400 hover:text-emerald-300 font-medium">+ Add Option</button>
            </div>
          </div>
        ))}
        <button onClick={addMcq} className="mt-2 text-sm bg-emerald-600/20 text-emerald-300 border border-emerald-500/30 py-2.5 px-5 rounded-lg hover:bg-emerald-600/40 transition-all font-medium">
          + Add Another MCQ
        </button>
      </div>

      <div className="flex justify-end gap-4 mt-10 pt-6 border-t border-white/10">
        <button onClick={onCancel} className="px-6 py-3 rounded-xl font-medium transition-colors bg-white/5 text-white/80 hover:bg-white/10 border border-white/10">Cancel</button>
        <button onClick={handleSave} className="bg-emerald-600 text-white font-semibold py-3 px-8 rounded-xl hover:bg-emerald-500 shadow-lg shadow-emerald-500/25 transition-all">Save Question</button>
      </div>
    </div>
  );
};
export default ComprehensionBuilder;