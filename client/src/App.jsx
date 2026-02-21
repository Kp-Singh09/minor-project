// client/src/App.jsx
import { Outlet } from 'react-router-dom';
import Scene from './components/canvas/Stars'; // cite: 19, 51

function App() {
  return (
    <div className="min-h-screen w-full bg-[#050505] relative overflow-x-hidden">
      {/* Moving Scene here makes it global. 
         z-0 keeps it behind all Outlets. 
      */}
      <div className="fixed inset-0 z-0 pointer-events-none">
        <Scene />
      </div>

      {/* Main content renders over the stars */}
      <div className="relative z-10">
        <Outlet />
      </div>
    </div>
  );
}

export default App;