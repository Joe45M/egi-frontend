import React from 'react';
import { hydrateRoot, createRoot } from 'react-dom/client';
import * as Sentry from "@sentry/react";
import './index.css';
import App from './App';

if (
  typeof window !== 'undefined' &&
  window.location.hostname === 'elitegamerinsights.com'
) {
  Sentry.init({
    dsn: "https://1424c055d2b33f51071a3b5da1e06074@o4511100940779520.ingest.de.sentry.io/4511100944056400",
    sendDefaultPii: false,
    integrations: [
      Sentry.browserTracingIntegration(),
      Sentry.replayIntegration({
        maskAllText: false,
        blockAllMedia: true,
      }),
      Sentry.captureConsoleIntegration({ levels: ['error'] }),
    ],
    // Performance Monitoring - sample 10% to reduce JS overhead
    tracesSampleRate: 0.1,
    // Session Replay - disable full session replays (huge CPU win); only capture on errors
    replaysSessionSampleRate: 0.0,
    replaysOnErrorSampleRate: 1.0,
    debug: false,
    enableTracing: true
  });
}

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
      <Sentry.ErrorBoundary fallback={null}>
        <App />
      </Sentry.ErrorBoundary>
    </React.StrictMode>
  );
} else {
  // Fallback to client-side rendering if no SSR HTML
  const root = createRoot(rootElement);
  root.render(
    <React.StrictMode>
      <Sentry.ErrorBoundary fallback={null}>
        <App />
      </Sentry.ErrorBoundary>
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
