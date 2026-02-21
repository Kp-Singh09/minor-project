// client/src/components/Analytics/NeuralChart.jsx
import { motion } from 'framer-motion';

export default function NeuralChart({ data = [20, 45, 28, 80, 99, 43, 88] }) {
  const points = data.map((val, i) => `${(i / (data.length - 1)) * 100},${100 - val}`).join(' ');

  return (
    <div className="relative w-full h-48 mt-8">
      <svg viewBox="0 0 100 100" preserveAspectRatio="none" className="w-full h-full overflow-visible">
        {/* Gradient Definition */}
        <defs>
          <linearGradient id="lineGradient" x1="0" y1="0" x2="0" y2="1">
            <stop offset="0%" stopColor="#6366f1" stopOpacity="0.5" />
            <stop offset="100%" stopColor="#6366f1" stopOpacity="0" />
          </linearGradient>
        </defs>
        
        {/* Area Fill */}
        <motion.polyline
          fill="url(#lineGradient)"
          stroke="none"
          points={`0,100 ${points} 100,100`}
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ duration: 2 }}
        />

        {/* The Line */}
        <motion.polyline
          fill="none"
          stroke="#6366f1"
          strokeWidth="2"
          strokeLinecap="round"
          strokeLinejoin="round"
          points={points}
          initial={{ pathLength: 0 }}
          animate={{ pathLength: 1 }}
          transition={{ duration: 2, ease: "easeInOut" }}
        />
      </svg>
      
      {/* Data Nodes */}
      <div className="absolute inset-0 flex justify-between items-end">
        {data.map((val, i) => (
          <div key={i} className="group relative flex flex-col items-center">
            <div className="hidden group-hover:block absolute -top-8 bg-indigo-500 text-white text-[10px] px-2 py-1 rounded-md font-mono">
              {val}%
            </div>
            <div className="w-1.5 h-1.5 rounded-full bg-indigo-400 shadow-[0_0_10px_#6366f1] mb-[-3px]" />
          </div>
        ))}
      </div>
    </div>
  );
}