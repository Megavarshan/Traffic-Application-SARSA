import streamlit as st
import numpy as np
import pandas as pd
import matplotlib.pyplot as plt
import random
import time

# Set page config for wider layout
st.set_page_config(page_title="Advanced SARSA Traffic Agent", layout="wide")

# ==========================================
# RL Agent and Environment Classes
# ==========================================

class TrafficEnvironment:
    """A simulated traffic intersection for tabular RL."""
    def __init__(self, max_queue=10):
        self.queue_ns = 0
        self.queue_ew = 0
        self.max_queue = max_queue

    def reset(self):
        self.queue_ns = random.randint(0, 3)
        self.queue_ew = random.randint(0, 3)
        return self._get_state()

    def _get_state(self):
        """Discretize queues into 3 bins: 0 (Low), 1 (Medium), 2 (High)."""
        def discretize(q):
            if q <= 3: return 0
            elif q <= 7: return 1
            else: return 2
        return (discretize(self.queue_ns), discretize(self.queue_ew))

    def step(self, action):
        """
        Action 0: Green NS
        Action 1: Green EW
        Returns (next_state, reward, throughput)
        """
        # Cars arrive randomly
        self.queue_ns = min(self.queue_ns + random.randint(0, 2), self.max_queue)
        self.queue_ew = min(self.queue_ew + random.randint(0, 2), self.max_queue)

        throughput = 0
        # Green light clears cars
        if action == 0:
            cleared = min(self.queue_ns, 4)
            self.queue_ns -= cleared
            throughput += cleared
        else:
            cleared = min(self.queue_ew, 4)
            self.queue_ew -= cleared
            throughput += cleared

        next_state = self._get_state()
        reward = -(self.queue_ns + self.queue_ew)
        
        return next_state, reward, throughput

class SARSAAgent:
    """Professional SARSA Agent with train/eval modes."""
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
        return np.argmax(self.q_table[state[0], state[1]])

    def learn(self, state, action, reward, next_state, next_action):
        q_current = self.q_table[state[0], state[1], action]
        q_next = self.q_table[next_state[0], next_state[1], next_action]
        td_target = reward + self.gamma * q_next
        td_error = td_target - q_current
        self.q_table[state[0], state[1], action] += self.alpha * td_error

    def decay_epsilon(self):
        self.epsilon = max(self.epsilon_min, self.epsilon * self.epsilon_decay)

    def eval(self):
        """Turn off exploration for inference."""
        self.train_mode = False

    def train(self):
        """Turn on exploration for training."""
        self.train_mode = True

# Initialize session state for the agent
if 'agent' not in st.session_state:
    st.session_state.agent = SARSAAgent()
if 'training_logs' not in st.session_state:
    st.session_state.training_logs = pd.DataFrame()

# ==========================================
# Main App UI
# ==========================================

st.title("🚦 Intelligent Traffic Control (SARSA)")

tab_theory, tab_train, tab_sim = st.tabs(["📚 RL Theory", "🧠 Training Dashboard", "🚗 Live Simulation"])

# --- TAB 1: Theory ---
with tab_theory:
    st.markdown(r"""
    ### Reinforcement Learning Formulation

    **1. State Space ($S$)**: 
    The intersection has two directions: North-South (NS) and East-West (EW). We track the queue length.
    Discretized into 3 bins: `0 (Low: 0-3)`, `1 (Medium: 4-7)`, `2 (High: 8+)`. State = `(queue_NS, queue_EW)`.

    **2. Action Space ($A$)**: 
    - `0`: Green for NS (Red for EW)
    - `1`: Green for EW (Red for NS)

    **3. Reward Function ($R$)**: 
    Minimize total wait time. `Reward = -(queue_NS + queue_EW)`.

    **4. The SARSA Update Rule**:
    SARSA is an on-policy TD control algorithm.
    $$Q(S, A) \leftarrow Q(S, A) + \alpha \left[ R + \gamma Q(S', A') - Q(S, A) \right]$$
    """)

