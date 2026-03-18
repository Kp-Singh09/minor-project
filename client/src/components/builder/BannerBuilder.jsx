// client/src/components/builder/BannerBuilder.jsx
import { useState, useRef, useEffect } from 'react';
import axios from 'axios';

const BannerBuilder = ({ onSave, onCancel, initialData = null }) => {
  const [imageFile, setImageFile] = useState(null);
  const [imagePreview, setImagePreview] = useState('');
  const fileInputRef = useRef(null);

  useEffect(() => {
    if (initialData) {
      const data = initialData.content || initialData;
      setImagePreview(data.image || '');
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
      } catch (err) { return alert('Failed to upload banner image.'); }
    }
    if (!imageUrl) return alert("Please upload an image for the banner.");
    onSave({ _id: initialData?._id, type: 'Banner', content: { image: imageUrl } });
  };

  return (
    <div className="p-8 shadow-2xl animate-fadeIn bg-slate-900 text-white rounded-xl border border-amber-500/20 relative">
      <div className="absolute top-0 left-0 w-full h-1 bg-gradient-to-r from-amber-500 to-orange-500 rounded-t-xl"></div>
      <h3 className="text-xl font-bold mb-6 pb-4 border-b border-white/10 text-white tracking-tight">Edit Banner Image</h3>
      
      {!imagePreview && (
        <>
            <input type="file" ref={fileInputRef} onChange={handleImageUpload} style={{ display: 'none' }} accept="image/*" />
            <button onClick={() => fileInputRef.current.click()} className="w-full py-8 border-2 border-dashed rounded-xl transition-colors border-white/20 text-white/50 hover:bg-white/5 hover:border-amber-400 hover:text-amber-400 font-medium tracking-wide">
                Click to Upload Banner Image
            </button>
        </>
      )}

      {imagePreview && (
        <div className="mb-4 p-4 rounded-xl flex flex-col items-center gap-4 border bg-white/[0.02] border-white/10">
          <img src={imagePreview} alt="Preview" className="w-full max-h-64 object-cover rounded-lg shadow-lg"/>
          <button onClick={() => { setImagePreview(''); setImageFile(null); fileInputRef.current.value = null; }} className="text-red-400 hover:text-red-300 text-sm font-semibold bg-red-500/10 px-4 py-2 rounded-lg transition-colors">
            Remove Image
          </button>
        </div>
      )}

      <div className="flex justify-end gap-4 mt-10 pt-6 border-t border-white/10">
        <button onClick={onCancel} className="px-6 py-3 rounded-xl font-medium transition-colors bg-white/5 text-white/80 hover:bg-white/10 border border-white/10">Cancel</button>
        <button onClick={handleSave} className="bg-amber-600 text-white font-semibold py-3 px-8 rounded-xl hover:bg-amber-500 shadow-lg shadow-amber-500/25 transition-all">Save Question</button>
      </div>
    </div>
  );
};
export default BannerBuilder;