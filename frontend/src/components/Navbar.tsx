import { Link, useLocation } from 'react-router-dom';
import { Cpu, Activity, Play } from 'lucide-react';

export default function Navbar() {
  const location = useLocation();

  const getLinkClass = (path: string) => {
    return location.pathname === path ? "nav-link active" : "nav-link";
  };

  return (
    <nav className="navbar">
      <div className="nav-brand">
        <Cpu className="brand-icon" />
        <span>SARSA.ai</span>
      </div>
      <div className="nav-links">
        <Link to="/" className={getLinkClass('/')}>Home</Link>
        <Link to="/train" className={getLinkClass('/train')}>
          <Activity size={18} /> Train Core
        </Link>
        <Link to="/simulate" className={getLinkClass('/simulate')}>
          <Play size={18} /> Live Simulation
        </Link>
      </div>
    </nav>
  );
}
