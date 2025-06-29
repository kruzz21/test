import { StrictMode } from 'react';
import { createRoot } from 'react-dom/client';
import { BrowserRouter } from 'react-router-dom';
import { HelmetProvider } from 'react-helmet-async';
import AppWrapper from './AppWrapper';
import { initializeAuth } from './lib/auth';
import './index.css';
import './i18n/i18n';

// Initialize authentication on app start
initializeAuth().catch(console.error);

createRoot(document.getElementById('root')!).render(
  <StrictMode>
    <BrowserRouter>
      <HelmetProvider>
        <AppWrapper />
      </HelmetProvider>
    </BrowserRouter>
  </StrictMode>
);