# --- TAB 2: Training Dashboard ---
with tab_train:
    st.sidebar.header("Hyperparameters")
    num_episodes = st.sidebar.slider("Episodes", 100, 2000, 500, 100)
    steps_per_episode = st.sidebar.slider("Steps/Episode", 10, 100, 50, 10)
    learning_rate = st.sidebar.slider("Learning Rate", 0.01, 1.0, 0.1)
    
    if st.button("🚀 Start Training", type="primary"):
        env = TrafficEnvironment()
        agent = SARSAAgent(alpha=learning_rate)
        
        progress_bar = st.progress(0)
        status_text = st.empty()
        log_data = []

        for episode in range(num_episodes):
            state = env.reset()
            action = agent.choose_action(state)
            
            total_reward = 0
            total_throughput = 0

            for step in range(steps_per_episode):
                next_state, reward, throughput = env.step(action)
                next_action = agent.choose_action(next_state)
                
                agent.learn(state, action, reward, next_state, next_action)
                
                state, action = next_state, next_action
                total_reward += reward
                total_throughput += throughput
                
            agent.decay_epsilon()
            
            log_data.append({
                "Episode": episode + 1,
                "Reward": total_reward,
                "Throughput": total_throughput,
                "Epsilon": agent.epsilon
            })

            if episode % max(1, num_episodes // 20) == 0:
                progress_bar.progress(episode / num_episodes)
                status_text.text(f"Training Episode: {episode}/{num_episodes}")

        progress_bar.progress(1.0)
        status_text.text("Training Complete! View the curves below and try the Live Simulation.")
        
        st.session_state.agent = agent
        st.session_state.agent.eval() # Set to eval mode for simulation
        df = pd.DataFrame(log_data)
        st.session_state.training_logs = df
        
    if not st.session_state.training_logs.empty:
        df = st.session_state.training_logs
        col1, col2 = st.columns(2)
        
        with col1:
            fig1, ax1 = plt.subplots(figsize=(6, 4))
            ax1.plot(df["Episode"], df["Reward"], alpha=0.3)
            ax1.plot(df["Episode"], df["Reward"].rolling(20).mean(), color="red")
            ax1.set_title("Cumulative Reward")
            st.pyplot(fig1)
            
        with col2:
            fig2, ax2 = plt.subplots(figsize=(6, 4))
            ax2.plot(df["Episode"], df["Throughput"], color="green", alpha=0.3)
            ax2.plot(df["Episode"], df["Throughput"].rolling(20).mean(), color="darkgreen")
            ax2.set_title("Total Car Throughput")
            st.pyplot(fig2)

# --- TAB 3: Live Simulation ---
with tab_sim:
    st.markdown("### 🚦 Live Intersection Simulator")
    st.write("Watch the trained SARSA agent manage traffic in real-time.")
    
    sim_placeholder = st.empty()
    start_sim = st.button("▶️ Start Live Simulation")
    
    if start_sim:
        env = TrafficEnvironment(max_queue=6)
        agent = st.session_state.agent
        agent.eval() # Ensure exploration is off
        
        state = env.reset()
        
        for i in range(50):
            action = agent.choose_action(state)
            
            # Draw Intersection
            ns_cars = "🚘" * env.queue_ns
            ew_cars = "🚙" * env.queue_ew
            ns_light = "🟢 GREEN" if action == 0 else "🔴 RED"
            ew_light = "🟢 GREEN" if action == 1 else "🔴 RED"
            
            html_grid = f"""
            <div style="font-family: monospace; font-size: 20px; background-color: #1e1e1e; padding: 20px; border-radius: 10px; color: white;">
                <div style="text-align: center; margin-bottom: 20px;">
                    <strong>North-South Lane</strong><br>
                    {ns_light}<br>
                    {ns_cars if env.queue_ns > 0 else 'Road clear'}
                </div>
                <hr style="border: 1px dashed gray;">
                <div style="text-align: center; margin-top: 20px;">
                    <strong>East-West Lane</strong><br>
                    {ew_light}<br>
                    {ew_cars if env.queue_ew > 0 else 'Road clear'}
                </div>
                <div style="margin-top: 20px; color: #aaa; font-size: 14px;">
                    Step: {i+1} / 50 | Total Queued: {env.queue_ns + env.queue_ew}
                </div>
            </div>
            """
            sim_placeholder.markdown(html_grid, unsafe_allow_html=True)
            
            # Step environment
            state, reward, _ = env.step(action)
            time.sleep(0.5) # Delay for animation effect
            
        st.success("Simulation Finished!")
