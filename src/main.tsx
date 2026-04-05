import { StrictMode, Suspense, useEffect } from 'react';
import { createRoot } from 'react-dom/client';
import { HelmetProvider } from 'react-helmet-async';
import App from './App.tsx';
import LoadingScreen from './components/LoadingScreen';
import './index.css';
import './i18n/config';
import { initializeInteractions } from './interactions';

// Initialize interactions after the app mounts
const AppWithInteractions = () => {
  useEffect(() => {
    initializeInteractions();
  }, []);

  return (
    <Suspense fallback={<LoadingScreen />}>
      <App />
    </Suspense>
  );
};

createRoot(document.getElementById('root')!).render(
  <StrictMode>
    <HelmetProvider>
      <AppWithInteractions />
    </HelmetProvider>
  </StrictMode>
);