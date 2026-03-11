// src/components/builder/ClozeBuilder.jsx
import { useState, useRef, useEffect } from 'react';
import axios from 'axios';

const ClozeBuilder = ({ onSave, onCancel, initialData = null, theme }) => {
  const [options, setOptions] = useState([]);
  const [imageFile, setImageFile] = useState(null);
  const [imagePreview, setImagePreview] = useState('');
  const passageRef = useRef(null);
  const fileInputRef = useRef(null);

  // Default theme fallback
  const currentTheme = theme || { 
    name: 'Light',
    cardBg: 'bg-white', 
    text: 'text-gray-900', 
    secondaryText: 'text-gray-500', 
    input: 'bg-white border-gray-300 text-gray-900' 
  };

  const isDark = ['Dark', 'Navy Pop', 'Futuristic', 'Cyber Dawn'].includes(currentTheme.name);

  useEffect(() => {
    if (initialData) {
        const data = initialData.content || initialData;
        if (passageRef.current) {
            passageRef.current.innerText = data.passage || '';
        }
        setOptions(data.options || []);
        setImagePreview(data.image || '');
    }
  }, [initialData]);

  const handleMakeBlank = () => {
    const selection = window.getSelection();
    if (!selection.rangeCount || selection.isCollapsed) {
        alert('Please select a word or phrase from the passage to make it a blank.');
        return;
    }
    const selectedText = selection.toString().trim();
    if (!selectedText) return;
    if (options.includes(selectedText)) {
        alert('This word has already been added as an option.');
        return;
    }
    const range = selection.getRangeAt(0);
    const preSelectionRange = document.createRange();
    preSelectionRange.selectNodeContents(passageRef.current);
    preSelectionRange.setEnd(range.startContainer, range.startOffset);
    const preSelectionText = preSelectionRange.toString();
    const blankIndex = (preSelectionText.match(/\[BLANK\]/g) || []).length;
    range.deleteContents();
    const blankNode = document.createTextNode('[BLANK]');
    range.insertNode(blankNode);
    setOptions(prevOptions => {
        const newOptions = [...prevOptions];
        newOptions.splice(blankIndex, 0, selectedText);
        return newOptions;
    });
    selection.removeAllRanges();
  };
  
  const handleQuestionImageUpload = (event) => {
    const file = event.target.files[0];
    if (!file) return;
    setImageFile(file);
    setImagePreview(URL.createObjectURL(file));
  };

  const handleSave = async () => {
    const finalPassage = passageRef.current.innerText;
    if (!finalPassage.includes('[BLANK]') || options.length === 0) {
      alert('Please create at least one blank in the passage.');
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
    onSave({ 
      _id: initialData?._id,
      type: 'Cloze', 
      content: {
        passage: finalPassage, 
        options, 
        image: imageUrl 
      }
    });
  };

  return (
    <div className={`p-6 animate-fadeIn rounded-lg ${currentTheme.cardBg}`}>
      <div className={`flex justify-between items-center mb-4 border-b pb-4 ${isDark ? 'border-white/10' : 'border-gray-200'}`}>
        <h3 className={`text-xl font-bold ${currentTheme.text}`}>{initialData ? 'Edit' : 'Create'} Cloze (Fill-in-the-Blanks) Question</h3>
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

      <p className={`text-sm mb-4 ${currentTheme.secondaryText}`}>
        Type your sentence below. Then, select a word and click "Make Blank" to create an answer option.
      </p>

      <div 
        ref={passageRef}
        contentEditable={true}
        className={`w-full p-3 rounded-md min-h-[100px] focus:ring-2 focus:ring-blue-500 focus:outline-none ${currentTheme.input}`}
        suppressContentEditableWarning={true}
      >
        {initialData ? '' : 'Your sentence with words to be blanked out goes here.'}
      </div>

      <button 
        onClick={handleMakeBlank} 
        className="my-4 bg-blue-600 text-white py-2 px-4 rounded-md hover:bg-blue-700"
      >
        Make Blank from Selection
      </button>

      <div className="mb-6">
        <h4 className={`font-semibold text-lg mb-2 ${currentTheme.text}`}>Answer Options</h4>
        {options.length > 0 ? (
          <div className={`p-4 rounded-md border ${isDark ? 'bg-white/5 border-white/10' : 'bg-gray-50 border-gray-200'}`}>
            <ul className="flex flex-wrap gap-2">
              {options.map((option, index) => (
                <li key={index} className="bg-blue-200 text-blue-900 px-3 py-1 rounded-full text-sm font-semibold">{option}</li>
              ))}
            </ul>
          </div>
        ) : (
          <p className={`italic ${currentTheme.secondaryText}`}>No answer options created yet.</p>
        )}
      </div>

      <div className={`flex justify-end gap-4 mt-8 pt-4 border-t ${isDark ? 'border-white/10' : 'border-gray-200'}`}>
        <button 
          onClick={onCancel} 
          className={`px-6 py-2.5 rounded-lg font-medium transition-colors ${isDark ? 'bg-white/10 text-white hover:bg-white/20' : 'bg-gray-100 text-gray-700 hover:bg-gray-200'}`}
        >
          Cancel
        </button>
        <button onClick={handleSave} className="bg-green-600 text-white font-semibold py-2.5 px-6 rounded-lg hover:bg-green-700 shadow-md transition-colors">Save Question</button>
      </div>
    </div>
  );
};

export default ClozeBuilder;