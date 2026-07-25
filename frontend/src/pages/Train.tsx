import { useState } from 'react';
import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer } from 'recharts';

const API_BASE = import.meta.env.VITE_API_BASE || 'http://localhost:8000/api';

export default function Train() {
  const [params, setParams] = useState({
    episodes: 500,
    alpha: 0.1,
    gamma: 0.9,
    epsilon: 1.0
  });

  const [isTraining, setIsTraining] = useState(false);
  const [chartData, setChartData] = useState<any[]>([]);

  const handleTrain = async () => {
    setIsTraining(true);
    try {
      const res = await fetch(`${API_BASE}/train`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(params)
      });
      const data = await res.json();
      
      // Format data for Recharts
      const formatted = data.throughputs.map((throughput: number, index: number) => ({
        episode: index + 1,
        throughput: throughput,
        reward: data.rewards[index]
      }));
      setChartData(formatted);
    } catch (e) {
      console.error(e);
      alert("Backend connection failed.");
    }
    setIsTraining(false);
  };

  return (
    <div className="page-container">
      <div className="train-layout">
        
        {/* LEFT: Controls */}
        <div className="glass-panel">
          <h2>Hyperparameters</h2>
          <div className="param-group">
            <label>Episodes: {params.episodes}</label>
            <p className="param-desc">Total number of training cycles the agent will complete.</p>
            <input 
              type="range" min="100" max="2000" step="100" 
              value={params.episodes} 
              onChange={e => setParams({...params, episodes: parseInt(e.target.value)})} 
            />
          </div>
          <div className="param-group">
            <label>Learning Rate (α): {params.alpha.toFixed(2)}</label>
            <p className="param-desc">How quickly the agent overrides old knowledge with new information. (1.0 = immediate override)</p>
            <input 
              type="range" min="0.01" max="1.0" step="0.01" 
              value={params.alpha} 
              onChange={e => setParams({...params, alpha: parseFloat(e.target.value)})} 
            />
          </div>
          <div className="param-group">
            <label>Discount Factor (γ): {params.gamma.toFixed(2)}</label>
            <p className="param-desc">Determines how much the agent cares about long-term future rewards vs immediate payoff.</p>
            <input 
              type="range" min="0.1" max="1.0" step="0.1" 
              value={params.gamma} 
              onChange={e => setParams({...params, gamma: parseFloat(e.target.value)})} 
            />
          </div>
          <div className="param-group">
            <label>Initial Exploration (ε): {params.epsilon.toFixed(2)}</label>
            <p className="param-desc">Probability of picking a completely random traffic light to discover new strategies.</p>
            <input 
              type="range" min="0.1" max="1.0" step="0.1" 
              value={params.epsilon} 
              onChange={e => setParams({...params, epsilon: parseFloat(e.target.value)})} 
            />
          </div>

          <button className="cyber-btn btn-primary" onClick={handleTrain} disabled={isTraining} style={{ width: '100%', marginTop: '2rem' }}>
            {isTraining ? "TRAINING..." : "BEGIN TRAINING SEQUENCE"}
          </button>
        </div>

        {/* RIGHT: Real Chart */}
        <div className="glass-panel chart-panel">
          <h2>Training Performance</h2>
          {chartData.length > 0 ? (
            <div style={{ width: '100%', height: 400, marginTop: '2rem' }}>
              <ResponsiveContainer>
                <LineChart data={chartData} margin={{ top: 5, right: 20, bottom: 5, left: 0 }}>
                  <CartesianGrid strokeDasharray="3 3" stroke="#333" />
                  <XAxis dataKey="episode" stroke="#888" />
                  <YAxis stroke="#888" />
                  <Tooltip 
                    contentStyle={{ backgroundColor: 'rgba(10,15,25,0.9)', border: '1px solid #00f0ff' }}
                    itemStyle={{ color: '#00f0ff' }}
                  />
                  <Line type="monotone" dataKey="throughput" stroke="#00f0ff" strokeWidth={2} dot={false} />
                </LineChart>
              </ResponsiveContainer>
            </div>
          ) : (
            <div className="empty-chart">
              <p>Initialize training to view metrics.</p>
            </div>
          )}
        </div>

      </div>
    </div>
  );
}
