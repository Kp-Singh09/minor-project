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
import FormRenderer from './pages/FormRenderer';
import ChatRenderer from './pages/ChatRenderer'; // NEW: Import Chat Renderer
import SignInPage from './pages/SignInPage';
import SignUpPage from './pages/SignUpPage';
import ProtectedLayout from './pages/ProtectedLayout';
import PublicLayout from './pages/PublicLayout';

// UPDATED: Import the Page component (Logic layer), not just the UI
import FormEditor from './pages/FormEditor'; 

import MyFormsPage from './pages/MyFormsPage'; 
import AnalyticsPage from './pages/AnalyticsPage';
import SubmissionsPage from './pages/SubmissionsPage';
import SubmissionDetail from './pages/SubmissionDetail';
const PUBLISHABLE_KEY = import.meta.env.VITE_CLERK_PUBLISHABLE_KEY;

if (!PUBLISHABLE_KEY) {
  throw new Error("Missing Clerk Publishable Key");
}

const router = createBrowserRouter([
  {
    path: "/",
    element: <App />, 
    children: [
      {
        element: <PublicLayout />,
        children: [
          { path: "/", element: <HomePage /> },
          { path: "/form/:formId", element: <FormRenderer /> },
          { path: "/form/:formId/chat", element: <ChatRenderer /> }, // NEW: Chat Mode Route
        ]
      },
      { path: "/sign-in/*", element: <SignInPage /> },
      { path: "/sign-up/*", element: <SignUpPage /> },
      {
        element: (
          <>
            <SignedIn>
              <ProtectedLayout />
            </SignedIn>
            <SignedOut>
              <RedirectToSignIn />
            </SignedOut>
          </>
        ),
        children: [
          { path: "/dashboard", element: <DashboardPage /> },
          { path: "/my-forms", element: <MyFormsPage /> },
          { path: "/analytics", element: <AnalyticsPage /> },
          { path: "/submissions", element: <SubmissionsPage /> },
          { path: "/submission/:responseId", element: <SubmissionDetail /> },
          // UPDATED: Pointing to the logic-rich Page component
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
      <Toaster 
        position="bottom-right"
        toastOptions={{
          style: {
            background: '#1e293b',
            color: '#fff',
            border: '1px solid rgba(255,255,255,0.1)',
          },
        }} 
      />
    </ClerkProvider>
  </React.StrictMode>
);