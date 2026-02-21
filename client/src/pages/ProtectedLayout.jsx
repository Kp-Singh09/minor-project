// client/src/pages/ProtectedLayout.jsx
import { Outlet } from 'react-router-dom';
import VerticalSidebar from '../components/VerticalSidebar';
import HorizontalNavbar from '../components/HorizontalNavbar';

export default function ProtectedLayout() {
  return (
    <div className="flex min-h-screen w-full relative">
      {/* Removed <Scene /> from here because it is now in App.jsx.
         The stars will now show through from the background layer.
      */}
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