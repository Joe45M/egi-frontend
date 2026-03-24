import React from 'react';
import { hydrateRoot, createRoot } from 'react-dom/client';
import * as Sentry from "@sentry/react";
import './index.css';
import App from './App';

if (
  process.env.NODE_ENV === 'production' &&
  window.location.hostname === 'elitegamerinsights.com'
) {
  Sentry.init({
    dsn: "https://1424c055d2b33f51071a3b5da1e06074@o4511100940779520.ingest.de.sentry.io/4511100944056400",
    sendDefaultPii: true,
    integrations: [
      Sentry.browserTracingIntegration(),
      Sentry.replayIntegration(),
    ],
    // Performance Monitoring
    tracesSampleRate: 1.0, // Capture 100% of the transactions
    // Session Replay
    replaysSessionSampleRate: 1.0, // Max telemetry (capture 100% of sessions)
    replaysOnErrorSampleRate: 1.0, // Capture 100% of sessions with errors
    debug: false, // Disable debug mode to prevent noise in production
    enableTracing: true // Enable distributed tracing
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
