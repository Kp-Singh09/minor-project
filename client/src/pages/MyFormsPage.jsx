// client/src/pages/MyFormsPage.jsx
import { FileText, MoreVertical, ExternalLink, Shield } from 'lucide-react';

export default function MyFormsPage() {
  return (
    <div className="max-w-7xl mx-auto">
      <h2 className="text-4xl font-bold text-white mb-8">Detailed Inventory</h2>
      <div className="glass-card overflow-hidden border-white/5 bg-white/[0.02]">
        <table className="w-full text-left border-collapse">
          <thead>
            <tr className="bg-white/5 text-[10px] uppercase tracking-widest text-white/40 font-mono">
              <th className="px-6 py-4">Module Name</th>
              <th className="px-6 py-4">Status</th>
              <th className="px-6 py-4">Deployment Date</th>
              <th className="px-6 py-4 text-right">Actions</th>
            </tr>
          </thead>
          <tbody className="text-white/70">
            <tr className="border-t border-white/5 hover:bg-white/[0.03] transition-colors group">
              <td className="px-6 py-4 flex items-center gap-3">
                <div className="p-2 rounded-lg bg-indigo-500/10 text-indigo-400">
                  <FileText size={18} />
                </div>
                <div>
                  <span className="font-medium text-white text-sm block">Sample Assessment</span>
                  <span className="text-[10px] text-white/30 font-mono italic">ID: 8x2-neural-core</span>
                </div>
              </td>
              <td className="px-6 py-4">
                <span className="px-2 py-1 rounded-full bg-green-500/10 text-green-400 text-[10px] font-bold uppercase border border-green-500/20">Active</span>
              </td>
              <td className="px-6 py-4 text-xs font-mono text-white/40">2026-02-20</td>
              <td className="px-6 py-4 text-right">
                <div className="flex justify-end gap-2">
                  <button className="p-2 hover:bg-white/10 rounded-lg transition-colors text-white/40 hover:text-white">
                    <ExternalLink size={16} />
                  </button>
                  <button className="p-2 hover:bg-white/10 rounded-lg transition-colors text-white/40 hover:text-white">
                    <MoreVertical size={16} />
                  </button>
                </div>
              </td>
            </tr>
          </tbody>
        </table>
      </div>
    </div>
  );
}