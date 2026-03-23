// client/src/components/HorizontalNavbar.jsx
import { useLocation } from 'react-router-dom';
import { UserButton, useUser } from '@clerk/clerk-react';
import { motion } from 'framer-motion';
import { LayoutDashboard, FileText, BarChart3, Settings, Sparkles, FolderOpen, PieChart } from 'lucide-react';

const getRouteDetails = (pathname) => {
  if (pathname === '/dashboard' || pathname === '/') return { title: 'Command Center', icon: LayoutDashboard, color: 'text-indigo-400' };
  if (pathname.includes('/my-forms')) return { title: 'My Modules', icon: FileText, color: 'text-emerald-400' };
  if (pathname.includes('/analytics')) return { title: 'Analytics Engine', icon: BarChart3, color: 'text-pink-400' };
  if (pathname.includes('/stats')) return { title: 'Global Stats', icon: PieChart, color: 'text-amber-400' };
  if (pathname.includes('/submissions')) return { title: 'Submissions Hub', icon: FolderOpen, color: 'text-blue-400' };
  if (pathname.includes('/editor')) return { title: 'Neural Editor', icon: Sparkles, color: 'text-purple-400' };
  return { title: 'Workspace', icon: Settings, color: 'text-gray-400' };
};

export default function HorizontalNavbar() {
  const location = useLocation();
  const { user } = useUser();
  const { title, icon: Icon, color } = getRouteDetails(location.pathname);

  const dateOptions = { weekday: 'long', month: 'short', day: 'numeric' };
  const today = new Date().toLocaleDateString('en-US', dateOptions);

  return (
    <header className="sticky top-0 z-[60] w-full bg-transparent backdrop-blur-md border-b border-white/5 transition-all h-20 flex items-center">
      
      {/* Removed center alignment so it spans the absolute edges. 
          Added pl-8 so it aligns perfectly above the floating sidebar */}
      <div className="w-full flex justify-between items-center pr-4 md:pr-8 pl-8 md:pl-10">
        
        <div className="flex items-center gap-4">
          <motion.div 
            initial={{ opacity: 0, scale: 0.9 }}
            animate={{ opacity: 1, scale: 1 }}
            key={title}
            className={`p-3 rounded-xl bg-white/5 border border-white/10 shadow-inner ${color}`}
          >
            <Icon size={22} />
          </motion.div>
          
          <div className="flex flex-col">
            <motion.h1 
              initial={{ opacity: 0, x: -10 }}
              animate={{ opacity: 1, x: 0 }}
              key={`h1-${title}`}
              className="text-xl font-extrabold text-white tracking-tight"
            >
              {title}
            </motion.h1>
            <p className="text-[10px] sm:text-xs font-mono uppercase tracking-widest text-white/40">
              {today}
            </p>
          </div>
        </div>

        <div className="flex items-center gap-4 sm:gap-6">
          <div className="hidden sm:flex flex-col items-end">
             <span className="text-sm font-bold text-white/90">
                {user?.firstName ? `Welcome, ${user.firstName}` : 'Welcome back'}
             </span>
             <span className="text-[10px] font-mono uppercase tracking-widest text-emerald-400/80 flex items-center gap-1.5">
                <span className="w-1.5 h-1.5 rounded-full bg-emerald-400 animate-pulse"></span>
                System Online
             </span>
          </div>

          <div className="relative p-[2px] rounded-full bg-gradient-to-tr from-indigo-500 via-purple-500 to-pink-500 shadow-lg shadow-indigo-500/20 hover:shadow-indigo-500/40 transition-shadow">
            <div className="bg-slate-950 rounded-full p-0.5 flex items-center justify-center">
               <UserButton 
                 afterSignOutUrl="/" 
                 appearance={{
                   elements: {
                     avatarBox: "w-9 h-9 sm:w-10 sm:h-10 border-2 border-slate-950 rounded-full"
                   }
                 }}
               />
            </div>
          </div>
        </div>
      </div>
    </header>
  );
}