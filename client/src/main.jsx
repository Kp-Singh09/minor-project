// client/src/main.jsx
import React from 'react';
import ReactDOM from 'react-dom/client';
import { createBrowserRouter, RouterProvider } from 'react-router-dom';
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
import SubmissionsPage from './pages/SubmissionsPage';
import SubmissionDetail from './pages/SubmissionDetail';

const PUBLISHABLE_KEY = import.meta.env.VITE_CLERK_PUBLISHABLE_KEY;
if (!PUBLISHABLE_KEY) { throw new Error("Missing Clerk Publishable Key"); }

const router = createBrowserRouter([
  {
    path: "/",
    element: <App />, 
    children: [
      {
        element: <PublicLayout />,
        children: [
          { path: "/", element: <HomePage /> },
          
          // --- THE GATEWAY ---
          { path: "/form/:formId", element: <RenderGateway /> },
          
          // --- THE 3 MODES ---
          { path: "/form/:formId/focus", element: <FormRenderer /> }, // One by One
          { path: "/form/:formId/scroll", element: <ScrollRenderer /> }, // Vertical
          { path: "/form/:formId/chat", element: <ChatRenderer /> }, // Conversational
        ]
      },
      { path: "/sign-in/*", element: <SignInPage /> },
      { path: "/sign-up/*", element: <SignUpPage /> },
      {
        element: (
          <>
            <SignedIn><ProtectedLayout /></SignedIn>
            <SignedOut><RedirectToSignIn /></SignedOut>
          </>
        ),
        children: [
          { path: "/dashboard", element: <DashboardPage /> },
          { path: "/my-forms", element: <MyFormsPage /> },
          { path: "/analytics", element: <AnalyticsPage /> },
          { path: "/submissions", element: <SubmissionsPage /> },
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