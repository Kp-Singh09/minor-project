import { Outlet, useOutletContext } from 'react-router-dom';
import VerticalSidebar from '../components/VerticalSidebar';
import HorizontalNavbar from '../components/HorizontalNavbar';
import { createContext, useState, useEffect, useCallback } from 'react';
import { useUser } from '@clerk/clerk-react';
import axios from 'axios';

// Create a context to share the forms and a refetch function
export const FormsContext = createContext();

const ProtectedLayout = () => {
  const { user } = useUser();
  const [userForms, setUserForms] = useState([]);

  const fetchUserForms = useCallback(async () => {
    if (user) {
      try {
        const response = await axios.get(`${import.meta.env.VITE_API_BASE_URL}/api/forms/user/${user.id}`);
        setUserForms(response.data);
      } catch (error) {
        console.error("Failed to fetch user forms", error);
      }
    }
  }, [user]);

  useEffect(() => {
    fetchUserForms();
  }, [fetchUserForms]);

  return (
    <FormsContext.Provider value={{ userForms, refetchForms: fetchUserForms }}>
      <div className="min-h-screen bg-sky-50 text-gray-800">
        <VerticalSidebar />
        <HorizontalNavbar />
        
        <main className="ml-64 flex flex-col h-screen">
          <div className="h-20 flex-shrink-0" />

          <div className="flex-grow p-8 overflow-y-auto bg-[length:80px_80px] bg-[linear-gradient(transparent_78px,rgba(59,130,246,0.3)_80px),linear-gradient(90deg,transparent_78px,rgba(59,130,246,0.3)_80px)]">
            <Outlet />
          </div>
        </main>
      </div>
    </FormsContext.Provider>
  );
};

export default ProtectedLayout;