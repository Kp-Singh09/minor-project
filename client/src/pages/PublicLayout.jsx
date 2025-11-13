// src/pages/PublicLayout.jsx
import { Outlet } from 'react-router-dom';
// We no longer import Header

const PublicLayout = () => {
  return (
    <>
      {/* Header is removed from here and placed in child pages */}
      <Outlet />
    </>
  );
};

export default PublicLayout;