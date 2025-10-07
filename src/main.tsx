/**
 * Main Application Entry Point
 * 
 * This file initializes the React application with:
 * - Strict mode for development warnings
 * - Helmet provider for dynamic SEO meta tags
 * - Global CSS imports
 */

import { StrictMode } from 'react';
import { createRoot } from 'react-dom/client';
import { HelmetProvider } from 'react-helmet-async';
import App from './App.tsx';
import './index.css';

// Initialize React application with SEO optimization
createRoot(document.getElementById('root')!).render(
  <StrictMode>
    <HelmetProvider>
      <App />
    </HelmetProvider>
  </StrictMode>
);
