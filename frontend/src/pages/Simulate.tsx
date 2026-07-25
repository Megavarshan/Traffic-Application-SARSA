import { useState, useEffect, useRef } from 'react';

const API_BASE = import.meta.env.VITE_API_BASE || 'http://localhost:8000/api';

export default function Simulate() {
  const [isSimulating, setIsSimulating] = useState(false);
  const [state, setState] = useState({
    queue_ns: 0,
    queue_ew: 0,
    action: 0, 
    throughput: 0,
    q_values: [0, 0]
  });

  const [logs, setLogs] = useState<string[]>([]);
  const logEndRef = useRef<HTMLDivElement>(null);

  const addLog = (msg: string) => {
    setLogs(prev => [...prev, msg].slice(-15)); 
  };

  useEffect(() => {
    logEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [logs]);

  const startSimulation = async () => {
    if (isSimulating) return;
    addLog("[SIMULATION] Resetting environment...");
    try {
      const res = await fetch(`${API_BASE}/simulate/reset`, { method: 'POST' });
      const data = await res.json();
      setState(prev => ({ ...prev, queue_ns: data.queue_ns, queue_ew: data.queue_ew, q_values: [0,0] }));
      setIsSimulating(true);
    } catch (e) {
      console.error(e);
      addLog("[ERROR] Backend not reachable.");
    }
  };

  const stopSimulation = () => {
    setIsSimulating(false);
    isSimulatingRef.current = false;
    addLog("[SIMULATION] Halted by user.");
  };

  const isSimulatingRef = useRef(false);

  useEffect(() => {
    isSimulatingRef.current = isSimulating;
  }, [isSimulating]);

  useEffect(() => {
    let timeoutId: number;

    const runStep = async () => {
      if (!isSimulatingRef.current) return;

      try {
        const res = await fetch(`${API_BASE}/simulate/step`, { method: 'POST' });
        if (!res.ok) throw new Error("Network Error");
        const data = await res.json();
        
        setState({
          queue_ns: data.queue_ns,
          queue_ew: data.queue_ew,
          action: data.action,
          throughput: data.throughput,
          q_values: data.q_values || [0, 0]
        });

        const actionStr = data.action === 0 ? "NS GREEN" : "EW GREEN";
        addLog(`[STATE] NS: ${data.queue_ns} | EW: ${data.queue_ew} -> Max Q chosen: ${actionStr}`);
      } catch (e) {
        setIsSimulating(false);
        isSimulatingRef.current = false;
      }

      // Recursive call only if we are still supposed to be simulating
      if (isSimulatingRef.current) {
        timeoutId = window.setTimeout(runStep, 800);
      }
    };

    if (isSimulating) {
      runStep();
    }
    
    return () => {
      if (timeoutId) {
        clearTimeout(timeoutId);
      }
    };
  }, [isSimulating]);

  const q_ns = state.q_values[0];
  const q_ew = state.q_values[1];
  const min_q = Math.min(q_ns, q_ew, -20);
  const max_q = Math.max(q_ns, q_ew, 0);
  const range = max_q - min_q || 1;
  const pct_ns = ((q_ns - min_q) / range) * 100;
  const pct_ew = ((q_ew - min_q) / range) * 100;

  return (
    <div className="page-container">
      <div className="dashboard-container">
        
        {/* CENTER: Live Simulation */}
        <div className="glass-panel simulation-panel">
          <h2>Live Intersection</h2>
          
          {/* Controls tightly integrated into the flow */}
          <div style={{ margin: '1rem 0', display: 'flex', gap: '1rem', width: '100%', justifyContent: 'center' }}>
            {!isSimulating ? (
               <button className="cyber-btn" onClick={startSimulation} style={{ width: '200px' }}>START SIMULATION</button>
            ) : (
               <button className="cyber-btn" onClick={stopSimulation} style={{ width: '200px', borderColor: '#ff0055', color: '#ff0055' }}>HALT SYSTEM</button>
            )}
          </div>

          <div className="metrics-grid" style={{ marginTop: '0', marginBottom: '2rem' }}>
            <div className="metric-card">
              <div className="metric-val" style={{ color: '#00f0ff' }}>{state.queue_ns + state.queue_ew}</div>
              <div className="metric-label">Total Queued</div>
            </div>
            <div className="metric-card">
              <div className="metric-val" style={{ color: '#00ffaa' }}>{state.throughput}</div>
              <div className="metric-label">Cleared Cars</div>
            </div>
          </div>

          <div className="intersection-svg-container" style={{ marginTop: 0 }}>
             {/* Better SVG-based visualizer, scaled via viewBox */}
             <svg viewBox="0 0 400 400" width="300" height="300" className="intersection-svg">
               <rect width="100%" height="100%" fill="#0a0a0a" rx="12" />
               {/* Roads */}
               <rect x="140" y="0" width="120" height="400" fill="#151515" />
               <rect x="0" y="140" width="400" height="120" fill="#151515" />
               
               {/* Dashed lines */}
               <line x1="200" y1="0" x2="200" y2="140" stroke="#444" strokeWidth="2" strokeDasharray="10 10" />
               <line x1="200" y1="260" x2="200" y2="400" stroke="#444" strokeWidth="2" strokeDasharray="10 10" />
               <line x1="0" y1="200" x2="140" y2="200" stroke="#444" strokeWidth="2" strokeDasharray="10 10" />
               <line x1="260" y1="200" x2="400" y2="200" stroke="#444" strokeWidth="2" strokeDasharray="10 10" />

               {/* Center */}
               <rect x="140" y="140" width="120" height="120" fill="#222" />

               {/* NS Lights */}
               <circle cx="160" cy="120" r="8" fill={state.action === 1 ? '#ff0055' : '#333'} />
               <circle cx="180" cy="120" r="8" fill={state.action === 0 ? '#00ffaa' : '#333'} />

               {/* EW Lights */}
               <circle cx="120" cy="160" r="8" fill={state.action === 0 ? '#ff0055' : '#333'} />
               <circle cx="120" cy="180" r="8" fill={state.action === 1 ? '#00ffaa' : '#333'} />
               
               {/* Render Cars as simple SVG shapes instead of emojis */}
               {Array.from({ length: Math.min(state.queue_ns, 6) }).map((_, i) => (
                  <rect key={`ns-${i}`} x="160" y={15 - i * 25} width="20" height="40" fill="#00f0ff" rx="4" />
               ))}
               {Array.from({ length: Math.min(state.queue_ew, 6) }).map((_, i) => (
                  <rect key={`ew-${i}`} x={15 - i * 25} y="160" width="40" height="20" fill="#ffaa00" rx="4" />
               ))}
             </svg>
          </div>
        </div>

        {/* RIGHT: Explainability */}
        <div className="glass-panel brain-panel">
          <h2>Agent Thought Process</h2>
          
          <div className="q-value-bar-container">
            <div className="q-label"><span>Q(NS Green)</span> <span>{q_ns.toFixed(2)}</span></div>
            <div className="q-bar-bg">
              <div className="q-bar-fill" style={{ width: `${pct_ns}%`, background: state.action === 0 ? '#00ffaa' : '#555' }}></div>
            </div>

            <div className="q-label" style={{ marginTop: '10px' }}><span>Q(EW Green)</span> <span>{q_ew.toFixed(2)}</span></div>
            <div className="q-bar-bg">
              <div className="q-bar-fill" style={{ width: `${pct_ew}%`, background: state.action === 1 ? '#00ffaa' : '#555' }}></div>
            </div>
          </div>

          <h2 style={{ marginTop: '1rem', fontSize: '0.9rem' }}>System Log</h2>
          <div className="terminal-log">
            {logs.map((log, i) => (
              <div key={i} className="log-line">{log}</div>
            ))}
            <div ref={logEndRef} />
          </div>
        </div>

      </div>
    </div>
  );
}
