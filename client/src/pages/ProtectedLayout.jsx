// src/pages/ProtectedLayout.jsx
import { Outlet } from 'react-router-dom';
import VerticalSidebar from '../components/VerticalSidebar';
import HorizontalNavbar from '../components/HorizontalNavbar';

const ProtectedLayout = () => {
  return (
    <div className="min-h-screen bg-sky-50 text-gray-800">
      <VerticalSidebar />
      <HorizontalNavbar />
      
      <main className="ml-64 flex flex-col h-screen">
        <div className="h-20 flex-shrink-0" />

        {/* Added 'overflow-y-auto' to make this container scrollable */}
        <div className="flex-grow p-8 overflow-y-auto bg-[length:80px_80px] bg-[linear-gradient(transparent_78px,rgba(59,130,246,0.3)_80px),linear-gradient(90deg,transparent_78px,rgba(59,130,246,0.3)_80px)]">
          <Outlet />
        </div>
      </main>
    </div>
  );
};

export default ProtectedLayout;