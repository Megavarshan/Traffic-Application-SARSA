import streamlit as st
import numpy as np
import pandas as pd
import matplotlib.pyplot as plt
import random

# ==========================================
# MDP Formulation and RL Concepts
# ==========================================
r"""
### 🚦 Traffic Signal Control with SARSA

**1. MDP Formulation**
* **State Space ($S$)**: The intersection has two directions: North-South (NS) and East-West (EW). 
  We track the number of cars waiting in each direction. To keep the state space tabular and manageable, 
  we discretize the queue length into 3 bins: `0 (Low: 0-2 cars)`, `1 (Medium: 3-5 cars)`, `2 (High: 6+ cars)`.
  Thus, a state is a tuple `(queue_NS, queue_EW)`. There are $3 \times 3 = 9$ possible states.
* **Action Space ($A$)**: The traffic light can be green for NS or EW.
  `Action 0`: Green for NS (Red for EW)
  `Action 1`: Green for EW (Red for NS)
* **Reward Function ($R$)**: The goal is to minimize the total wait time. We define the reward as the 
  negative sum of the queues at the intersection: `Reward = -(queue_NS + queue_EW)`.

**2. Exploration Strategy**
* **Epsilon-Greedy**: During training, the agent explores random actions with probability $\epsilon$ (epsilon) 
  and exploits the best known action with probability $1 - \epsilon$.
* **Epsilon Decay**: Epsilon starts near 1.0 (100% exploration) and exponentially decays each episode, 
  gradually shifting the agent towards exploiting its learned policy.

**3. The SARSA Update Rule**
SARSA is an on-policy TD control algorithm. It updates the Q-value for a state-action pair based on the 
actual next action taken by the current policy.
The update equation is:
$$Q(S, A) \\leftarrow Q(S, A) + \\alpha \\left[ R + \\gamma Q(S', A') - Q(S, A) \\right]$$
Where:
- $\\alpha$ is the learning rate.
- $R$ is the reward received.
- $\\gamma$ is the discount factor.
- $S', A'$ are the next state and the next action chosen by the policy.
"""

class TrafficEnvironment:
    """
    A simple traffic intersection simulator.
    """
    def __init__(self):
        self.queue_ns = 0
        self.queue_ew = 0
        self.max_queue = 8

    def reset(self):
        self.queue_ns = random.randint(0, 2)
        self.queue_ew = random.randint(0, 2)
        return self._get_state()

    def _get_state(self):
        """Discretize queues into 3 bins: 0 (Low), 1 (Medium), 2 (High)."""
        def discretize(q):
            if q <= 2: return 0
            elif q <= 5: return 1
            else: return 2
        return (discretize(self.queue_ns), discretize(self.queue_ew))

    def step(self, action):
        """
        action 0: Green NS, action 1: Green EW
        Cars arrive randomly. Green light clears cars.
        """
        # Cars arrive
        self.queue_ns = min(self.queue_ns + random.randint(0, 2), self.max_queue)
        self.queue_ew = min(self.queue_ew + random.randint(0, 2), self.max_queue)

        # Green light clears cars
        if action == 0:
            self.queue_ns = max(0, self.queue_ns - 3)
        else:
            self.queue_ew = max(0, self.queue_ew - 3)

        next_state = self._get_state()
        reward = -(self.queue_ns + self.queue_ew)
        
        return next_state, reward

