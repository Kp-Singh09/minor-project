// src/components/VerticalSidebar.jsx
import { NavLink, Link, useParams } from "react-router-dom";
import { useState, useEffect } from 'react';
import { useUser } from '@clerk/clerk-react';
import axios from 'axios';
import { motion, AnimatePresence } from "framer-motion";

const navItems = [
    { href: "/dashboard", title: "Dashboard", icon: <span>📊</span> },
    { href: "/editor/new", title: "Create Form", icon: <span>📄</span> },
    { href: "/responses", title: "Responses", icon: <span>📈</span> },
    { href: "/submissions", title: "My Submissions", icon: <span>✅</span> },
    { href: "/stats", title: "Stats", icon: <span>⭐</span> },
  ];

const VerticalSidebar = () => {
  const { user } = useUser();
  const { formId } = useParams();
  const [userForms, setUserForms] = useState([]);
  const [isFormsExpanded, setIsFormsExpanded] = useState(true);

  useEffect(() => {
    if (user) {
      const fetchUserForms = async () => {
        try {
          const response = await axios.get(`${import.meta.env.VITE_API_BASE_URL}/api/forms/user/${user.id}`);
          setUserForms(response.data);
        } catch (error) {
          console.error("Failed to fetch user forms", error);
        }
      };
      fetchUserForms();
    }
  }, [user, formId]);

  return (
    // Palette 2: Using bg-sky-200 for a soft, distinct sidebar
    <aside className="fixed top-0 left-0 w-64 h-full bg-sky-100  z-40 flex flex-col">
      <div className="h-20 flex items-center px-6 border-b border-sky-300/70 flex-shrink-0">
        <Link to="/" className="text-3xl font-bold text-slate-800 drop-shadow-md">
          Structa<span className="text-blue-600">Quiz</span>
        </Link>
      </div>

      <nav className="p-4 flex-shrink-0 border-r border-sky-300/70">
        <div className="flex flex-col gap-4">
          {navItems.map((item, index) => (
            <motion.div key={index} whileHover={{ scale: 1.05 }} whileTap={{ scale: 0.95 }}>
              <NavLink
                to={item.href}
                className={({ isActive }) =>
                  // Updated styles for the new sky-colored sidebar
                  `flex items-center gap-4 px-4 py-3 rounded-lg transition-colors text-lg font-medium ${
                    isActive && !formId
                      ? "bg-sky-500 text-white font-bold shadow-md"
                      : "text-gray-700 hover:bg-sky-300/50 hover:text-gray-800"
                  }`
                }
              >
                <span className="text-2xl">{item.icon}</span>
                {item.title}
              </NavLink>
            </motion.div>
          ))}
        </div>
      </nav>

      <div className="p-4 pt-0 flex flex-col flex-grow min-h-0">
          <button
              onClick={() => setIsFormsExpanded(!isFormsExpanded)}
              className="w-full flex justify-between items-center text-left text-sm font-semibold text-sky-800/60 px-4 py-2 rounded-md hover:bg-sky-300/40 flex-shrink-0"
          >
              <span>CREATED FORMS</span>
              <motion.span animate={{ rotate: isFormsExpanded ? 0 : -90 }}>▼</motion.span>
          </button>
          <AnimatePresence>
              {isFormsExpanded && (
                  <motion.div
                      initial={{ height: 0, opacity: 0 }}
                      animate={{ height: 'auto', opacity: 1 }}
                      exit={{ height: 0, opacity: 0 }}
                      className="overflow-hidden"
                  >
                      <div className="mt-2 space-y-1 overflow-y-auto pr-2" style={{ maxHeight: 'calc(100% - 1rem)' }}>
                          {userForms.length > 0 ? userForms.map(form => (
                              <NavLink
                                  key={form._id}
                                  to={`/editor/${form._id}`}
                                  className={({ isActive }) =>
                                      `block text-sm px-4 py-2 rounded-md truncate ${
                                          isActive
                                          ? 'bg-sky-300/70 text-sky-900 font-semibold'
                                          : 'text-gray-600 hover:bg-sky-300/40 hover:text-gray-800'
                                      }`
                                  }
                              >
                                  {form.title}
                              </NavLink>
                          )) : (
                              <p className="text-xs text-slate-500 px-4 py-2">No forms created yet.</p>
                          )}
                      </div>
                  </motion.div>
              )}
          </AnimatePresence>
      </div>
    </aside>
  );
};

export default VerticalSidebar;