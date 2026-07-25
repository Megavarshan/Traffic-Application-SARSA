import { useState, useEffect } from 'react';
import './index.css';

const API_BASE = import.meta.env.VITE_API_BASE || 'http://localhost:8000/api';

function LandingPage({ onEnter }: { onEnter: () => void }) {
  return (
    <div className="landing-container">
      {/* LEFT: Project Vision */}
      <div className="landing-left">
        <h1>Intelligent Traffic Control</h1>
        <h2 style={{ color: '#a0a0a0', fontSize: '1.5rem', fontWeight: 400, marginTop: '-10px' }}>
          Reinforcement Learning (SARSA) Backbone
        </h2>
        
        <p style={{ fontSize: '1.1rem', marginTop: '1rem', maxWidth: '600px' }}>
          This project demonstrates a robust tabular Reinforcement Learning architecture designed from first principles. The agent learns optimal traffic light sequencing purely through environmental rewards, minimizing global vehicle wait times in a simulated intersection.
        </p>

        <div className="vision-box">
          <h3>🚀 Future Roadmap: Sim-to-Real & ROS</h3>
          <p>
            While this core relies on tabular RL for explainability, the architecture is designed to scale. Future iterations aim to migrate this decision-engine into continuous state spaces (via Deep RL algorithms like PPO), test inside <strong>MuJoCo physics simulators</strong>, and eventually deploy as <strong>ROS 2 nodes</strong> for physical robot/actuator control in real-world environments.
          </p>
        </div>

        <div style={{ marginTop: '2rem' }}>
          <button className="cyber-btn btn-primary" onClick={onEnter}>
            Enter Simulation Dashboard 
            <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M5 12h14"></path><path d="m12 5 7 7-7 7"></path></svg>
          </button>
        </div>
      </div>

      {/* RIGHT: Developer Profile */}
      <div className="landing-right">
        <div className="profile-card">
          <div className="profile-img-container">
            <div className="profile-img">🤖</div>
          </div>
          
          <h2>Megavarshan A</h2>
          <div className="profile-title">Lead Developer & Researcher</div>

          <div className="profile-socials">
            {/* LinkedIn Icon */}
            <svg className="social-icon" viewBox="0 0 24 24">
              <path d="M20.447 20.452h-3.554v-5.569c0-1.328-.027-3.037-1.852-3.037-1.853 0-2.136 1.445-2.136 2.939v5.667H9.351V9h3.414v1.561h.046c.477-.9 1.637-1.85 3.37-1.85 3.601 0 4.267 2.37 4.267 5.455v6.286zM5.337 7.433c-1.144 0-2.063-.926-2.063-2.065 0-1.138.92-2.063 2.063-2.063 1.14 0 2.064.925 2.064 2.063 0 1.139-.925 2.065-2.064 2.065zm1.782 13.019H3.555V9h3.564v11.452zM22.225 0H1.771C.792 0 0 .774 0 1.729v20.542C0 23.227.792 24 1.771 24h20.451C23.2 24 24 23.227 24 22.271V1.729C24 .774 23.2 0 22.222 0h.003z"/>
            </svg>
            {/* GitHub Icon */}
            <svg className="social-icon" viewBox="0 0 24 24">
              <path d="M12 .297c-6.63 0-12 5.373-12 12 0 5.303 3.438 9.8 8.205 11.385.6.113.82-.258.82-.577 0-.285-.01-1.04-.015-2.04-3.338.724-4.042-1.61-4.042-1.61C4.422 18.07 3.633 17.7 3.633 17.7c-1.087-.744.084-.729.084-.729 1.205.084 1.838 1.236 1.838 1.236 1.07 1.835 2.809 1.305 3.495.998.108-.776.417-1.305.76-1.605-2.665-.3-5.466-1.332-5.466-5.93 0-1.31.465-2.38 1.235-3.22-.135-.303-.54-1.523.105-3.176 0 0 1.005-.322 3.3 1.23.96-.267 1.98-.399 3-.405 1.02.006 2.04.138 3 .405 2.28-1.552 3.285-1.23 3.285-1.23.645 1.653.24 2.873.12 3.176.765.84 1.23 1.91 1.23 3.22 0 4.61-2.805 5.625-5.475 5.92.42.36.81 1.096.81 2.22 0 1.606-.015 2.896-.015 3.286 0 .315.21.69.825.57C20.565 22.092 24 17.592 24 12.297c0-6.627-5.373-12-12-12"/>
            </svg>
          </div>

          <div className="profile-details">
            <div className="profile-item">
              <span>🎓</span> Final Year AI Undergrad at SRMIST, Chennai
            </div>
            <div className="profile-item">
              <span>🚀</span> Co-Founder, Foresight-X Research Labs
            </div>
            <div className="profile-item">
              <span>🏆</span> Award Winner at SRM Research Day 2026
            </div>
          </div>

          <a href="https://megavarshan.vercel.app" target="_blank" rel="noopener noreferrer" style={{ width: '100%', textDecoration: 'none' }}>
            <button className="full-profile-btn">
              View Full Profile
            </button>
          </a>
        </div>
      </div>
    </div>
  );
}

