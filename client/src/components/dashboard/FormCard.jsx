import { motion, useMotionValue, useTransform } from 'framer-motion';
import { MoreVertical, Users, Activity, ExternalLink } from 'lucide-react';

export default function FormCard({ form }) {
  // 3D Tilt Effect Logic
  const x = useMotionValue(0);
  const y = useMotionValue(0);
  const rotateX = useTransform(y, [-100, 100], [10, -10]);
  const rotateY = useTransform(x, [-100, 100], [-10, 10]);

  function handleMouse(event) {
    const rect = event.currentTarget.getBoundingClientRect();
    x.set(event.clientX - rect.left - rect.width / 2);
    y.set(event.clientY - rect.top - rect.height / 2);
  }

  return (
    <motion.div
      style={{ rotateX, rotateY, perspective: 1000 }}
      onMouseMove={handleMouse}
      onMouseLeave={() => { x.set(0); y.set(0); }}
      whileHover={{ y: -5 }}
      className="glass-card p-6 group cursor-pointer border-white/5 hover:border-indigo-500/30 transition-colors relative overflow-hidden"
    >
      {/* Background Glow */}
      <div className="absolute -right-10 -top-10 w-32 h-32 bg-indigo-600/10 rounded-full blur-3xl group-hover:bg-indigo-600/20 transition-colors" />

      <div className="flex justify-between items-start mb-8">
        <div className="p-3 rounded-lg bg-white/5 border border-white/10 group-hover:border-indigo-500/50 transition-colors">
          <Activity className="text-indigo-400" size={20} />
        </div>
        <button className="text-white/20 hover:text-white transition-colors">
          <MoreVertical size={20} />
        </button>
      </div>

      <h3 className="text-xl font-bold text-white/90 mb-2 group-hover:text-white transition-colors">
        {form.title || "Untitled Form"}
      </h3>
      
      <div className="flex items-center gap-4 text-sm text-white/40">
        <div className="flex items-center gap-1.5">
          <Users size={14} />
          <span>{form.responseCount || 0} responses</span>
        </div>
        <div className="w-1 h-1 rounded-full bg-white/10" />
        <span>Modified 2d ago</span>
      </div>

      <div className="mt-8 flex gap-2">
        <button className="flex-1 py-2 rounded-lg bg-indigo-500/10 hover:bg-indigo-500/20 text-indigo-400 text-xs font-semibold border border-indigo-500/20 transition-all">
          View Analytics
        </button>
        <button className="p-2 rounded-lg bg-white/5 hover:bg-white/10 text-white/60 transition-all">
          <ExternalLink size={16} />
        </button>
      </div>
    </motion.div>
  );
}