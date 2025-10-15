import { useState, useRef } from 'react';
import axios from 'axios'; 

const ComprehensionBuilder = ({ onSave, onCancel }) => {
  const [passage, setPassage] = useState('');
  const [mcqs, setMcqs] = useState([{ questionText: '', options: ['', '', ''] }]);
  const [imageFile, setImageFile] = useState(null);
  const [imagePreview, setImagePreview] = useState('');
  const fileInputRef = useRef(null);

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

  const addMcq = () => setMcqs([...mcqs, { questionText: '', options: ['', '', ''] }]);

  const handleQuestionImageUpload = (event) => {
    const file = event.target.files[0];
    if (!file) return;
    setImageFile(file);
    setImagePreview(URL.createObjectURL(file));
  };

  const handleSave = async () => {
    if (!passage.trim() || mcqs.some(q => !q.questionText.trim())) {
      alert('Please fill in the passage and all question texts.');
      return;
    }

    let imageUrl = '';

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
      mcqs: mcqs.map(q => ({ ...q, correctAnswer: q.options[0] })),
      image: imageUrl,
    };
    onSave(questionData);
  };

  return (

    <div className="bg-white p-6 rounded-lg border border-gray-200 shadow-md mt-6 animate-fadeIn">
      <div className="flex justify-between items-center mb-4">
        <h3 className="text-xl font-bold text-gray-900">Create Comprehension Question</h3>
        {!imagePreview && (
          <>
            <input type="file" ref={fileInputRef} onChange={handleQuestionImageUpload} style={{ display: 'none' }} accept="image/*" />
            <button onClick={() => fileInputRef.current.click()} className="text-sm bg-gray-200 hover:bg-gray-300 text-gray-800 py-1 px-3 rounded-md">
              Add Image
            </button>
          </>
        )}
      </div>

      {imagePreview && (
        <div className="mb-4 p-3 bg-green-50 border border-green-200 rounded-lg flex items-center gap-4">
          <img src={imagePreview} alt="Preview" className="w-16 h-16 object-cover rounded-md"/>
          <div className="flex-grow">
            <p className="font-semibold text-green-800">Image selected!</p>
            <p className="text-xs text-gray-500 truncate">{imageFile.name}</p>
          </div>
          <button onClick={() => { setImagePreview(''); setImageFile(null); }} className="text-red-600 hover:text-red-800 text-xs font-semibold">
            Remove
          </button>
        </div>
      )}

      <label className="block text-gray-700 font-semibold mb-2">Passage</label>
      <textarea
        className="w-full p-3 bg-gray-50 border border-gray-300 rounded-md text-gray-900 focus:ring-2 focus:ring-blue-500 focus:outline-none"
        rows="6"
        placeholder="Enter the reading passage here..."
        value={passage}
        onChange={(e) => setPassage(e.target.value)}
      />

      <div className="mt-6">
        <h4 className="font-semibold text-lg mb-4 text-gray-800">Multiple Choice Questions</h4>
        {mcqs.map((mcq, index) => (
          <div key={index} className="bg-gray-50 p-4 rounded-md mb-4 border border-gray-200">
            <input
              type="text"
              className="w-full p-2 bg-white border border-gray-300 rounded-md mb-3 text-gray-900 focus:ring-2 focus:ring-blue-500 focus:outline-none"
              placeholder={`Question ${index + 1}`}
              value={mcq.questionText}
              onChange={(e) => handleMcqChange(index, 'questionText', e.target.value)}
            />
            <div className="pl-4 space-y-2">
              {mcq.options.map((option, optIndex) => (
                <input
                  key={optIndex}
                  type="text"
                  className="w-full p-2 bg-white border border-gray-300 rounded-md text-gray-900 focus:ring-2 focus:ring-blue-500 focus:outline-none"
                  placeholder={`Option ${optIndex + 1}${optIndex === 0 ? ' (Correct Answer)' : ''}`}
                  value={option}
                  onChange={(e) => handleOptionChange(index, optIndex, e.target.value)}
                />
              ))}
            </div>
          </div>
        ))}
        <button onClick={addMcq} className="text-sm bg-blue-600 text-white py-2 px-4 rounded-md hover:bg-blue-700">
          Add Another MCQ
        </button>
      </div>

      <div className="flex justify-end gap-4 mt-8 border-t border-gray-200 pt-4">
        <button onClick={onCancel} className="bg-gray-200 text-gray-800 py-2 px-5 rounded-md hover:bg-gray-300">Cancel</button>
        <button onClick={handleSave} className="bg-green-600 text-white py-2 px-5 rounded-md hover:bg-green-700">Save Question</button>
      </div>
    </div>
  );
};

export default ComprehensionBuilder;