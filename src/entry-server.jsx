import React from 'react';
import { renderToString } from 'react-dom/server';
import { createMemoryRouter, RouterProvider } from 'react-router-dom';
import { routes } from './routes';

export function render(url) {
  const router = createMemoryRouter(routes, {
    initialEntries: [url],
  });

  const html = renderToString(
    <React.StrictMode>
      <RouterProvider router={router} />
    </React.StrictMode>
  );

  return {
    html,
    status: 200,
  };
}

// Export routes for the serverless function
export { routes };

