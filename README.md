# Portfolio RL Agent: FastAPI + React

A professional, full-stack Reinforcement Learning dashboard demonstrating Traffic Signal Control using the **SARSA** algorithm. This project has been split into a Python API backend and a glowing, cyberpunk-themed React frontend.

## Architecture

1. **/backend**: A **FastAPI** Python server that runs the tabular SARSA logic, maintains the environment state, and serves API endpoints for training and simulation.
2. **/frontend**: A **Vite + React (TypeScript)** application that provides a beautiful, animated 2D intersection using CSS glassmorphism and robot emojis. Ready for 1-click deployment on Vercel.

## Running Locally

You will need two terminal windows.

**Terminal 1: Start the Python Backend**
```bash
cd backend
pip install -r requirements.txt
uvicorn main:app --reload --port 8000
```

**Terminal 2: Start the React Frontend**
```bash
cd frontend
npm install
npm run dev
```

Open `http://localhost:5173` in your browser. 

## RL Formulation (Tabular SARSA)

- **State Space**: The intersection has two directions: North-South (NS) and East-West (EW). We track the queue length, discretized into 3 bins (Low, Medium, High).
- **Action Space**: Green for NS (Action 0) or Green for EW (Action 1).
- **Reward Function**: `Reward = -(queue_NS + queue_EW)` (Minimize total wait time).

### Why Python + React?
This architecture mimics industry standards: Heavy math and RL agents run in a dedicated Python environment, while the user interface runs in a highly optimized, Vercel-deployable React frontend.
