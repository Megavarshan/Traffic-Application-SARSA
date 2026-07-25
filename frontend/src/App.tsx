import { useState, useEffect, useRef } from 'react';
import './index.css';

const API_BASE = import.meta.env.VITE_API_BASE || 'http://localhost:8000/api';

function LandingPage({ onEnter }: { onEnter: () => void }) {
  // (LandingPage content kept the same, omitted for brevity, see previous)
  return (
    <div className="landing-container">
      <div className="landing-left">
        <h1>Intelligent Traffic Control</h1>
        <h2 style={{ color: '#a0a0a0', fontSize: '1.5rem', fontWeight: 400, marginTop: '-10px' }}>Reinforcement Learning Backbone</h2>
        <p style={{ fontSize: '1.1rem', marginTop: '1rem', maxWidth: '600px' }}>
          This project demonstrates a robust tabular Reinforcement Learning architecture designed from first principles. The agent learns optimal traffic light sequencing purely through environmental rewards, minimizing global vehicle wait times in a simulated intersection.
        </p>
        <div className="vision-box">
          <h3>🚀 Future Roadmap: Sim-to-Real & ROS</h3>
          <p>While this core relies on tabular RL for explainability, the architecture is designed to scale. Future iterations aim to migrate this decision-engine into continuous state spaces (via Deep RL), test inside <strong>MuJoCo physics simulators</strong>, and eventually deploy as <strong>ROS 2 nodes</strong> for physical robot control.</p>
        </div>
        <div style={{ marginTop: '2rem' }}>
          <button className="cyber-btn btn-primary" onClick={onEnter}>Enter Simulation Dashboard</button>
        </div>
      </div>
      <div className="landing-right">
        <div className="profile-card">
          <div className="profile-img-container"><div className="profile-img">🤖</div></div>
          <h2>Megavarshan A</h2>
          <div className="profile-title">Lead Developer & Researcher</div>
          <div className="profile-details">
            <div className="profile-item"><span>🎓</span> Final Year AI Undergrad at SRMIST</div>
            <div className="profile-item"><span>🚀</span> Co-Founder, Foresight-X Research Labs</div>
          </div>
          <a href="https://megavarshan.vercel.app" target="_blank" rel="noopener noreferrer" style={{ width: '100%' }}>
            <button className="full-profile-btn">View Full Profile</button>
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
    throughput: 0,
    q_values: [0, 0] // [Q(NS), Q(EW)]
  });

  const [logs, setLogs] = useState<string[]>([]);
  const logEndRef = useRef<HTMLDivElement>(null);

  const addLog = (msg: string) => {
    setLogs(prev => [...prev, msg].slice(-15)); // keep last 15 logs
  };

  useEffect(() => {
    logEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [logs]);

  const handleTrain = async () => {
    setIsTraining(true);
    addLog("[SYSTEM] Initiating 500-episode SARSA training...");
    try {
      const res = await fetch(`${API_BASE}/train`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ episodes: 500 })
      });
      const data = await res.json();
      setTrainingData(data);
      addLog("[SYSTEM] Training complete. Agent ready for inference.");
    } catch (e) {
      addLog("[ERROR] Backend disconnected.");
    }
    setIsTraining(false);
  };

  const startSimulation = async () => {
    setIsSimulating(true);
    addLog("[SIMULATION] Resetting environment...");
    try {
      const res = await fetch(`${API_BASE}/simulate/reset`, { method: 'POST' });
      const data = await res.json();
      setState(prev => ({ ...prev, queue_ns: data.queue_ns, queue_ew: data.queue_ew, q_values: [0,0] }));
    } catch (e) {
      console.error(e);
    }
  };

  const stopSimulation = () => {
    setIsSimulating(false);
    addLog("[SIMULATION] Halted.");
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
            throughput: data.throughput,
            q_values: data.q_values || [0, 0]
          });

          // Explainability Log
          const actionStr = data.action === 0 ? "NS GREEN" : "EW GREEN";
          addLog(`[STATE] NS Queue: ${data.queue_ns} | EW Queue: ${data.queue_ew}`);
          addLog(`[Q-VALUES] Q(NS): ${data.q_values[0].toFixed(2)} | Q(EW): ${data.q_values[1].toFixed(2)}`);
          addLog(`[ACTION] Executing ${actionStr} (Max Q) -> Reward: ${data.reward}`);
          addLog("------------------------------------------------");

        } catch (e) {
          setIsSimulating(false);
        }
      }, 1000) as unknown as number; // 1 second steps for readability
    }
    return () => clearInterval(interval);
  }, [isSimulating]);

  // Normalize Q-values for progress bars (0 to 100%)
  const q_ns = state.q_values[0];
  const q_ew = state.q_values[1];
  const min_q = Math.min(q_ns, q_ew, -20);
  const max_q = Math.max(q_ns, q_ew, 0);
  const range = max_q - min_q || 1;
  const pct_ns = ((q_ns - min_q) / range) * 100;
  const pct_ew = ((q_ew - min_q) / range) * 100;

  return (
    <div className="dashboard-container">
      
      {/* 1. CONTROL PANEL */}
      <div className="glass-panel control-panel">
        <h1>SARSA Core</h1>
        <h2>RL Theory & Training</h2>
        <p style={{ fontSize: '0.85rem' }}>
          <strong>State:</strong> (Queue NS, Queue EW)<br/>
          <strong>Action:</strong> 0 (NS Green), 1 (EW Green)<br/>
          <strong>Reward:</strong> -(Queue NS + Queue EW)<br/>
          <strong>Equation:</strong> Q(S,A) = Q(S,A) + α[R + γQ(S',A') - Q(S,A)]
        </p>

        <div style={{ marginTop: '1rem' }}>
          <button className="cyber-btn btn-primary" onClick={handleTrain} disabled={isTraining || isSimulating} style={{ width: '100%' }}>
            {isTraining ? "INITIALIZING..." : "INITIATE TRAINING"}
          </button>
        </div>

        {trainingData && (
          <div style={{ marginTop: '1rem' }}>
            <h2 style={{ fontSize: '0.9rem' }}>Training Throughput Curve</h2>
            <div className="chart-container">
              {trainingData.throughputs.slice(0, 50).map((val, i) => {
                const height = (val / Math.max(...trainingData.throughputs)) * 100;
                return <div key={i} className="chart-bar" style={{ height: `${height}%` }}></div>;
              })}
            </div>
          </div>
        )}
      </div>

      {/* 2. SIMULATION PANEL */}
      <div className="glass-panel simulation-panel">
        <h2>Live Intersection</h2>
        <div style={{ position: 'absolute', top: '2rem', right: '2rem' }}>
          {!isSimulating ? (
             <button className="cyber-btn" onClick={startSimulation} disabled={!trainingData}>
               {trainingData ? "START" : "TRAIN FIRST"}
             </button>
          ) : (
             <button className="cyber-btn" onClick={stopSimulation} style={{ borderColor: '#ff0055', color: '#ff0055' }}>
               HALT
             </button>
          )}
        </div>

        <div className="intersection">
          <div className="road-ns"></div>
          <div className="road-ew"></div>
          <div className="center-box"></div>

          <div className="traffic-light ns">
            <div className={`light-bulb red ${state.action === 1 ? 'active' : ''}`}></div>
            <div className={`light-bulb green ${state.action === 0 ? 'active' : ''}`}></div>
          </div>
          <div className="traffic-light ew">
            <div className={`light-bulb red ${state.action === 0 ? 'active' : ''}`}></div>
            <div className={`light-bulb green ${state.action === 1 ? 'active' : ''}`}></div>
          </div>

          {Array.from({ length: Math.min(state.queue_ns, 5) }).map((_, i) => (
             <div key={`ns-${i}`} className="robot ns" style={{ top: `${15 - i * 35}px` }}>🤖</div>
          ))}
          {Array.from({ length: Math.min(state.queue_ew, 5) }).map((_, i) => (
             <div key={`ew-${i}`} className="robot ew" style={{ left: `${15 - i * 35}px` }}>🛸</div>
          ))}
        </div>

        <div className="metrics-grid">
          <div className="metric-card">
            <div className="metric-val" style={{ color: '#00f0ff' }}>{state.queue_ns + state.queue_ew}</div>
            <div className="metric-label">Total Queued</div>
          </div>
          <div className="metric-card">
            <div className="metric-val" style={{ color: '#00ffaa' }}>{state.throughput}</div>
            <div className="metric-label">Cleared Cars</div>
          </div>
        </div>
      </div>

      {/* 3. BRAIN / EXPLAINABILITY PANEL */}
      <div className="glass-panel brain-panel">
        <h2>Agent Thought Process</h2>
        
        <div className="q-value-bar-container">
          <div className="q-label"><span>Q(Action 0: NS Green)</span> <span>{q_ns.toFixed(2)}</span></div>
          <div className="q-bar-bg">
            <div className="q-bar-fill" style={{ width: `${pct_ns}%`, background: state.action === 0 ? '#00ffaa' : '#555' }}></div>
          </div>

          <div className="q-label" style={{ marginTop: '10px' }}><span>Q(Action 1: EW Green)</span> <span>{q_ew.toFixed(2)}</span></div>
          <div className="q-bar-bg">
            <div className="q-bar-fill" style={{ width: `${pct_ew}%`, background: state.action === 1 ? '#00ffaa' : '#555' }}></div>
          </div>
          <p style={{ fontSize: '0.75rem', marginTop: '10px', textAlign: 'center' }}>
            * Agent selects the action with the highest Q-Value
          </p>
        </div>

        <h2 style={{ marginTop: '1rem', fontSize: '0.9rem' }}>System Log</h2>
        <div className="terminal-log">
          {logs.map((log, i) => {
            let colorClass = "";
            if (log.includes("[STATE]")) colorClass = "log-state";
            if (log.includes("[Q-VALUES]")) colorClass = "log-action";
            if (log.includes("[ACTION]")) colorClass = "log-reward";
            return <div key={i} className={`log-line ${colorClass}`}>{log}</div>;
          })}
          <div ref={logEndRef} />
        </div>
      </div>

    </div>
  );
}

function App() {
  const [view, setView] = useState<'landing' | 'dashboard'>('landing');
  if (view === 'landing') return <LandingPage onEnter={() => setView('dashboard')} />;
  return <Dashboard />;
}
export default App;
