import React from 'react';

const AgentCard = ({ ensData }) => {
  const name = ensData?.name || 'cognia.eth';
  const address = ensData?.address || '0x1234...5678';
  const description = ensData?.profile?.description || 'AI agent with persistent identity, discoverable via ENS, capable of executing tasks across apps.';
  const agentType = ensData?.profile?.agentType || 'general-agent';
  const capabilities = ensData?.profile?.capabilities || 'analysis, automation';
  const isLive = !!ensData?.address;

  const truncate = (addr) => {
    if (!addr || addr.length < 10) return addr || '—';
    return `${addr.slice(0, 6)}...${addr.slice(-4)}`;
  };

  return (
    <div className="panel agent-card">
      <div className="agent-card-header">
        <div className="agent-avatar">{name.charAt(0).toUpperCase()}</div>
        <div>
          <div className="agent-ens">{name}</div>
          <div className="agent-addr mono">{truncate(address)}</div>
        </div>
      </div>
      <div className="agent-status">
        <div className="agent-status-dot"></div>
        {isLive ? 'Resolved' : 'Default'}
      </div>
      <div className="agent-desc">{description}</div>
      <div className="agent-tags">
        <span className="tag">{agentType}</span>
        {capabilities.split(',').map((c) => (
          <span className="tag" key={c.trim()}>{c.trim()}</span>
        ))}
      </div>
      <div className="agent-footer">Stored on ENS text records</div>
    </div>
  );
};

export default AgentCard;
