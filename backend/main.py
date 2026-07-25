from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware
from pydantic import BaseModel
import numpy as np
import random

app = FastAPI(title="SARSA Traffic API")

# Allow React frontend to connect
app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

class TrafficEnvironment:
    def __init__(self, max_queue=10):
        self.queue_ns = 0
        self.queue_ew = 0
        self.max_queue = max_queue

    def reset(self):
        self.queue_ns = random.randint(0, 3)
        self.queue_ew = random.randint(0, 3)
        return self._get_state()

    def _get_state(self):
        def discretize(q):
            if q <= 3: return 0
            elif q <= 7: return 1
            else: return 2
        return (discretize(self.queue_ns), discretize(self.queue_ew))

    def step(self, action):
        self.queue_ns = min(self.queue_ns + random.randint(0, 2), self.max_queue)
        self.queue_ew = min(self.queue_ew + random.randint(0, 2), self.max_queue)
        
        throughput = 0
        if action == 0:
            cleared = min(self.queue_ns, 4)
            self.queue_ns -= cleared
            throughput += cleared
        else:
            cleared = min(self.queue_ew, 4)
            self.queue_ew -= cleared
            throughput += cleared

        reward = -(self.queue_ns + self.queue_ew)
        return self._get_state(), reward, throughput

class SARSAAgent:
    def __init__(self, alpha=0.1, gamma=0.9, epsilon=1.0, epsilon_decay=0.995, epsilon_min=0.01):
        self.q_table = np.zeros((3, 3, 2)) 
        self.alpha = alpha
        self.gamma = gamma
        self.epsilon = epsilon
        self.epsilon_decay = epsilon_decay
        self.epsilon_min = epsilon_min
        self.train_mode = True

    def choose_action(self, state):
        if self.train_mode and random.uniform(0, 1) < self.epsilon:
            return random.choice([0, 1])
        return int(np.argmax(self.q_table[state[0], state[1]]))

    def learn(self, state, action, reward, next_state, next_action):
        q_current = self.q_table[state[0], state[1], action]
        q_next = self.q_table[next_state[0], next_state[1], next_action]
        td_target = reward + self.gamma * q_next
        td_error = td_target - q_current
        self.q_table[state[0], state[1], action] += self.alpha * td_error

    def decay_epsilon(self):
        self.epsilon = max(self.epsilon_min, self.epsilon * self.epsilon_decay)

# Global instances
env = TrafficEnvironment()
agent = SARSAAgent()

class TrainRequest(BaseModel):
    episodes: int = 500

@app.post("/api/train")
def train_agent(req: TrainRequest):
    agent.train_mode = True
    agent.epsilon = 1.0 # Reset exploration for new training
    
    rewards = []
    throughputs = []
    
    for episode in range(req.episodes):
        state = env.reset()
        action = agent.choose_action(state)
        
        total_reward = 0
        total_throughput = 0
        
        for _ in range(50):
            next_state, reward, throughput = env.step(action)
            next_action = agent.choose_action(next_state)
            
            agent.learn(state, action, reward, next_state, next_action)
            
            state, action = next_state, next_action
            total_reward += reward
            total_throughput += throughput
            
        agent.decay_epsilon()
        rewards.append(total_reward)
        throughputs.append(total_throughput)
        
    return {"message": "Training complete", "rewards": rewards, "throughputs": throughputs}

@app.post("/api/simulate/reset")
def reset_simulation():
    agent.train_mode = False
    env.reset()
    return {
        "queue_ns": env.queue_ns,
        "queue_ew": env.queue_ew
    }

@app.post("/api/simulate/step")
def step_simulation():
    state = env._get_state()
    action = agent.choose_action(state) # 0 = NS Green, 1 = EW Green
    q_values = agent.q_table[state[0], state[1]].tolist() # Extract Q-values for current state
    
    next_state, reward, throughput = env.step(action)
    
    return {
        "action": action, # Light chosen (0=NS, 1=EW)
        "queue_ns": env.queue_ns,
        "queue_ew": env.queue_ew,
        "reward": reward,
        "throughput": throughput,
        "q_values": q_values
    }
