import { useState, useEffect } from 'react';
import './index.css';

const API_BASE = import.meta.env.VITE_API_BASE || 'http://localhost:8000/api';

function App() {
  const [isTraining, setIsTraining] = useState(false);
  const [isSimulating, setIsSimulating] = useState(false);
  const [trainingData, setTrainingData] = useState<{rewards: number[], throughputs: number[]} | null>(null);
  
  const [state, setState] = useState({
    queue_ns: 0,
    queue_ew: 0,
    action: 0, // 0 = NS Green, 1 = EW Green
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
      }, 800) as unknown as number; // 800ms step for animation
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
                // Normalize for bar chart height
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

export default App;
