<div align="center">
  <h1>🚦 Smart Traffic Light Optimizer via SARSA Reinforcement Learning</h1>
  <p>
    An intelligent, autonomous traffic light management system powered by <strong>Reinforcement Learning (SARSA)</strong>, wrapped in a high-performance, futuristic <strong>React (Vite)</strong> frontend and a lightning-fast <strong>FastAPI</strong> backend.
  </p>

  <p>
    <img src="https://img.shields.io/badge/Python-3776AB?style=for-the-badge&logo=python&logoColor=white" alt="Python"/>
    <img src="https://img.shields.io/badge/FastAPI-009688?style=for-the-badge&logo=fastapi&logoColor=white" alt="FastAPI"/>
    <img src="https://img.shields.io/badge/React-20232A?style=for-the-badge&logo=react&logoColor=61DAFB" alt="React"/>
    <img src="https://img.shields.io/badge/Vite-B73BFE?style=for-the-badge&logo=vite&logoColor=FFD62E" alt="Vite"/>
    <img src="https://img.shields.io/badge/Vercel-000000?style=for-the-badge&logo=vercel&logoColor=white" alt="Vercel"/>
    <img src="https://img.shields.io/badge/Render-%2346E3B7.svg?style=for-the-badge&logo=render&logoColor=white" alt="Render"/>
  </p>
</div>

---

## 📖 Overview

Traffic congestion in modern cities causes massive delays and emissions. Traditional traffic lights operate on rigid, static timers that fail to adapt to real-time road conditions.

This project solves that by deploying a **Reinforcement Learning Agent (SARSA)** that actively monitors the intersection and mathematically calculates the optimal light configuration (North/South vs East/West) to maximize global traffic **throughput** and minimize **queue lengths**.

## ✨ Key Features

- **🧠 Live Agent Training:** Dynamically train the RL model on the fly by adjusting hyperparameters (Episodes, Learning Rate α, Discount Factor γ, Epsilon ε) directly from the UI.
- **🏎️ Real-Time Simulation Dashboard:** Watch the intelligent agent control traffic flow in a live 2D simulated intersection.
- **📊 Agent Explainability:** See the exact mathematical **Q-Values (Quality Scores)** the agent calculates in real-time before it makes a decision.
- **⚡ High Performance Stack:** The backend handles complex matrix math with `numpy` and serves endpoints instantly via `FastAPI`. The frontend is built for extreme speed with `Vite` and `React`.
- **📱 Fully Responsive:** The entire dashboard scales flawlessly on both ultra-wide monitors and mobile devices.

## 🛠️ Technology Stack

### Artificial Intelligence & Backend
* **Algorithm:** SARSA (State-Action-Reward-State-Action) on-policy RL.
* **Framework:** Python 3, FastAPI, Uvicorn, Numpy.
* **Hosting:** Render (`traffic-application-sarsa.onrender.com`)

### Interactive Frontend
* **Framework:** React 18, Vite, TypeScript.
* **Styling:** Custom Vanilla CSS with Cyberpunk/Glassmorphism design language.
* **Visualizations:** Recharts for training graphs, native SVG for live simulation.
* **Hosting:** Vercel (`traffic-application-sarsa.vercel.app`)

---

## 🚀 Local Setup & Installation

Want to run the simulation locally? Follow these steps:

### 1. Clone the Repository
```bash
git clone https://github.com/Megavarshan/Traffic-Application-SARSA.git
cd Traffic-Application-SARSA
```

### 2. Start the FastAPI Backend
```bash
cd backend
python -m venv venv
source venv/bin/activate  # On Windows use `venv\Scripts\activate`
pip install -r requirements.txt
uvicorn main:app --reload
```
*The backend will be live at `http://localhost:8000`*

### 3. Start the React Frontend
Open a new terminal window:
```bash
cd frontend
npm install
npm run dev
```
*The frontend will be live at `http://localhost:5173`*

---

## 🧠 Reinforcement Learning Concepts Explained

If you're exploring the codebase, here are the core concepts driving the AI:

* **State Space:** The agent observes the current queue lengths on the North-South and East-West roads.
* **Action Space:** The agent can choose to turn the light **Green for North-South** (Action 0) or **Green for East-West** (Action 1).
* **Reward Function:** The agent is heavily penalized (negative reward) for long traffic queues, forcing it to find the optimal strategy to clear the intersection.
* **SARSA Algorithm:** Unlike Q-Learning, SARSA evaluates actions based on the *actual* next action the agent takes, making it a safer, on-policy learning approach.

---

<div align="center">
  <b>Architected & Engineered by Megavarshan A</b> <br>
  <i>Lead Developer & Researcher | AI Undergrad @ SRMIST</i>
</div>
