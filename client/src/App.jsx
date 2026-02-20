// client/src/App.jsx
import { Outlet } from 'react-router-dom';

function App() {
  // We keep this as lean as possible to ensure children render
  return (
    <div className="min-h-screen w-full bg-[#050505]">
      <Outlet />
    </div>
  );
}

export default App;