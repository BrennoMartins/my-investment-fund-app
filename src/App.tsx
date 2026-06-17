import { BrowserRouter, Routes, Route } from 'react-router-dom';
import { Dashboard } from './pages/Dashboard';
import { Stocks } from './pages/Stocks';

function App() {
  return (
    <BrowserRouter>
      <Routes>
        <Route path="/" element={<Dashboard />} />
        <Route path="/stocks" element={<Stocks />} />
      </Routes>
    </BrowserRouter>
  );
}

export default App;
