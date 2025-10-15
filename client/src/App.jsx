// src/App.jsx
import { Outlet } from 'react-router-dom';

function App() {
  // The Header is removed from here.
  // Layouts are now handled by specific route groups (PublicLayout and ProtectedLayout).
  return <Outlet />;
}

export default App;