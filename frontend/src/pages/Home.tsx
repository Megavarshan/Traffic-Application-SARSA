import { useState } from 'react';
import type { MouseEvent } from 'react';
import { useNavigate } from 'react-router-dom';

export default function Home() {
  const navigate = useNavigate();
  const [mousePos, setMousePos] = useState({ x: 50, y: 50 });

  // Track mouse position over the robot to move the glow
  const handleMouseMove = (e: MouseEvent<HTMLDivElement>) => {
    const rect = e.currentTarget.getBoundingClientRect();
    const x = ((e.clientX - rect.left) / rect.width) * 100;
    const y = ((e.clientY - rect.top) / rect.height) * 100;
    setMousePos({ x, y });
  };

  return (
    <div className="page-container">
      <div className="landing-layout">
        {/* LEFT: Big Robot with Iron Man Effect */}
        <div 
          className="hero-robot-container" 
          onMouseMove={handleMouseMove}
          onMouseLeave={() => setMousePos({ x: 50, y: 50 })}
        >
          <img src="/hero.png" alt="Futuristic Robot" className="hero-img" />
          {/* Dynamic Iron Man Arc Reactor Glow */}
          <div 
            className="iron-man-glow"
            style={{
              left: `${mousePos.x}%`,
              top: `${mousePos.y}%`,
            }}
          ></div>
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
            <button className="cyber-btn btn-primary" onClick={() => navigate('/train')}>
              Initialize Training
            </button>
            <button className="cyber-btn" onClick={() => navigate('/simulate')}>
              Live Simulation
            </button>
          </div>

          <hr className="divider" />

          {/* New Developer Profile Strip */}
          <div className="dev-strip">
            <div className="dev-avatar">MA</div>
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
