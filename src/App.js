import { RouterProvider } from 'react-router-dom';
import { createAppRouter } from './routes';
import { InitialDataProvider } from './initialDataContext';
import { createLDReactProvider } from '@launchdarkly/react-sdk';

const router = createAppRouter();

function getAnonymousUserId() {
  if (typeof window === 'undefined') {
    return 'anonymous-user';
  }
  let id = localStorage.getItem('egi_anonymous_id');
  if (!id) {
    id = 'anon-' + Math.random().toString(36).substring(2, 15) + Math.random().toString(36).substring(2, 15);
    localStorage.setItem('egi_anonymous_id', id);
  }
  return id;
}

const LDProvider = createLDReactProvider('6a525a8ccd87b60ba57d0fd3', {
  kind: 'user',
  key: getAnonymousUserId(),
  name: 'Anonymous User'
});

function App() {
  const initialData = typeof window !== 'undefined' ? window.__INITIAL_DATA__ : null;

  return (
    <LDProvider>
      <InitialDataProvider initialData={initialData}>
        <RouterProvider router={router} />
      </InitialDataProvider>
    </LDProvider>
  );
}

export default App;
