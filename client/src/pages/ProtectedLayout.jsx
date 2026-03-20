// client/src/pages/ProtectedLayout.jsx
import { Outlet } from 'react-router-dom';
import VerticalSidebar from '../components/VerticalSidebar';
import HorizontalNavbar from '../components/HorizontalNavbar';

export default function ProtectedLayout() {
  return (
    // Changed to a vertical flex-col layout
    <div className="flex flex-col min-h-screen w-full relative">
      
      {/* 1. Navbar moved outside the side-by-side container to span 100% width */}
      <header className="relative z-[90] w-full">
        <HorizontalNavbar />
      </header>
      
      {/* 2. Main layout with the sidebar spacer and content */}
      <div className="flex flex-1 w-full relative">
        <aside className="w-24 shrink-0 relative z-[110]">
          <VerticalSidebar />
        </aside>
        
        <main className="flex-1 p-8 min-w-0">
          <Outlet />
        </main>
      </div>
      
    </div>
  );
}