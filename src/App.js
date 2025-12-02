import { RouterProvider } from 'react-router-dom';
import { createAppRouter } from './routes';
import { InitialDataProvider } from './initialDataContext';

const router = createAppRouter();

function App() {
  return (
    <InitialDataProvider initialData={null}>
      <RouterProvider router={router} />
    </InitialDataProvider>
  );
}

export default App;
