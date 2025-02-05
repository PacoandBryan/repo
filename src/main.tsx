import { StrictMode, Suspense } from 'react';
import { createRoot } from 'react-dom/client';
import App from './App.tsx';
import LoadingScreen from './components/LoadingScreen';
import './index.css';
import './i18n/config';

createRoot(document.getElementById('root')!).render(
  <StrictMode>
    <Suspense fallback={<LoadingScreen />}>
      <App />
    </Suspense>
  </StrictMode>
);