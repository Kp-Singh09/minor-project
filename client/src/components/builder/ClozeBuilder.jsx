// src/components/builder/ClozeBuilder.jsx
import { useState, useRef } from 'react';
import axios from 'axios';

const ClozeBuilder = ({ onSave, onCancel }) => {
  const [options, setOptions] = useState([]);
  const [imageFile, setImageFile] = useState(null);
  const [imagePreview, setImagePreview] = useState('');
  const passageRef = useRef(null);
  const fileInputRef = useRef(null);

  // 👇 This is the fully corrected logic
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

    // Reset selection to avoid issues
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

    onSave({ type: 'Cloze', passage: finalPassage, options, image: imageUrl });
  };

  return (
    // ... (The JSX remains the same) ...
    <div className="bg-white p-6 rounded-lg border border-gray-200 shadow-md mt-6 animate-fadeIn">
      <div className="flex justify-between items-center mb-2">
        <h3 className="text-xl font-bold text-gray-900">Create Cloze (Fill-in-the-Blanks) Question</h3>
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

      <p className="text-sm text-gray-500 mb-4">
        Type your sentence below. Then, select a word and click "Make Blank" to create an answer option.
      </p>

      <div 
        ref={passageRef}
        contentEditable={true}
        className="w-full p-3 bg-gray-50 border border-gray-300 rounded-md text-gray-900 min-h-[100px] focus:ring-2 focus:ring-blue-500 focus:outline-none"
        suppressContentEditableWarning={true}
      >
        Your sentence with words to be blanked out goes here.
      </div>

      <button 
        onClick={handleMakeBlank} 
        className="my-4 bg-blue-600 text-white py-2 px-4 rounded-md hover:bg-blue-700"
      >
        Make Blank from Selection
      </button>

      <div className="mb-6">
        <h4 className="font-semibold text-lg mb-2 text-gray-800">Answer Options</h4>
        {options.length > 0 ? (
          <div className="bg-gray-100 p-4 rounded-md border border-gray-200">
            <ul className="flex flex-wrap gap-2">
              {options.map((option, index) => (
                <li key={index} className="bg-gray-300 text-gray-800 px-3 py-1 rounded-full text-sm">{option}</li>
              ))}
            </ul>
          </div>
        ) : (
          <p className="text-gray-500 italic">No answer options created yet.</p>
        )}
      </div>

      <div className="flex justify-end gap-4 mt-8 border-t border-gray-200 pt-4">
        <button onClick={onCancel} className="bg-gray-200 text-gray-800 py-2 px-5 rounded-md hover:bg-gray-300">Cancel</button>
        <button onClick={handleSave} className="bg-green-600 text-white py-2 px-5 rounded-md hover:bg-green-700">Save Question</button>
      </div>
    </div>
  );
};

export default ClozeBuilder;