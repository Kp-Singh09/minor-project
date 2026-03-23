// client/src/components/VerticalSidebar.jsx
import { motion } from 'framer-motion';
import { useNavigate, useLocation } from 'react-router-dom';
import { LayoutDashboard, FileText, BarChart3, PlusCircle, LogOut, Inbox, CheckCircle } from 'lucide-react';
import { SignOutButton } from '@clerk/clerk-react';

const navItems = [
  { name: 'Dashboard', path: '/dashboard', icon: LayoutDashboard },
  { name: 'My Forms', path: '/my-forms', icon: FileText }, 
  { name: 'Submissions', path: '/submissions', icon: Inbox }, // Incoming responses to your forms
  { name: 'My Attempts', path: '/attempts', icon: CheckCircle }, // Forms you have filled out
  { name: 'Analytics', path: '/analytics', icon: BarChart3 },
];

export default function VerticalSidebar() {
  const navigate = useNavigate();
  const location = useLocation();

  return (
    <div className="fixed left-6 top-1/2 -translate-y-1/2 z-[100] flex flex-col gap-4">
      <motion.div 
        initial={{ x: -100, opacity: 0 }}
        animate={{ x: 0, opacity: 1 }}
        className="glass-card p-3 flex flex-col gap-2 border-white/10 bg-black/40 backdrop-blur-xl rounded-2xl"
      >
        <button 
          onClick={() => navigate('/editor/new')}
          className="p-3 mb-4 rounded-xl bg-indigo-500 text-white shadow-lg shadow-indigo-500/20 group"
        >
          <PlusCircle size={24} className="group-hover:rotate-90 transition-transform duration-300" />
        </button>

        {navItems.map((item) => (
          <div key={item.name} className="relative group" title={item.name}>
            <button
              onClick={() => navigate(item.path)}
              className={`p-3 rounded-xl transition-all relative z-10 ${
                location.pathname.startsWith(item.path) ? 'text-white bg-white/10' : 'text-white/40 hover:text-white'
              }`}
            >
              <item.icon size={22} />
            </button>
          </div>
        ))}

        <div className="h-px bg-white/10 my-2" />

        <SignOutButton>
          <button className="p-3 rounded-xl text-white/40 hover:text-red-400 transition-all" title="Sign Out">
            <LogOut size={22} />
          </button>
        </SignOutButton>
      </motion.div>
    </div>
  );
}