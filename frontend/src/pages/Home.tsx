import { useState } from 'react';
import type { MouseEvent } from 'react';
import { useNavigate } from 'react-router-dom';

export default function Home() {
  const navigate = useNavigate();
  const [mousePos, setMousePos] = useState({ x: 50, y: 50 });
  const [isFiring, setIsFiring] = useState(false);

  const handleMouseMove = (e: MouseEvent<HTMLDivElement>) => {
    const rect = e.currentTarget.getBoundingClientRect();
    const x = ((e.clientX - rect.left) / rect.width) * 100;
    const y = ((e.clientY - rect.top) / rect.height) * 100;
    setMousePos({ x, y });
  };

  const handleAction = (path: string) => {
    setIsFiring(true);
    setTimeout(() => {
      setIsFiring(false);
      navigate(path);
    }, 3000); // 3000ms explosive transition
  };

  return (
    <div className="page-container">
      {/* Full-screen cloudy light flash */}
      {isFiring && <div className="cloudy-flash"></div>}

      <div className="landing-layout">
        
        {/* LEFT: Cutout Robot with Laser Effects */}
        <div 
          className="hero-robot-container cutout" 
          onMouseMove={handleMouseMove}
          onMouseLeave={() => setMousePos({ x: 50, y: 50 })}
        >
          <img src="/hero_new.png" alt="Futuristic Robot" className="hero-img cutout-img" />
          
          {/* Iron Man Glow Follows Mouse */}
          <div className="iron-man-glow" style={{ left: `${mousePos.x}%`, top: `${mousePos.y}%` }}></div>
          
          {/* Multi-Laser Burst */}
          {isFiring && (
            <div className="laser-burst">
              <div className="laser-beam right-laser angle-1"></div>
              <div className="laser-beam right-laser angle-2"></div>
              <div className="laser-beam right-laser angle-3"></div>
              <div className="laser-beam right-laser angle-4"></div>
              <div className="laser-beam right-laser angle-5"></div>
            </div>
          )}
        </div>

        {/* RIGHT: Text & Profile */}
        <div className="landing-content">
          <h1>Intelligent Traffic Control</h1>
          <h2>Reinforcement Learning Backbone</h2>
          <p className="hero-desc">
            This platform demonstrates a robust tabular Reinforcement Learning architecture. The agent learns optimal traffic light sequencing purely through environmental rewards, minimizing global vehicle wait times in a simulated intersection.
          </p>

          <div className="vision-box">
            <h3>🚀 Future Roadmap</h3>
            <p>
              Designed to scale into continuous state spaces via Deep RL, integrate with <strong>MuJoCo physics simulators</strong>, and deploy as <strong>ROS 2 nodes</strong> for physical robotic actuation.
            </p>
          </div>

          <div style={{ marginTop: '2rem', display: 'flex', gap: '1rem' }}>
            <button className="cyber-btn btn-primary" onClick={() => handleAction('/train')} disabled={isFiring}>
              Initialize Training
            </button>
            <button className="cyber-btn" onClick={() => handleAction('/simulate')} disabled={isFiring}>
              Live Simulation
            </button>
          </div>

          <hr className="divider" />

          <div className="dev-strip">
            <div className="dev-avatar">
              <img src="/profile.jpg" alt="Megavarshan" style={{ width: '100%', height: '100%', borderRadius: '50%', objectFit: 'cover' }} />
            </div>
            <div className="dev-info">
              <h3>Megavarshan A</h3>
              <span>Lead Developer & Researcher | AI Undergrad @ SRMIST</span>
            </div>
            <a href="https://megavarshan.vercel.app" target="_blank" rel="noopener noreferrer" className="cyber-btn small">
              Portfolio
            </a>
          </div>

        </div>
      </div>
    </div>
  );
}
