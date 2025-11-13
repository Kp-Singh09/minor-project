// client/src/components/builder/BannerBuilder.jsx
import { useState, useRef, useEffect } from 'react';
import axios from 'axios';

const BannerBuilder = ({ onSave, onCancel, initialData = null }) => {
  const [imageFile, setImageFile] = useState(null);
  const [imagePreview, setImagePreview] = useState('');
  const fileInputRef = useRef(null);

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
    <div className="bg-white p-6 rounded-lg border border-gray-200 shadow-md mt-6 animate-fadeIn">
      <h3 className="text-xl font-bold text-gray-900 mb-4">Edit Banner Image</h3>
      
      {!imagePreview && (
        <>
            <input type="file" ref={fileInputRef} onChange={handleImageUpload} style={{ display: 'none' }} accept="image/*" />
            <button 
                onClick={() => fileInputRef.current.click()} 
                className="w-full py-4 border-2 border-dashed border-gray-300 rounded-md text-gray-500 hover:bg-gray-50 hover:border-blue-500"
            >
                Click to Upload Banner Image
            </button>
        </>
      )}

      {imagePreview && (
        <div className="mb-4 p-3 bg-green-50 border border-green-200 rounded-lg flex flex-col items-center gap-4">
          <img src={imagePreview} alt="Preview" className="w-full max-h-48 object-cover rounded-md"/>
          <button onClick={() => { setImagePreview(''); setImageFile(null); fileInputRef.current.value = null; }} className="text-red-600 hover:text-red-800 text-sm font-semibold">
            Remove Image
          </button>
        </div>
      )}

      <div className="flex justify-end gap-4 mt-8 border-t border-gray-200 pt-4">
        <button onClick={onCancel} className="bg-gray-200 text-gray-800 py-2 px-5 rounded-md hover:bg-gray-300">Cancel</button>
        <button onClick={handleSave} className="bg-green-600 text-white py-2 px-5 rounded-md hover:bg-green-700">Save</button>
      </div>
    </div>
  );
};

export default BannerBuilder;