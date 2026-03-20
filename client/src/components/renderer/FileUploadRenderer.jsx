// client/src/components/renderer/FileUploadRenderer.jsx
import { useState, useRef } from 'react';
import { UploadCloud, CheckCircle, Loader2, File } from 'lucide-react';
import axios from '../../api/axiosConfig';
import toast from 'react-hot-toast';

export default function FileUploadRenderer({ question, onAnswerChange, savedAnswer }) {
  const content = question.content || question;
  const [uploading, setUploading] = useState(false);
  const fileInputRef = useRef(null);

  const handleFileChange = async (e) => {
    const file = e.target.files[0];
    if (!file) return;

    setUploading(true);
    try {
      // Reuse your existing ImageKit auth endpoint
      const authResponse = await axios.get(`/api/imagekit/auth`);
      
      const formData = new FormData();
      formData.append('file', file);
      formData.append('fileName', file.name);
      formData.append('publicKey', import.meta.env.VITE_IMAGEKIT_PUBLIC_KEY);
      formData.append('signature', authResponse.data.signature);
      formData.append('expire', authResponse.data.expire);
      formData.append('token', authResponse.data.token);
      
      // Upload directly to ImageKit
      const uploadResponse = await axios.post('https://upload.imagekit.io/api/v1/files/upload', formData);
      const fileUrl = uploadResponse.data.url;
      
      // Save the generated URL as the answer
      onAnswerChange(question._id, fileUrl);
      toast.success("File uploaded successfully");
    } catch (err) {
      console.error(err);
      toast.error("Upload failed. Please try again.");
    } finally {
      setUploading(false);
    }
  };

  return (
    <div className="space-y-6 w-full animate-fadeIn">
      <div className="flex items-center gap-3 mb-6 border-b border-white/10 pb-6">
        <UploadCloud className="text-pink-400 shrink-0" size={28} />
        <h2 className="text-2xl font-bold text-white tracking-tight">
          {content.question || 'Upload your document'}
        </h2>
      </div>

      <input 
        type="file" 
        ref={fileInputRef} 
        onChange={handleFileChange} 
        className="hidden" 
      />

      <div 
        onClick={() => !uploading && fileInputRef.current.click()}
        className={`w-full border-2 border-dashed rounded-2xl p-10 flex flex-col items-center justify-center gap-4 transition-all
          ${savedAnswer ? 'border-emerald-500/50 bg-emerald-500/10' : 'border-white/20 bg-white/5 cursor-pointer hover:bg-white/10 hover:border-pink-500/50'}
          ${uploading ? 'opacity-50 cursor-not-allowed' : ''}
        `}
      >
        {uploading ? (
          <>
            <Loader2 className="animate-spin text-pink-500" size={40} />
            <p className="text-white/60 font-mono text-sm uppercase tracking-widest">Uploading Asset...</p>
          </>
        ) : savedAnswer ? (
          <>
            <CheckCircle className="text-emerald-400" size={40} />
            <p className="text-emerald-400 font-bold tracking-wide">File Uploaded Successfully</p>
            <a href={savedAnswer} target="_blank" rel="noopener noreferrer" className="text-xs text-white/40 hover:text-white underline mt-2" onClick={(e) => e.stopPropagation()}>
              View Uploaded File
            </a>
            <button onClick={(e) => { e.stopPropagation(); fileInputRef.current.click(); }} className="mt-4 text-xs font-mono uppercase tracking-widest text-white/30 hover:text-pink-400">
              Upload Different File
            </button>
          </>
        ) : (
          <>
            <File className="text-white/40" size={40} />
            <p className="text-white/60 font-mono text-sm uppercase tracking-widest">Click to browse files</p>
          </>
        )}
      </div>
    </div>
  );
}