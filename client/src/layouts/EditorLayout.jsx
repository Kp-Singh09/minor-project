// client/src/layouts/EditorLayout.jsx
import React from 'react';
import { Outlet } from 'react-router-dom';
import HorizontalNavbar from '../components/HorizontalNavbar'; 
import EditorSidebar from '../components/FormCreator/EditorSidebar';

const EditorLayout = () => {
  return (
    <div className="min-h-screen bg-sky-50 text-gray-800">
      {/* Pass the new sidebar width. 'w-80' = 'md:left-80' */}
      <HorizontalNavbar sidebarWidthClass="md:left-80" />

      <EditorSidebar /> 
      
      {/* Main content area, pushed over by the sidebar */}
      <main className="ml-0 md:ml-80 flex flex-col h-screen">
        <div className="h-20 flex-shrink-0" /> {/* Spacer for navbar */}
        <div className="flex-grow overflow-y-auto">
          <Outlet />
        </div>
      </main>
    </div>
  );
};

export default EditorLayout;