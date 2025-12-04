import React from 'react';
import { hydrateRoot, createRoot } from 'react-dom/client';
import './index.css';
import App from './App';

// Lazy load web vitals reporting to not block initial render
const reportWebVitals = () => {
  import('./reportWebVitals').then(({ default: reportWebVitals }) => {
    reportWebVitals();
  });
};

const rootElement = document.getElementById('root');

if (rootElement.hasChildNodes()) {
  // Hydrate if server-rendered HTML exists
  hydrateRoot(
    rootElement,
    <React.StrictMode>
      <App />
    </React.StrictMode>
  );
} else {
  // Fallback to client-side rendering if no SSR HTML
  const root = createRoot(rootElement);
  root.render(
    <React.StrictMode>
      <App />
    </React.StrictMode>
  );
}

// Load web vitals reporting after initial render
if (process.env.NODE_ENV === 'production') {
  // Only load in production to avoid blocking development
  setTimeout(() => {
    reportWebVitals();
  }, 1000);
}