class SARSAAgent:
    def __init__(self, alpha=0.1, gamma=0.9, epsilon=1.0, epsilon_decay=0.99, epsilon_min=0.01):
        # Initialize Q-table with zeros. State is 3x3, Actions is 2.
        self.q_table = np.zeros((3, 3, 2)) 
        self.alpha = alpha
        self.gamma = gamma
        self.epsilon = epsilon
        self.epsilon_decay = epsilon_decay
        self.epsilon_min = epsilon_min

    def choose_action(self, state):
        """Epsilon-greedy exploration strategy."""
        if random.uniform(0, 1) < self.epsilon:
            return random.choice([0, 1]) # Explore
        else:
            # Exploit best known action
            return np.argmax(self.q_table[state[0], state[1]])

    def learn(self, state, action, reward, next_state, next_action):
        """
        The SARSA update rule:
        Q(S, A) <- Q(S, A) + alpha * [R + gamma * Q(S', A') - Q(S, A)]
        """
        q_current = self.q_table[state[0], state[1], action]
        q_next = self.q_table[next_state[0], next_state[1], next_action]
        
        # On-policy SARSA update
        td_target = reward + self.gamma * q_next
        td_error = td_target - q_current
        self.q_table[state[0], state[1], action] += self.alpha * td_error

    def decay_epsilon(self):
        """Decay epsilon to shift from exploration to exploitation."""
        self.epsilon = max(self.epsilon_min, self.epsilon * self.epsilon_decay)

st.title("Traffic Light Control with SARSA")

st.sidebar.header("Hyperparameters")
num_episodes = st.sidebar.slider("Number of Episodes", 100, 5000, 500, 100)
steps_per_episode = st.sidebar.slider("Steps per Episode", 10, 100, 50, 10)
learning_rate = st.sidebar.slider("Learning Rate (Alpha)", 0.01, 1.0, 0.1)
discount_factor = st.sidebar.slider("Discount Factor (Gamma)", 0.1, 1.0, 0.9)

if st.button("Train SARSA Agent"):
    env = TrafficEnvironment()
    agent = SARSAAgent(alpha=learning_rate, gamma=discount_factor)

    progress_bar = st.progress(0)
    
    log_data = []

    for episode in range(num_episodes):
        state = env.reset()
        action = agent.choose_action(state)
        
        total_reward = 0
        total_queue_length = 0

        for step in range(steps_per_episode):
            next_state, reward = env.step(action)
            next_action = agent.choose_action(next_state)
            
            # Agent Learns from the transition (S, A, R, S', A')
            agent.learn(state, action, reward, next_state, next_action)
            
            state = next_state
            action = next_action
            
            total_reward += reward
            # Extract raw queues for metric logging (not state bins)
            total_queue_length += (env.queue_ns + env.queue_ew)
            
        agent.decay_epsilon()
        
        avg_wait_time = total_queue_length / steps_per_episode
        log_data.append({
            "Episode": episode + 1,
            "Cumulative Reward": total_reward,
            "Avg Queue Length": avg_wait_time,
            "Epsilon": agent.epsilon
        })

        if episode % max(1, num_episodes // 100) == 0:
            progress_bar.progress(episode / num_episodes)

    progress_bar.progress(1.0)
    st.success("Training Complete!")
    
    # Save log data to CSV
    df = pd.DataFrame(log_data)
    df.to_csv("training_log.csv", index=False)
    
    st.subheader("Training Curves")
    
    # Plot 1: Cumulative Reward
    fig1, ax1 = plt.subplots(figsize=(10, 4))
    ax1.plot(df["Episode"], df["Cumulative Reward"], label="Reward", alpha=0.5)
    ax1.plot(df["Episode"], df["Cumulative Reward"].rolling(window=20).mean(), color="red", label="Moving Avg (20)")
    ax1.set_xlabel("Episode")
    ax1.set_ylabel("Cumulative Reward")
    ax1.set_title("Reward per Episode (Higher is Better)")
    ax1.legend()
    st.pyplot(fig1)

    # Plot 2: Average Queue Length
    fig2, ax2 = plt.subplots(figsize=(10, 4))
    ax2.plot(df["Episode"], df["Avg Queue Length"], label="Avg Queue", color="orange", alpha=0.5)
    ax2.plot(df["Episode"], df["Avg Queue Length"].rolling(window=20).mean(), color="brown", label="Moving Avg (20)")
    ax2.set_xlabel("Episode")
    ax2.set_ylabel("Average Queue Length")
    ax2.set_title("Average Wait Time/Queue Length (Lower is Better)")
    ax2.legend()
    st.pyplot(fig2)

    st.write("Raw training data saved locally to `training_log.csv`.")
    st.dataframe(df.head(10))
