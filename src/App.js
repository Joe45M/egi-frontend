import { BrowserRouter, Routes, Route } from 'react-router-dom';
import Layout from './components/Layout';
import ScrollToTop from './components/ScrollToTop';
import Home from './pages/Home';
import Games from './pages/Games';
import Culture from './pages/Culture';
import Archive from './pages/Archive';
import NotFound from './pages/NotFound';

function App() {
  return (
    <BrowserRouter>
      <ScrollToTop />
      <Routes>
        <Route path="/" element={<Layout />}>
          <Route index element={<Home />} />
          <Route path="games/:slug" element={<Games />} />
          <Route path="culture/:slug" element={<Culture />} />
          <Route path=":type" element={<Archive />} />
          <Route path="*" element={<NotFound />} />
        </Route>
      </Routes>
    </BrowserRouter>
  );
}

export default App;
