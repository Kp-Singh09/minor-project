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
import FormEditor from './pages/FormEditor'; // Keep this for now, but we're replacing its route
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

// --- IMPORT YOUR NEW EDITOR UI AND LAYOUT ---
import FormEditorUI from './components/FormCreator/FormEditorUI';
import EditorLayout from './layouts/EditorLayout'; 

const PUBLISHABLE_KEY = import.meta.env.VITE_CLERK_PUBLISHABLE_KEY;

if (!PUBLISHABLE_KEY) {
  throw new Error("Missing Publishable Key");
}

const router = createBrowserRouter([
  {
    element: <App />, 
    children: [
      // --- Group 1: Public routes
      {
        element: <PublicLayout />,
        children: [
          { path: "/", element: <HomePage /> },
          { path: "/form/:formId", element: <FormRenderer /> },
        ]
      },

      // --- Group 2: Auth pages
      { path: "/sign-in/*", element: <SignInPage /> },
      { path: "/sign-up/*", element: <SignUpPage /> },

      // --- Group 3: Protected routes (Dashboard, etc.)
      {
        element: (
          <SignedIn>
            <ProtectedLayout /> {/* This layout has VerticalSidebar */}
          </SignedIn>
        ),
        children: [
          { path: "/dashboard", element: <DashboardPage /> },
          { path: "/responses", element: <ResponsesListPage /> },
          { path: "/responses/:formId", element: <ResponseViewerPage /> },
          { path: "/results/:responseId", element: <ResultsPage /> },
          { path: "/submissions", element: <SubmissionsPage /> },
          { path: "/stats", element: <StatsPage /> },
        ]
      },

      // --- Group 4: Protected Editor routes
      {
        element: (
          <SignedIn>
            <EditorLayout /> {/* This new layout has EditorSidebar */}
          </SignedIn>
        ),
        children: [
          { path: "/editor/new", element: <FormEditorUI /> }, // New form creation
          { path: "/editor/:formId", element: <FormEditorUI /> }, // <-- NOW USES FormEditorUI
        ]
      },
    ],
  },
  // --- Fallback for signed out users
  { path: "/dashboard", element: <RedirectToSignIn /> },
  { path: "/editor/*", element: <RedirectToSignIn /> },
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