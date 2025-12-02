import React from 'react';
import { renderToString } from 'react-dom/server';
import { createMemoryRouter, RouterProvider } from 'react-router-dom';
import { routes } from './routes';
import { HeadProvider, createEmptyHead } from './headContext';

export function render(url) {
  const router = createMemoryRouter(routes, {
    initialEntries: [url],
  });

  const head = createEmptyHead();

  const html = renderToString(
    <React.StrictMode>
      <HeadProvider head={head}>
        <RouterProvider router={router} />
      </HeadProvider>
    </React.StrictMode>
  );

  return {
    html,
    status: 200,
    head,
  };
}

// Export routes for the serverless function
export { routes };

