// client/src/components/builder/CategorizeBuilder.jsx
import { useState, useRef, useEffect } from 'react';
import axios from 'axios'; 

const CategorizeBuilder = ({ onSave, onCancel, initialData = null }) => {
  const [categories, setCategories] = useState(['Category 1', 'Category 2']);
  const [items, setItems] = useState([{ text: '', category: 'Category 1' }]);
  const [imageFile, setImageFile] = useState(null);
  const [imagePreview, setImagePreview] = useState('');
  const fileInputRef = useRef(null);

  useEffect(() => {
    if (initialData) {
      const data = initialData.content || initialData;
      setCategories(data.categories || ['Category 1', 'Category 2']);
      setItems(data.items || [{ text: '', category: 'Category 1' }]);
      setImagePreview(data.image || '');
    }
  }, [initialData]);

  const handleCategoryChange = (index, value) => {
    const oldCategoryName = categories[index];
    const newCategories = [...categories];
    newCategories[index] = value;
    setCategories(newCategories);
    setItems(items.map(item => item.category === oldCategoryName ? { ...item, category: value } : item));
  };

  const addCategory = () => setCategories([...categories, `Category ${categories.length + 1}`]);
  const removeCategory = (index) => {
    if (categories.length <= 2) return alert('You need at least 2 categories.');
    const categoryToRemove = categories[index];
    const newCategories = categories.filter((_, i) => i !== index);
    setCategories(newCategories);
    setItems(items.map(item => item.category === categoryToRemove ? { ...item, category: newCategories[0] } : item));
  };

  const handleItemChange = (index, field, value) => {
    const newItems = [...items];
    newItems[index][field] = value;
    setItems(newItems);
  };
  const addItem = () => setItems([...items, { text: '', category: categories[0] || '' }]);
  const removeItem = (index) => {
    if (items.length <= 1) return alert('You need at least 1 item.');
    setItems(items.filter((_, i) => i !== index));
  };

  const handleQuestionImageUpload = (event) => {
    const file = event.target.files[0];
    if (!file) return;
    setImageFile(file);
    setImagePreview(URL.createObjectURL(file));
  };

  const handleSave = async () => {
    if (categories.some(c => !c.trim()) || items.some(i => !i.text.trim())) return alert('Please fill out all category and item fields.');
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
    onSave({ _id: initialData?._id, type: 'Categorize', content: { categories, items, image: imageUrl } });
  };

  return (
    <div className="p-8 shadow-2xl animate-fadeIn bg-slate-900 text-white rounded-xl border border-emerald-500/20 relative">
      <div className="absolute top-0 left-0 w-full h-1 bg-gradient-to-r from-emerald-500 to-teal-500 rounded-t-xl"></div>
      
      <div className="flex justify-between items-center mb-6 pb-4 border-b border-white/10">
        <h3 className="text-xl font-bold text-white tracking-tight">{initialData ? 'Edit' : 'Create'} Categorize</h3>
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
        <div className="mb-6 p-4 border rounded-xl flex items-center gap-4 bg-white/5 border-white/10">
          <img src={imagePreview} alt="Preview" className="w-16 h-16 object-cover rounded-lg shadow-md"/>
          <div className="flex-grow">
            <p className="font-semibold text-white">Image Uploaded</p>
            <p className="text-xs truncate text-white/50">{imageFile?.name || 'Linked Image'}</p>
          </div>
          <button onClick={() => { setImagePreview(''); setImageFile(null); }} className="text-red-400 hover:text-red-300 text-sm font-semibold bg-red-500/10 px-3 py-1 rounded-md">Remove</button>
        </div>
      )}

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
        <div>
            <div className="flex justify-between items-center mb-4">
                <h4 className="font-semibold text-lg text-white">Categories</h4>
                <button onClick={addCategory} className="text-xs py-1.5 px-3 rounded-md transition-colors bg-emerald-600/20 text-emerald-400 hover:bg-emerald-600/40 border border-emerald-500/30">+ Add</button>
            </div>
            <div className="space-y-3">
                {categories.map((category, index) => (
                <div key={index} className="flex gap-3 items-center bg-white/[0.02] p-2 rounded-xl border border-white/5">
                    <div className="flex-shrink-0 w-8 h-8 rounded-lg flex items-center justify-center font-bold text-sm bg-white/10 text-white shadow-inner">{index + 1}</div>
                    <input
                        type="text" className="flex-grow w-full p-2.5 rounded-lg focus:ring-2 focus:ring-emerald-500 focus:outline-none bg-white/5 border border-white/10 text-white transition-all"
                        value={category} onFocus={(e) => e.target.select()} onChange={(e) => handleCategoryChange(index, e.target.value)} placeholder={`Category Name`}
                    />
                    <button onClick={() => removeCategory(index)} className="p-2 text-white/40 hover:text-red-400 hover:bg-red-500/10 rounded-lg transition-colors">✕</button>
                </div>
                ))}
            </div>
        </div>

        <div>
            <div className="flex justify-between items-center mb-4">
                <h4 className="font-semibold text-lg text-white">Items</h4>
                <button onClick={addItem} className="text-xs py-1.5 px-3 rounded-md transition-colors bg-emerald-600/20 text-emerald-400 hover:bg-emerald-600/40 border border-emerald-500/30">+ Add Item</button>
            </div>
            
            <div className="space-y-3 max-h-[400px] overflow-y-auto overflow-x-hidden pr-2 custom-scrollbar">
                {items.map((item, index) => (
                  <div key={index} className="flex gap-3 items-center w-full bg-white/[0.02] p-2 rounded-xl border border-white/5">
                      <input
                        type="text" className="flex-grow min-w-0 p-2.5 rounded-lg focus:ring-2 focus:ring-emerald-500 focus:outline-none bg-white/5 border border-white/10 text-white transition-all"
                        placeholder="Item content..." value={item.text} onChange={(e) => handleItemChange(index, 'text', e.target.value)}
                      />
                      <div className="flex-shrink-0 relative group" title="Select Category Number">
                        <select
                            className="w-16 p-2.5 pr-1 rounded-lg font-bold text-center focus:ring-2 focus:ring-emerald-500 focus:outline-none cursor-pointer appearance-none bg-slate-800 border border-white/20 text-white transition-all"
                            value={item.category} onChange={(e) => handleItemChange(index, 'category', e.target.value)}
                        >
                            {categories.map((cat, catIndex) => ( <option key={catIndex} value={cat} className="bg-slate-800 text-white">{catIndex + 1}</option> ))}
                        </select>
                        <div className="absolute inset-y-0 right-3 flex items-center pointer-events-none text-white/50"><span className="text-xs">▼</span></div>
                      </div>
                      <button onClick={() => removeItem(index)} className="flex-shrink-0 p-2 text-white/40 hover:text-red-400 hover:bg-red-500/10 rounded-lg transition-colors">✕</button>
                  </div>
                ))}
            </div>
        </div>
      </div>

      <div className="flex justify-end gap-4 mt-10 pt-6 border-t border-white/10">
        <button onClick={onCancel} className="px-6 py-3 rounded-xl font-medium transition-colors bg-white/5 text-white/80 hover:bg-white/10 border border-white/10">Cancel</button>
        <button onClick={handleSave} className="bg-emerald-600 text-white font-semibold py-3 px-8 rounded-xl hover:bg-emerald-500 shadow-lg shadow-emerald-500/25 transition-all">Save Question</button>
      </div>
    </div>
  );
};
export default CategorizeBuilder;