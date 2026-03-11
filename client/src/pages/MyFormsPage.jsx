// client/src/pages/MyFormsPage.jsx
import { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '@clerk/clerk-react';
import axios from '../api/axiosConfig';
import { 
  FileText, 
  MoreVertical, 
  ExternalLink, 
  Edit, 
  Trash2, 
  Loader2, 
  Eye 
} from 'lucide-react';
import toast from 'react-hot-toast';

export default function MyFormsPage() {
  const { userId, isLoaded } = useAuth();
  const navigate = useNavigate();
  const [forms, setForms] = useState([]);
  const [loading, setLoading] = useState(true);

  // 1. Fetch Forms
  useEffect(() => {
    const fetchForms = async () => {
      if (!userId) return;
      try {
        const res = await axios.get(`/api/forms/user/${userId}`);
        setForms(res.data);
      } catch (err) {
        console.error(err);
        toast.error("Failed to load inventory.");
      } finally {
        setLoading(false);
      }
    };

    if (isLoaded) fetchForms();
  }, [isLoaded, userId]);

  // 2. Handle Delete
  const handleDelete = async (formId) => {
    if (!confirm("Are you sure you want to delete this module?")) return;
    try {
      await axios.delete(`/api/forms/${formId}`);
      setForms(prev => prev.filter(f => f._id !== formId));
      toast.success("Module deleted.");
    } catch (err) {
      toast.error("Deletion failed.");
    }
  };

  // 3. Navigation Helpers
  const handleEdit = (id) => navigate(`/editor/${id}`);
  const handleView = (id) => window.open(`/form/${id}`, '_blank');

  if (loading) return (
    <div className="flex items-center justify-center h-[60vh] text-white">
      <Loader2 className="animate-spin" size={32} />
    </div>
  );

  return (
    <div className="max-w-7xl mx-auto p-6">
      <h2 className="text-4xl font-bold text-white mb-8">Detailed Inventory</h2>
      
      <div className="glass-card overflow-hidden border border-white/5 bg-white/[0.02] rounded-xl shadow-2xl">
        <table className="w-full text-left border-collapse">
          <thead>
            <tr className="bg-white/5 text-[10px] uppercase tracking-widest text-white/40 font-mono">
              <th className="px-6 py-4">Module Name</th>
              <th className="px-6 py-4">Privacy Status</th>
              <th className="px-6 py-4">Deployment Date</th>
              <th className="px-6 py-4 text-right">Actions</th>
            </tr>
          </thead>
          <tbody className="text-white/70">
            {forms.length === 0 ? (
              <tr>
                <td colSpan="4" className="px-6 py-12 text-center text-white/30 italic">
                  No modules detected in the neural core.
                </td>
              </tr>
            ) : (
              forms.map((form) => (
                <tr key={form._id} className="border-t border-white/5 hover:bg-white/[0.03] transition-colors group">
                  
                  {/* Module Name */}
                  <td className="px-6 py-4 flex items-center gap-3">
                    <div className="p-2 rounded-lg bg-indigo-500/10 text-indigo-400">
                      <FileText size={18} />
                    </div>
                    <div>
                      <span className="font-medium text-white text-sm block">{form.title}</span>
                      <span className="text-[10px] text-white/30 font-mono italic">ID: {form._id.slice(-6)}</span>
                    </div>
                  </td>

                  {/* Status */}
                  <td className="px-6 py-4">
                    <span className={`px-2 py-1 rounded-full text-[10px] font-bold uppercase border ${
                      form.settings?.privacy === 'public' 
                        ? 'bg-green-500/10 text-green-400 border-green-500/20' 
                        : 'bg-amber-500/10 text-amber-400 border-amber-500/20'
                    }`}>
                      {form.settings?.privacy || 'Public'}
                    </span>
                  </td>

                  {/* Date */}
                  <td className="px-6 py-4 text-xs font-mono text-white/40">
                    {new Date(form.createdAt).toLocaleDateString()}
                  </td>

                  {/* Actions */}
                  <td className="px-6 py-4 text-right">
                    <div className="flex justify-end gap-2 opacity-50 group-hover:opacity-100 transition-opacity">
                      
                      {/* View Live */}
                      <button 
                        onClick={() => handleView(form._id)}
                        className="p-2 hover:bg-indigo-500/20 rounded-lg transition-colors text-indigo-400" 
                        title="View Live Form"
                      >
                        <ExternalLink size={16} />
                      </button>

                      {/* Edit */}
                      <button 
                        onClick={() => handleEdit(form._id)}
                        className="p-2 hover:bg-blue-500/20 rounded-lg transition-colors text-blue-400" 
                        title="Edit in Builder"
                      >
                        <Edit size={16} />
                      </button>

                      {/* Delete */}
                      <button 
                        onClick={() => handleDelete(form._id)}
                        className="p-2 hover:bg-rose-500/20 rounded-lg transition-colors text-rose-400" 
                        title="Delete Form"
                      >
                        <Trash2 size={16} />
                      </button>

                    </div>
                  </td>
                </tr>
              ))
            )}
          </tbody>
        </table>
      </div>
    </div>
  );
}