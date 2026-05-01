import React from 'react';

const agents = [
  {
    name: 'cognia.eth',
    addr: '0x1234...5678',
    desc: 'General-purpose AI agent with ENS identity. Executes tasks across dApps via KeeperHub.',
    tags: ['ENS', 'KeeperHub', 'Groq'],
    color: 'linear-gradient(135deg, #8b5cf6, #ec4899)',
    initial: 'C',
  },
  {
    name: 'weatherAgent.eth',
    addr: '0xabcd...ef01',
    desc: 'Provides real-time weather data for any location. Integrates with on-chain oracles.',
    tags: ['Oracle', 'Data Feed'],
    color: 'linear-gradient(135deg, #3b82f6, #06b6d4)',
    initial: 'W',
  },
  {
    name: 'financeAgent.eth',
    addr: '0x9876...5432',
    desc: 'DeFi analytics and portfolio tracking. Monitors gas prices, TVL, and yield opportunities.',
    tags: ['DeFi', 'Analytics'],
    color: 'linear-gradient(135deg, #22c55e, #14b8a6)',
    initial: 'F',
  },
  {
    name: 'nftScout.eth',
    addr: '0xdead...beef',
    desc: 'Monitors NFT collections, tracks floor prices, and alerts on mint opportunities.',
    tags: ['NFT', 'Alerts'],
    color: 'linear-gradient(135deg, #f59e0b, #ef4444)',
    initial: 'N',
  },
  {
    name: 'bridgeBot.eth',
    addr: '0xcafe...babe',
    desc: 'Cross-chain bridge assistant. Finds optimal routes for token transfers across L2s.',
    tags: ['Bridge', 'L2'],
    color: 'linear-gradient(135deg, #6366f1, #8b5cf6)',
    initial: 'B',
  },
  {
    name: 'govAgent.eth',
    addr: '0xf00d...1234',
    desc: 'DAO governance helper. Summarizes proposals, tracks voting, and alerts on deadlines.',
    tags: ['DAO', 'Governance'],
    color: 'linear-gradient(135deg, #ec4899, #f43f5e)',
    initial: 'G',
  },
];

const Discover = () => (
  <div className="discover-tab">
    <div className="discover-header">
      <h2>Discover Agents</h2>
      <p>Browse the decentralized agent marketplace. Each agent has a persistent ENS identity.</p>
    </div>
    <div className="agents-grid">
      {agents.map((a) => (
        <div key={a.name} className="agent-listing">
          <div className="listing-top">
            <div className="listing-avatar" style={{ background: a.color }}>{a.initial}</div>
            <div>
              <div className="listing-name">{a.name}</div>
              <div className="listing-addr mono">{a.addr}</div>
            </div>
          </div>
          <div className="listing-desc">{a.desc}</div>
          <div className="listing-tags">
            {a.tags.map((t) => <span key={t} className="tag">{t}</span>)}
          </div>
          <button className="use-btn">Use Agent</button>
        </div>
      ))}
    </div>
  </div>
);

export default Discover;
