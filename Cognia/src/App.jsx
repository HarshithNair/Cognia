import React, { useState } from 'react';
import AgentCard from './components/AgentCard';
import Chat from './components/Chat';
import ExecutionSteps from './components/ExecutionLogs';
import Discover from './components/Discover';
import About from './components/About';
import { runAgent } from './agent/realAgent';
import { resolveENS } from './utils/ens';
import { getAgentProfile } from './utils/ensRecords';

const TABS = ['Agent', 'Execution', 'Discover', 'About'];

function App() {
  const [tab, setTab] = useState('Agent');
  const [messages, setMessages] = useState([]);
  const [logs, setLogs] = useState([]);
  const [isProcessing, setIsProcessing] = useState(false);

  // ENS state
  const [ensData, setEnsData] = useState(null);
  const [ensLoading, setEnsLoading] = useState(false);
  const [ensError, setEnsError] = useState(null);

  const addLog = (source, message) => {
    setLogs((prev) => [...prev, { source, message, ts: Date.now() }]);
  };

  // ENS lookup handler
  const handleENSLookup = async (name) => {
    if (!name || !name.endsWith('.eth')) {
      setEnsError('Please enter a valid ENS name (e.g. vitalik.eth)');
      return;
    }

    setEnsLoading(true);
    setEnsError(null);
    addLog('ENS', `Resolving ${name}...`);

    try {
      const [address, profile] = await Promise.all([
        resolveENS(name),
        getAgentProfile(name),
      ]);

      if (!address) {
        setEnsError(`Could not resolve "${name}". ENS name may not exist.`);
        addLog('ENS', `Resolution failed for ${name}`);
        setEnsData(null);
      } else {
        setEnsData({ name, address, profile });
        addLog('ENS', `Resolved ${name} → ${address.slice(0, 6)}...${address.slice(-4)}`);
        if (profile) {
          addLog('ENS', `Profile loaded: ${profile.agentType || 'unknown type'}`);
        }
      }
    } catch (err) {
      console.error('ENS lookup failed:', err);
      setEnsError('ENS lookup failed. Check your RPC configuration.');
      addLog('Error', `ENS error: ${err.message}`);
    } finally {
      setEnsLoading(false);
    }
  };

  const handleSendMessage = async (userText) => {
    // Only treat as a bare ENS lookup if the ENTIRE input is a single ENS name
    // (no spaces, ends with .eth). Otherwise send to the Groq agent as normal.
    const trimmed = userText.trim();
    const isBareENS = /^[a-z0-9-]+\.eth$/i.test(trimmed);

    if (isBareENS) {
      setMessages((prev) => [...prev, { role: 'user', content: userText }]);
      setMessages((prev) => [...prev, { role: 'agent', type: 'thinking', content: 'Resolving ENS name...' }]);
      await handleENSLookup(userText.trim());

      setMessages((prev) => {
        const filtered = prev.filter((m) => m.type !== 'thinking');
        if (ensError) {
          return [...filtered, { role: 'agent', type: 'error', content: ensError }];
        }
        return [...filtered, {
          role: 'agent',
          type: 'result',
          content: `Resolved! Check the Agent Card on the left for details.`,
        }];
      });
      return;
    }

    // Regular agent flow
    setMessages((prev) => [...prev, { role: 'user', content: userText }]);
    setIsProcessing(true);
    addLog('System', 'Received user request');

    // Each run gets its own ID so we can replace its in-progress messages cleanly
    const runId = Date.now();
    let currentSteps = [];

    const updateSteps = (steps) => {
      setMessages((prev) => {
        const base = prev.filter((m) => m.runId !== runId);
        return [...base, ...steps.map((s) => ({ ...s, runId }))];
      });
    };

    // Progressive step callback — fired by realAgent on each Groq iteration / tool call
    const onStep = (step) => {
      // Replace the last 'thinking' bubble instead of stacking them
      if (step.type === 'thinking') {
        currentSteps = currentSteps.filter((s) => s.type !== 'thinking');
      }
      currentSteps.push({ role: 'agent', type: step.type, content: step.content });
      updateSteps([...currentSteps]);

      // Mirror to execution log panel
      if (step.type === 'ens' || step.content?.toLowerCase().includes('ens')) {
        addLog('ENS', step.content);
      } else if (step.type === 'tool' && step.content?.toLowerCase().includes('keeperhub')) {
        addLog('KeeperHub', step.content);
      } else if (step.type === 'thinking') {
        addLog('Groq', 'Running Llama 3.3-70b');
      } else if (step.type === 'tool') {
        addLog('Tool', step.content);
      } else if (step.type === 'error') {
        addLog('Error', step.content);
      }
    };

    try {
      addLog('Groq', 'Starting agent reasoning loop');
      const result = await runAgent(userText, onStep);

      // Remove any lingering 'thinking' bubbles and show final result
      currentSteps = currentSteps.filter((s) => s.type !== 'thinking');
      currentSteps.push({ role: 'agent', type: 'result', content: result });
      updateSteps([...currentSteps]);
      addLog('Result', 'Response generated');
    } catch (err) {
      currentSteps = currentSteps.filter((s) => s.type !== 'thinking');
      currentSteps.push({ role: 'agent', type: 'error', content: err.message });
      updateSteps([...currentSteps]);
      addLog('Error', `Execution failed: ${err.message}`);
    } finally {
      setIsProcessing(false);
    }
  };

  return (
    <div className="app-shell">
      {/* Header */}
      <header className="header">
        <div className="header-brand">
          <div className="header-logo">C</div>
          <span className="header-title">Cognia</span>
          <span className="header-subtitle">Decentralized AI Agent Identity Layer</span>
        </div>
        <div className="header-right">
          <span className="badge badge-green">● Live</span>
          <span className="badge badge-purple">Sepolia Testnet</span>
        </div>
      </header>

      {/* Tab Bar */}
      <nav className="tab-bar">
        {TABS.map((t) => (
          <button
            key={t}
            className={`tab-btn ${tab === t ? 'active' : ''}`}
            onClick={() => setTab(t)}
          >
            {t}
            {t === 'Agent' && (isProcessing || ensLoading) && <span className="tab-dot"></span>}
          </button>
        ))}
      </nav>

      {/* Tab Content */}
      <div className="tab-content">
        {tab === 'Agent' && (
          <div className="agent-tab">
            <div className="left-col">
              <AgentCard ensData={ensData} />
            </div>
            <div className="center-col">
              <Chat
                messages={messages}
                isProcessing={isProcessing || ensLoading}
                onSendMessage={handleSendMessage}
              />
            </div>
            <div className="right-col">
              <ExecutionSteps logs={logs} compact />
            </div>
          </div>
        )}

        {tab === 'Execution' && (
          <div className="logs-tab">
            <div className="logs-stats">
              <div className="stat-card">
                <div className="stat-label">Total Steps</div>
                <div className="stat-value purple">{logs.length}</div>
              </div>
              <div className="stat-card">
                <div className="stat-label">Tools Used</div>
                <div className="stat-value blue">
                  {logs.filter((l) => ['ENS', 'KeeperHub', 'Groq'].includes(l.source)).length}
                </div>
              </div>
              <div className="stat-card">
                <div className="stat-label">Completed</div>
                <div className="stat-value green">
                  {logs.filter((l) => l.source === 'Result').length}
                </div>
              </div>
            </div>
            <ExecutionSteps logs={logs} />
          </div>
        )}

        {tab === 'Discover' && <Discover />}
        {tab === 'About' && <About />}
      </div>
    </div>
  );
}

export default App;
