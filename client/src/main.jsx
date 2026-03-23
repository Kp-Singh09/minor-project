// client/src/main.jsx
import React from 'react';
import ReactDOM from 'react-dom/client';
import { createBrowserRouter, RouterProvider, useLocation, Outlet } from 'react-router-dom';
import { ClerkProvider, SignedIn, SignedOut, RedirectToSignIn } from '@clerk/clerk-react';
import { Toaster } from 'react-hot-toast';
import './index.css';

import App from './App.jsx';
import HomePage from './pages/HomePage';
import DashboardPage from './pages/DashboardPage';

// --- NEW ROUTING ARCHITECTURE ---
import RenderGateway from './pages/RenderGateway'; // The Interceptor
import FormRenderer from './pages/FormRenderer'; // Now represents FOCUS mode
import ChatRenderer from './pages/ChatRenderer'; // CHAT mode
import ScrollRenderer from './pages/ScrollRenderer'; // SCROLL mode

import SignInPage from './pages/SignInPage';
import SignUpPage from './pages/SignUpPage';
import ProtectedLayout from './pages/ProtectedLayout';
import PublicLayout from './pages/PublicLayout';
import FormEditor from './pages/FormEditor'; 
import MyFormsPage from './pages/MyFormsPage'; 
import AnalyticsPage from './pages/AnalyticsPage';

// --- SUBMISSION / ATTEMPTS PAGES ---
import SubmissionsPage from './pages/SubmissionsPage'; 
import FormSubmissionsPage from './pages/FormSubmissionsPage'; 
import MyAttemptsPage from './pages/MyAttemptsPage'; 
import SubmissionDetail from './pages/SubmissionDetail'; 

const PUBLISHABLE_KEY = import.meta.env.VITE_CLERK_PUBLISHABLE_KEY;
if (!PUBLISHABLE_KEY) { throw new Error("Missing Clerk Publishable Key"); }

// --- SMART AUTHENTICATION WRAPPER ---
// This captures the exact URL the user is trying to access
// and tells Clerk to redirect them back there after signing in.
const RequireAuth = ({ children }) => {
  const location = useLocation();
  return (
    <>
      <SignedIn>{children}</SignedIn>
      <SignedOut>
        {/* The redirectUrl prop is the magic here! */}
        <RedirectToSignIn redirectUrl={location.pathname + location.search} />
      </SignedOut>
    </>
  );
};

const router = createBrowserRouter([
  {
    path: "/",
    element: <App />, 
    children: [
      // 1. COMPLETELY PUBLIC ROUTES
      {
        element: <PublicLayout />,
        children: [
          { path: "/", element: <HomePage /> },
        ]
      },
      
      // 2. AUTHENTICATION PAGES
      { path: "/sign-in/*", element: <SignInPage /> },
      { path: "/sign-up/*", element: <SignUpPage /> },
      
      // 3. PROTECTED ROUTES WITHOUT SIDEBAR (For taking shared tests)
      // We wrap these in RequireAuth, but NOT in ProtectedLayout, 
      // so the user gets a clean, distraction-free interface without the dashboard sidebar.
      {
        element: <RequireAuth><Outlet /></RequireAuth>,
        children: [
          { path: "/form/:formId", element: <RenderGateway /> },
          { path: "/form/:formId/focus", element: <FormRenderer /> },
          { path: "/form/:formId/scroll", element: <ScrollRenderer /> },
          { path: "/form/:formId/chat", element: <ChatRenderer /> },
        ]
      },

      // 4. PROTECTED ROUTES WITH SIDEBAR (Dashboard, Editors, Analytics)
      {
        element: <RequireAuth><ProtectedLayout /></RequireAuth>,
        children: [
          { path: "/dashboard", element: <DashboardPage /> },
          { path: "/my-forms", element: <MyFormsPage /> },
          { path: "/analytics", element: <AnalyticsPage /> },
          
          { path: "/attempts", element: <MyAttemptsPage /> }, 
          { path: "/submissions", element: <SubmissionsPage /> }, 
          { path: "/submissions/:formId", element: <FormSubmissionsPage /> }, 
          { path: "/submission/:responseId", element: <SubmissionDetail /> }, 
          
          { path: "/editor/new", element: <FormEditor /> },
          { path: "/editor/:formId", element: <FormEditor /> },
        ]
      },
    ],
  },
]);

ReactDOM.createRoot(document.getElementById('root')).render(
  <React.StrictMode>
    <ClerkProvider publishableKey={PUBLISHABLE_KEY}>
      <RouterProvider router={router} />
      <Toaster position="bottom-right" toastOptions={{ style: { background: '#1e293b', color: '#fff', border: '1px solid rgba(255,255,255,0.1)' } }} />
    </ClerkProvider>
  </React.StrictMode>
);