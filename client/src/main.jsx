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
import SignInPage from './pages/SignInPage';
import SignUpPage from './pages/SignUpPage';
import ProtectedLayout from './pages/ProtectedLayout';
import PublicLayout from './pages/PublicLayout';
import FormEditorUI from './components/FormCreator/FormEditorUI';

const PUBLISHABLE_KEY = import.meta.env.VITE_CLERK_PUBLISHABLE_KEY;

if (!PUBLISHABLE_KEY) {
  throw new Error("Missing Publishable Key");
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
          { path: "/editor/new", element: <FormEditorUI /> },
          { path: "/editor/:formId", element: <FormEditorUI /> },
        ]
      },
    ],
  },
]);

ReactDOM.createRoot(document.getElementById('root')).render(
  <React.StrictMode>
    <ClerkProvider publishableKey={PUBLISHABLE_KEY}>
      <RouterProvider router={router} />
      <Toaster position="bottom-right" />
    </ClerkProvider>
  </React.StrictMode>
);