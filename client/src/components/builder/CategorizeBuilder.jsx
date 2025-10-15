import { useState, useRef } from 'react';
import axios from 'axios'; 

const CategorizeBuilder = ({ onSave, onCancel }) => {
  const [categories, setCategories] = useState(['Category 1', 'Category 2']);
  const [items, setItems] = useState([{ text: '', category: 'Category 1' }]);
  const [imageFile, setImageFile] = useState(null);
  const [imagePreview, setImagePreview] = useState('');
  const fileInputRef = useRef(null);

  const handleCategoryChange = (index, value) => {
    const newCategories = [...categories];
    newCategories[index] = value;
    setCategories(newCategories);
  };

  const addCategory = () => setCategories([...categories, `Category ${categories.length + 1}`]);

  const handleItemChange = (index, field, value) => {
    const newItems = [...items];
    newItems[index][field] = value;
    setItems(newItems);
  };

  const addItem = () => setItems([...items, { text: '', category: categories[0] || '' }]);

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

    onSave({ type: 'Categorize', categories, items, image: imageUrl });
  };

  return (

    <div className="bg-white p-6 rounded-lg border border-gray-200 shadow-md mt-6 animate-fadeIn">
      <div className="flex justify-between items-center mb-4">
        <h3 className="text-xl font-bold text-gray-900">Create Categorize Question</h3>
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

      <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
        <div>
            <h4 className="font-semibold text-lg mb-2 text-gray-800">Categories</h4>
            <div className="space-y-2">
                {categories.map((category, index) => (
                <input
                    key={index}
                    type="text"
                    className="w-full p-2 bg-gray-50 border border-gray-300 rounded-md text-gray-900 focus:ring-2 focus:ring-blue-500 focus:outline-none"
                    value={category}
                    onChange={(e) => handleCategoryChange(index, e.target.value)}
                />
                ))}
            </div>
            <button onClick={addCategory} className="mt-3 text-sm bg-blue-600 text-white py-2 px-4 rounded-md hover:bg-blue-700">
                Add Category
            </button>
        </div>

        <div>
            <h4 className="font-semibold text-lg mb-2 text-gray-800">Items</h4>
            <div className="space-y-2">
                {items.map((item, index) => (
                  <div key={index} className="flex items-center gap-2 p-2 bg-gray-50 border border-gray-200 rounded-md">
                      <input
                        type="text"
                        className="flex-grow p-2 bg-white border border-gray-300 rounded-md text-gray-900 focus:ring-2 focus:ring-blue-500 focus:outline-none"
                        placeholder="Item name"
                        value={item.text}
                        onChange={(e) => handleItemChange(index, 'text', e.target.value)}
                      />
                      <select
                        className="p-2 border border-gray-300 rounded-md bg-white text-gray-900 focus:ring-2 focus:ring-blue-500 focus:outline-none"
                        value={item.category}
                        onChange={(e) => handleItemChange(index, 'category', e.target.value)}
                      >
                        {categories.map((cat, catIndex) => (
                            <option key={catIndex} value={cat}>{cat}</option>
                        ))}
                      </select>
                  </div>
                ))}
            </div>
            <button onClick={addItem} className="mt-3 text-sm bg-blue-600 text-white py-2 px-4 rounded-md hover:bg-blue-700">
                Add Item
            </button>
        </div>
      </div>

      <div className="flex justify-end gap-4 mt-8 border-t border-gray-200 pt-4">
        <button onClick={onCancel} className="bg-gray-200 text-gray-800 py-2 px-5 rounded-md hover:bg-gray-300">Cancel</button>
        <button onClick={handleSave} className="bg-green-600 text-white py-2 px-5 rounded-md hover:bg-green-700">Save Question</button>
      </div>
    </div>
  );
};

export default CategorizeBuilder;