function Dashboard() {
  const [isTraining, setIsTraining] = useState(false);
  const [isSimulating, setIsSimulating] = useState(false);
  const [trainingData, setTrainingData] = useState<{rewards: number[], throughputs: number[]} | null>(null);
  
  const [state, setState] = useState({
    queue_ns: 0,
    queue_ew: 0,
    action: 0, 
    throughput: 0
  });

  const handleTrain = async () => {
    setIsTraining(true);
    try {
      const res = await fetch(`${API_BASE}/train`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ episodes: 500 })
      });
      const data = await res.json();
      setTrainingData(data);
    } catch (e) {
      console.error(e);
      alert("Failed to reach backend. Ensure Python API is running on port 8000.");
    }
    setIsTraining(false);
  };

  const startSimulation = async () => {
    setIsSimulating(true);
    try {
      const res = await fetch(`${API_BASE}/simulate/reset`, { method: 'POST' });
      const data = await res.json();
      setState(prev => ({ ...prev, queue_ns: data.queue_ns, queue_ew: data.queue_ew }));
    } catch (e) {
      console.error(e);
    }
  };

  const stopSimulation = () => {
    setIsSimulating(false);
  };

  useEffect(() => {
    let interval: number;
    if (isSimulating) {
      interval = setInterval(async () => {
        try {
          const res = await fetch(`${API_BASE}/simulate/step`, { method: 'POST' });
          const data = await res.json();
          setState({
            queue_ns: data.queue_ns,
            queue_ew: data.queue_ew,
            action: data.action,
            throughput: data.throughput
          });
        } catch (e) {
          console.error(e);
          setIsSimulating(false);
        }
      }, 800) as unknown as number;
    }
    return () => clearInterval(interval);
  }, [isSimulating]);

  return (
    <div className="dashboard-container">
      {/* LEFT PANEL - CONTROL */}
      <div className="glass-panel control-panel">
        <h1>SARSA Core</h1>
        <p>Advanced Reinforcement Learning Interface</p>
        
        <div style={{ marginTop: '2rem' }}>
          <h2>1. Train Agent</h2>
          <p>Initialize a high-speed SARSA training loop on the Python backend (500 episodes).</p>
          <button className="cyber-btn" onClick={handleTrain} disabled={isTraining || isSimulating}>
            {isTraining ? "Initializing..." : "Initiate Training"}
          </button>
        </div>

        {trainingData && (
          <div style={{ marginTop: '2rem' }}>
            <h2>Training Metrics</h2>
            <p>Throughput progression over episodes:</p>
            <div className="chart-container">
              {trainingData.throughputs.slice(0, 50).map((val, i) => {
                const max = Math.max(...trainingData.throughputs);
                const height = (val / max) * 100;
                return <div key={i} className="chart-bar" style={{ height: `${height}%` }}></div>;
              })}
            </div>
          </div>
        )}
      </div>

      {/* RIGHT PANEL - SIMULATION */}
      <div className="glass-panel simulation-panel">
        <div style={{ position: 'absolute', top: '2rem', left: '2rem' }}>
          <h2>Live Intersection</h2>
          {!isSimulating ? (
             <button className="cyber-btn" onClick={startSimulation} disabled={!trainingData}>
               {trainingData ? "Start Simulation" : "Train Agent First"}
             </button>
          ) : (
             <button className="cyber-btn" onClick={stopSimulation} style={{ borderColor: '#ff0055', color: '#ff0055' }}>
               Halt System
             </button>
          )}
        </div>

        <div className="intersection">
          <div className="road-ns"></div>
          <div className="road-ew"></div>
          <div className="center-box"></div>

          {/* NS Light */}
          <div className="traffic-light ns">
            <div className={`light-bulb red ${state.action === 1 ? 'active' : ''}`}></div>
            <div className={`light-bulb green ${state.action === 0 ? 'active' : ''}`}></div>
          </div>

          {/* EW Light */}
          <div className="traffic-light ew">
            <div className={`light-bulb red ${state.action === 0 ? 'active' : ''}`}></div>
            <div className={`light-bulb green ${state.action === 1 ? 'active' : ''}`}></div>
          </div>

          {/* Render NS Robots */}
          {Array.from({ length: Math.min(state.queue_ns, 5) }).map((_, i) => (
             <div key={`ns-${i}`} className="robot ns" style={{ top: `${15 - i * 40}px` }}>🤖</div>
          ))}

          {/* Render EW Robots */}
          {Array.from({ length: Math.min(state.queue_ew, 5) }).map((_, i) => (
             <div key={`ew-${i}`} className="robot ew" style={{ left: `${15 - i * 40}px` }}>🛸</div>
          ))}
        </div>

        <div className="metrics-box" style={{ width: '400px' }}>
          <div className="metric">
            <div className="metric-val">{state.queue_ns + state.queue_ew}</div>
            <div className="metric-label">Queue Length</div>
          </div>
          <div className="metric">
            <div className="metric-val" style={{ color: '#00ffaa' }}>{state.throughput}</div>
            <div className="metric-label">Step Throughput</div>
          </div>
          <div className="metric">
            <div className="metric-val" style={{ color: state.action === 0 ? '#66fcf1' : '#ff0055' }}>
              {state.action === 0 ? "NS" : "EW"}
            </div>
            <div className="metric-label">Active Phase</div>
          </div>
        </div>

      </div>
    </div>
  );
}

function App() {
  const [view, setView] = useState<'landing' | 'dashboard'>('landing');

  if (view === 'landing') {
    return <LandingPage onEnter={() => setView('dashboard')} />;
  }
  return <Dashboard />;
}

export default App;
