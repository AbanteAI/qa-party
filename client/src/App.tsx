import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
import Home from './pages/Home';
import SnakePage from './pages/SnakePage';

function App() {
  return (
    <Router>
      <Routes>
        <Route path="/" element={<Home />} />
        <Route path="/snake" element={<SnakePage />} />
      </Routes>
    </Router>
  );
}

export default App;
