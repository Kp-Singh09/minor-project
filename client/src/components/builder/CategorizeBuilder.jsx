// client/src/components/builder/CategorizeBuilder.jsx
import { useState, useRef, useEffect } from 'react';
import axios from 'axios'; 

const CategorizeBuilder = ({ onSave, onCancel, initialData = null, theme }) => {
  const [categories, setCategories] = useState(['Category 1', 'Category 2']);
  const [items, setItems] = useState([{ text: '', category: 'Category 1' }]);
  const [imageFile, setImageFile] = useState(null);
  const [imagePreview, setImagePreview] = useState('');
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
    const updatedItems = items.map(item => {
      if (item.category === oldCategoryName) {
        return { ...item, category: value };
      }
      return item;
    });
    setItems(updatedItems);
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
    if (categories.some(c => !c.trim()) || items.some(i => !i.text.trim())) {
      alert('Please fill out all category and item fields.');
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
      type: 'Categorize', 
      content: {
        categories, 
        items, 
        image: imageUrl 
      }
    });
  };

  return (
    <div className={`p-6 animate-fadeIn rounded-lg ${currentTheme.cardBg}`}>
      {/* Header */}
      <div className={`flex justify-between items-center mb-6 pb-4 border-b ${isDark ? 'border-white/10' : 'border-gray-100'}`}>
        <h3 className={`text-xl font-bold ${currentTheme.text}`}>
          {initialData ? 'Edit' : 'Create'} Categorize Question
        </h3>
        {!imagePreview && (
          <>
            <input type="file" ref={fileInputRef} onChange={handleQuestionImageUpload} style={{ display: 'none' }} accept="image/*" />
            <button 
                onClick={() => fileInputRef.current.click()} 
                className={`text-sm py-2 px-4 rounded-md transition-colors font-medium border ${isDark ? 'bg-white/10 border-white/20 text-white hover:bg-white/20' : 'bg-gray-100 border-gray-200 text-gray-700 hover:bg-gray-200'}`}
            >
              + Add Image
            </button>
          </>
        )}
      </div>

      {imagePreview && (
        <div className={`mb-6 p-3 border rounded-lg flex items-center gap-4 ${isDark ? 'bg-white/5 border-white/10' : 'bg-green-50 border-green-200'}`}>
          <img src={imagePreview} alt="Preview" className="w-20 h-20 object-cover rounded-lg"/>
          <div className="flex-grow">
            <p className={`font-semibold ${currentTheme.text}`}>Image selected!</p>
            <p className={`text-xs truncate ${currentTheme.secondaryText}`}>{imageFile?.name || 'Uploaded Image'}</p>
          </div>
          <button onClick={() => { setImagePreview(''); setImageFile(null); }} className="text-red-500 hover:text-red-700 text-xs font-semibold">
            Remove
          </button>
        </div>
      )}

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
        
        {/* --- LEFT: Categories --- */}
        <div>
            <div className="flex justify-between items-center mb-2">
                <h4 className={`font-semibold text-lg ${currentTheme.text}`}>Categories</h4>
                <button 
                    onClick={addCategory} 
                    className={`text-xs py-1 px-3 rounded transition-colors ${isDark ? 'bg-blue-600 text-white hover:bg-blue-500' : 'bg-blue-100 text-blue-700 hover:bg-blue-200'}`}
                >
                    + Add
                </button>
            </div>
            <div className="space-y-3">
                {categories.map((category, index) => (
                <div key={index} className="flex gap-2 items-center">
                    {/* Number Badge */}
                    <div className={`flex-shrink-0 w-8 h-8 rounded-full flex items-center justify-center font-bold text-sm ${isDark ? 'bg-white/10 text-white' : 'bg-gray-200 text-gray-600'}`}>
                        {index + 1}
                    </div>
                    
                    <input
                        type="text"
                        className={`flex-grow w-full p-2 rounded-md focus:ring-2 focus:ring-blue-500 focus:outline-none ${currentTheme.input}`}
                        value={category}
                        onFocus={(e) => e.target.select()}
                        onChange={(e) => handleCategoryChange(index, e.target.value)}
                        placeholder={`Category Name`}
                    />
                    <button 
                        onClick={() => removeCategory(index)}
                        className={`p-1 ${currentTheme.secondaryText} hover:text-red-500`}
                        title="Remove Category"
                    >
                        ✕
                    </button>
                </div>
                ))}
            </div>
        </div>

        {/* --- RIGHT: Items --- */}
        <div>
            <div className="flex justify-between items-center mb-2">
                <h4 className={`font-semibold text-lg ${currentTheme.text}`}>Items</h4>
                <button 
                    onClick={addItem} 
                    className={`text-xs py-1 px-3 rounded transition-colors ${isDark ? 'bg-blue-600 text-white hover:bg-blue-500' : 'bg-blue-100 text-blue-700 hover:bg-blue-200'}`}
                >
                    + Add Item
                </button>
            </div>
            
            <div className="space-y-3 max-h-[400px] overflow-y-auto overflow-x-hidden pr-2">
                {items.map((item, index) => (
                  <div key={index} className="flex gap-2 items-center w-full">
                      
                      {/* Item Text Input */}
                      <input
                        type="text"
                        className={`flex-grow min-w-0 p-2 rounded-md focus:ring-2 focus:ring-blue-500 focus:outline-none ${currentTheme.input}`}
                        placeholder="Item content..."
                        value={item.text}
                        onChange={(e) => handleItemChange(index, 'text', e.target.value)}
                      />

                      {/* Small Number Dropdown */}
                      <div className="flex-shrink-0 relative group" title="Select Category Number">
                        <select
                            className={`w-16 p-2 pr-1 rounded-md font-bold text-center focus:ring-2 focus:ring-blue-500 focus:outline-none cursor-pointer appearance-none ${currentTheme.input}`}
                            value={item.category}
                            onChange={(e) => handleItemChange(index, 'category', e.target.value)}
                        >
                            {categories.map((cat, catIndex) => (
                                <option key={catIndex} value={cat}>
                                    {catIndex + 1}
                                </option>
                            ))}
                        </select>
                        <div className={`absolute inset-y-0 right-3 flex items-center pointer-events-none ${currentTheme.secondaryText}`}>
                            <span className="text-xs">▼</span>
                        </div>
                      </div>

                      {/* Delete Button */}
                      <button 
                          onClick={() => removeItem(index)}
                          className={`flex-shrink-0 p-1 ${currentTheme.secondaryText} hover:text-red-500`}
                          title="Remove Item"
                      >
                          🗑️
                      </button>
                  </div>
                ))}
            </div>
        </div>
      </div>

      <div className={`flex justify-end gap-4 mt-8 pt-6 border-t ${isDark ? 'border-white/10' : 'border-gray-200'}`}>
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

export default CategorizeBuilder;