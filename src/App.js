import { RouterProvider } from 'react-router-dom';
import { createAppRouter } from './routes';
import { InitialDataProvider } from './initialDataContext';
import { createLDReactProvider } from '@launchdarkly/react-sdk';

const router = createAppRouter();

const LDProvider = createLDReactProvider('6a525a8ccd87b60ba57d0fd3', {
  kind: 'user',
  key: 'anonymous-user',
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
