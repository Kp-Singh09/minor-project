// client/src/components/builder/BannerBuilder.jsx
import { useState, useRef, useEffect } from 'react';
import axios from 'axios';

const BannerBuilder = ({ onSave, onCancel, initialData = null, theme }) => {
  const [imageFile, setImageFile] = useState(null);
  const [imagePreview, setImagePreview] = useState('');
  const fileInputRef = useRef(null);

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
      setImagePreview(initialData.image || '');
    }
  }, [initialData]);

  const handleImageUpload = (event) => {
    const file = event.target.files[0];
    if (!file) return;
    setImageFile(file);
    setImagePreview(URL.createObjectURL(file));
  };

  const handleSave = async () => {
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
        alert('Failed to upload banner image. Please try again.');
        console.error(err);
        return;
      }
    }

    if (!imageUrl) {
        alert("Please upload an image for the banner.");
        return;
    }

    onSave({ ...initialData, type: 'Banner', image: imageUrl });
  };

  return (
    <div className={`p-6 rounded-lg shadow-md animate-fadeIn border ${currentTheme.cardBg} ${isDark ? 'border-gray-600' : 'border-gray-200'}`}>
      <h3 className={`text-xl font-bold mb-4 pb-4 border-b ${currentTheme.text} ${isDark ? 'border-gray-600' : 'border-gray-100'}`}>Edit Banner Image</h3>
      
      {!imagePreview && (
        <>
            <input type="file" ref={fileInputRef} onChange={handleImageUpload} style={{ display: 'none' }} accept="image/*" />
            <button 
                onClick={() => fileInputRef.current.click()} 
                className={`w-full py-4 border-2 border-dashed rounded-md transition-colors ${isDark ? 'border-gray-500 text-gray-300 hover:bg-white/5 hover:border-blue-400' : 'border-gray-300 text-gray-500 hover:bg-gray-50 hover:border-blue-500'}`}
            >
                Click to Upload Banner Image
            </button>
        </>
      )}

      {imagePreview && (
        <div className={`mb-4 p-3 rounded-lg flex flex-col items-center gap-4 border ${isDark ? 'bg-white/5 border-white/10' : 'bg-green-50 border-green-200'}`}>
          <img src={imagePreview} alt="Preview" className="w-full max-h-48 object-cover rounded-md"/>
          <button onClick={() => { setImagePreview(''); setImageFile(null); fileInputRef.current.value = null; }} className="text-red-600 hover:text-red-800 text-sm font-semibold">
            Remove Image
          </button>
        </div>
      )}

      <div className={`flex justify-end gap-4 mt-8 pt-4 border-t ${isDark ? 'border-gray-600' : 'border-gray-200'}`}>
        <button 
          onClick={onCancel} 
          className={`px-6 py-2.5 rounded-lg font-medium transition-colors ${isDark ? 'bg-gray-700 text-white hover:bg-gray-600' : 'bg-gray-100 text-gray-700 hover:bg-gray-200'}`}
        >
          Cancel
        </button>
        <button 
          onClick={handleSave} 
          className="bg-green-600 text-white font-semibold py-2.5 px-6 rounded-lg hover:bg-green-700 shadow-md transition-colors"
        >
          Save Question
        </button>
      </div>
    </div>
  );
};

export default BannerBuilder;