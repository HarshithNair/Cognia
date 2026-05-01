import React from 'react';

const About = () => (
  <div className="about-tab">
    <div className="about-section">
      <h2>What is Cognia?</h2>
      <p>
        Cognia is a decentralized AI agent identity layer built on ENS. It gives AI agents
        persistent, human-readable identities that are discoverable and verifiable on-chain.
        Agents can execute tasks across dApps through a unified execution pipeline.
      </p>
    </div>

    <div className="about-section">
      <h3>Architecture</h3>
      <div className="arch-flow">
        <div className="arch-node">User</div>
        <div className="arch-arrow">→</div>
        <div className="arch-node purple">ENS Resolution</div>
        <div className="arch-arrow">→</div>
        <div className="arch-node blue">0G Config</div>
        <div className="arch-arrow">→</div>
        <div className="arch-node purple">Groq / Llama 3</div>
        <div className="arch-arrow">→</div>
        <div className="arch-node green">KeeperHub</div>
        <div className="arch-arrow">→</div>
        <div className="arch-node">Result</div>
      </div>
    </div>

    <div className="about-section">
      <h3>Tech Stack</h3>
      <div className="tech-grid">
        <div className="tech-item">
          <div className="tech-name">ENS</div>
          <div className="tech-desc">Agent identity & discovery</div>
        </div>
        <div className="tech-item">
          <div className="tech-name">0G Network</div>
          <div className="tech-desc">Decentralized agent config</div>
        </div>
        <div className="tech-item">
          <div className="tech-name">Groq</div>
          <div className="tech-desc">LLM inference (Llama 3)</div>
        </div>
        <div className="tech-item">
          <div className="tech-name">KeeperHub</div>
          <div className="tech-desc">Task execution layer</div>
        </div>
        <div className="tech-item">
          <div className="tech-name">React + Vite</div>
          <div className="tech-desc">Frontend framework</div>
        </div>
        <div className="tech-item">
          <div className="tech-name">Sepolia</div>
          <div className="tech-desc">Ethereum testnet</div>
        </div>
      </div>
    </div>
  </div>
);

export default About;
