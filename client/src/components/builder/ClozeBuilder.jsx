// client/src/components/builder/ClozeBuilder.jsx
import { useState, useRef, useEffect } from 'react';
import axios from 'axios';

const ClozeBuilder = ({ onSave, onCancel, initialData = null }) => {
  const [options, setOptions] = useState([]);
  const [imageFile, setImageFile] = useState(null);
  const [imagePreview, setImagePreview] = useState('');
  const passageRef = useRef(null);
  const fileInputRef = useRef(null);

  useEffect(() => {
    if (initialData) {
        const data = initialData.content || initialData;
        if (passageRef.current) passageRef.current.innerText = data.passage || '';
        setOptions(data.options || []);
        setImagePreview(data.image || '');
    }
  }, [initialData]);

  const handleMakeBlank = () => {
    const selection = window.getSelection();
    if (!selection.rangeCount || selection.isCollapsed) return alert('Please select a word or phrase from the passage to make it a blank.');
    const selectedText = selection.toString().trim();
    if (!selectedText) return;
    if (options.includes(selectedText)) return alert('This word has already been added as an option.');
    
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
    if (!finalPassage.includes('[BLANK]') || options.length === 0) return alert('Please create at least one blank in the passage.');
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
        } catch (err) { return alert('Failed to upload question image.'); }
    }
    onSave({ _id: initialData?._id, type: 'Cloze', content: { passage: finalPassage, options, image: imageUrl } });
  };

  return (
    <div className="p-8 shadow-2xl animate-fadeIn bg-slate-900 text-white rounded-xl border border-emerald-500/20 relative">
      <div className="absolute top-0 left-0 w-full h-1 bg-gradient-to-r from-emerald-500 to-teal-500 rounded-t-xl"></div>
      
      <div className="flex justify-between items-center mb-6 pb-4 border-b border-white/10">
        <h3 className="text-xl font-bold text-white tracking-tight">{initialData ? 'Edit' : 'Create'} Fill-in-the-Blanks</h3>
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

      <p className="text-sm mb-4 text-white/60">Type your sentence below. Highlight a word and click "Make Blank".</p>

      <div 
        ref={passageRef} contentEditable={true}
        className="w-full p-4 rounded-xl min-h-[120px] focus:ring-2 focus:ring-emerald-500 focus:outline-none bg-white/5 border border-white/10 text-white font-medium leading-relaxed"
        suppressContentEditableWarning={true}
      >
        {initialData ? '' : 'Your sentence with words to be blanked out goes here.'}
      </div>

      <button onClick={handleMakeBlank} className="my-4 bg-emerald-600/20 text-emerald-400 border border-emerald-500/30 py-2.5 px-6 rounded-lg hover:bg-emerald-600/40 transition-all font-medium">
        Make Blank from Selection
      </button>

      <div className="mt-4 mb-6">
        <h4 className="font-semibold text-lg mb-3 text-white">Answer Options Extracted</h4>
        {options.length > 0 ? (
          <div className="p-4 rounded-xl border bg-white/[0.02] border-white/10">
            <ul className="flex flex-wrap gap-2">
              {options.map((option, index) => (
                <li key={index} className="bg-emerald-500/20 text-emerald-300 border border-emerald-500/30 px-4 py-1.5 rounded-full text-sm font-semibold tracking-wide">{option}</li>
              ))}
            </ul>
          </div>
        ) : ( <p className="italic text-white/40">No answer options created yet.</p> )}
      </div>

      <div className="flex justify-end gap-4 mt-10 pt-6 border-t border-white/10">
        <button onClick={onCancel} className="px-6 py-3 rounded-xl font-medium transition-colors bg-white/5 text-white/80 hover:bg-white/10 border border-white/10">Cancel</button>
        <button onClick={handleSave} className="bg-emerald-600 text-white font-semibold py-3 px-8 rounded-xl hover:bg-emerald-500 shadow-lg shadow-emerald-500/25 transition-all">Save Question</button>
      </div>
    </div>
  );
};
export default ClozeBuilder;