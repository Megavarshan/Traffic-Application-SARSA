# Traffic-Application-SARSA

A simple Reinforcement Learning agent demonstrating Traffic Signal Control using the **SARSA** algorithm, built with Streamlit.

## Running Locally

1. Install requirements:
   ```bash
   pip install -r requirements.txt
   ```
2. Run the Streamlit app:
   ```bash
   streamlit run streamlit_app.py
   ```

## RL Formulation

### State Space
The intersection has two directions: North-South (NS) and East-West (EW). We track the number of cars waiting in each direction. To keep the state space tabular and manageable, we discretize the queue length into 3 bins: 
- `0` (Low: 0-2 cars)
- `1` (Medium: 3-5 cars)
- `2` (High: 6+ cars)

Thus, a state is a tuple `(queue_NS, queue_EW)`. There are $3 \times 3 = 9$ possible states.

### Action Space
The traffic light can be green for NS or EW.
- `Action 0`: Green for NS (Red for EW)
- `Action 1`: Green for EW (Red for NS)

### Reward Function
The goal is to minimize the total wait time. We define the reward as the negative sum of the queues at the intersection: 
`Reward = -(queue_NS + queue_EW)`

### Why SARSA (On-Policy)?
SARSA (State-Action-Reward-State-Action) is an **on-policy** learning algorithm. It updates its Q-values based on the action the agent *actually* takes, meaning it learns the value of the policy it is currently executing (including the exploration steps). This is often safer than Q-learning (off-policy) during training because it takes into account the penalties incurred by exploration. 

### Limitations of this Tabular Approach
This approach uses a "tabular" Q-table to store the value of every state-action pair. While this works perfectly for our small $3 \times 3$ grid of discretized states, it **does not scale** to large or continuous state spaces. In a real-world traffic network with dozens of continuous sensors, the state space would explode (the "curse of dimensionality"), requiring Deep Reinforcement Learning (like DQN or PPO) where a neural network approximates the Q-values instead of a lookup table.
