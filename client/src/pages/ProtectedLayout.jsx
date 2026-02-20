// client/src/pages/ProtectedLayout.jsx
import { Outlet } from 'react-router-dom';
import VerticalSidebar from '../components/VerticalSidebar';
import HorizontalNavbar from '../components/HorizontalNavbar';
import Scene from '../components/canvas/Stars'; // Re-importing the 3D Scene

export default function ProtectedLayout() {
  return (
    <div className="flex min-h-screen bg-black w-full overflow-x-hidden relative">
      {/* 3D Background Background */}
      <Scene /> 

      <aside className="w-24 shrink-0 relative z-[110]">
        <VerticalSidebar />
      </aside>
      
      <div className="flex-1 flex flex-col min-w-0 relative z-10">
        <header className="relative z-[90]">
          <HorizontalNavbar />
        </header>
        
        <main className="p-8 flex-1">
          <Outlet />
        </main>
      </div>
    </div>
  );
}