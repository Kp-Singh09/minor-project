// src/main.jsx
import React from 'react';
import ReactDOM from 'react-dom/client';
import { createBrowserRouter, RouterProvider } from 'react-router-dom';
import { ClerkProvider, SignedIn, SignedOut, RedirectToSignIn } from '@clerk/clerk-react';
import './index.css';

// Import all your components
import App from './App.jsx';
import HomePage from './pages/HomePage';
import DashboardPage from './pages/DashboardPage';
import FormEditor from './pages/FormEditor';
import FormRenderer from './pages/FormRenderer';
import SignInPage from './pages/SignInPage';
import SignUpPage from './pages/SignUpPage';
import ProtectedLayout from './pages/ProtectedLayout';
import PublicLayout from './pages/PublicLayout';
import ResponsesListPage from './pages/ResponsesListPage';
import ResponseViewerPage from './pages/ResponseViewerPage';
import ResultsPage from './pages/ResultsPage';
import SubmissionsPage from './pages/SubmissionsPage';
import StatsPage from './pages/StatsPage';

const PUBLISHABLE_KEY = import.meta.env.VITE_CLERK_PUBLISHABLE_KEY;

if (!PUBLISHABLE_KEY) {
  throw new Error("Missing Publishable Key");
}

const router = createBrowserRouter([
  {
    element: <App />, // The root App component is now just a wrapper
    children: [
      // --- Group 1: Public routes that use PublicLayout (with the main header) ---
      {
        element: <PublicLayout />,
        children: [
          { path: "/", element: <HomePage /> },
          { path: "/form/:formId", element: <FormRenderer /> },
        ]
      },

      // --- Group 2: Auth pages that have no layout ---
      { path: "/sign-in/*", element: <SignInPage /> },
      { path: "/sign-up/*", element: <SignUpPage /> },

      // --- Group 3: Protected routes that use ProtectedLayout (with sidebar and navbar) ---
      {
        element: (
          <SignedIn>
            <ProtectedLayout />
          </SignedIn>
        ),
        children: [
          {
            path: "/dashboard",
            element: <DashboardPage />,
          },
          // THIS IS THE NEW ROUTE FOR CREATING FORMS
          {
            path: "/editor/new",
            element: <FormEditor />,
          },
          // This route now specifically handles editing existing forms
          {path: "/editor/:formId",element: <FormEditor />,},
          { path: "/responses", element: <ResponsesListPage /> },
          { path: "/responses/:formId", element: <ResponseViewerPage /> },
          { path: "/results/:responseId", element: <ResultsPage /> },
          { path: "/submissions", element: <SubmissionsPage /> },
          { path: "/stats", element: <StatsPage /> },
        ]
      },
    ],
  },
  // --- Fallback for signed out users (no change here) ---
  {
    path: "/dashboard",
    element: <RedirectToSignIn />,
  },
  {
    path: "/editor/*",
    element: <RedirectToSignIn />,
  },
  { path: "/responses", element: <RedirectToSignIn /> },
  { path: "/responses/*", element: <RedirectToSignIn /> },
  { path: "/results/*", element: <RedirectToSignIn /> },
  { path: "/submissions", element: <RedirectToSignIn /> },
  { path: "/stats", element: <RedirectToSignIn /> },
]);


ReactDOM.createRoot(document.getElementById('root')).render(
  <React.StrictMode>
    <ClerkProvider publishableKey={PUBLISHABLE_KEY}>
      <RouterProvider router={router} />
    </ClerkProvider>
  </React.StrictMode>
);