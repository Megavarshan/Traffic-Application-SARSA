import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
import Navbar from './components/Navbar';
import Home from './pages/Home';
import Train from './pages/Train';
import Simulate from './pages/Simulate';
import './index.css';

function App() {
  return (
    <Router>
      <Navbar />
      <Routes>
        <Route path="/" element={<Home />} />
        <Route path="/train" element={<Train />} />
        <Route path="/simulate" element={<Simulate />} />
      </Routes>
    </Router>
  );
}

export default App;
