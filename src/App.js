import { RouterProvider } from 'react-router-dom';
import { createAppRouter } from './routes';
import { InitialDataProvider } from './initialDataContext';

const router = createAppRouter();

function App() {
  const initialData = typeof window !== 'undefined' ? window.__INITIAL_DATA__ : null;

  return (
    <InitialDataProvider initialData={initialData}>
      <RouterProvider router={router} />
    </InitialDataProvider>
  );
}

export default App;
