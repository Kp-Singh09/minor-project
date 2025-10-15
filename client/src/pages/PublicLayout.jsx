// src/pages/PublicLayout.jsx
import { Outlet } from 'react-router-dom';
import Header from '../components/Header'; // The original public-facing header

const PublicLayout = () => {
  return (
    <>
      <Header />
      <Outlet />
    </>
  );
};

export default PublicLayout;