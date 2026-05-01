import React, { useState, useEffect, useRef } from 'react';

const Chat = ({ messages, isProcessing, onSendMessage }) => {
  const [input, setInput] = useState('');
  const endRef = useRef(null);

  useEffect(() => {
    endRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages]);

  const handleSubmit = (e) => {
    e.preventDefault();
    if (!input.trim() || isProcessing) return;
    onSendMessage(input);
    setInput('');
  };

  const getLabel = (msg) => {
    if (msg.role === 'user') return 'You';
    if (msg.type === 'thinking') return '🤔 Agent';
    if (msg.type === 'ens') return '🔗 ENS';
    if (msg.type === 'tool') return '⚙️ Tool';
    if (msg.type === 'result') return '✅ Result';
    if (msg.type === 'error') return '❌ Error';
    return 'Agent';
  };

  return (
    <div className="panel chat-panel">
      <div className="chat-messages">
        {messages.length === 0 && (
          <div style={{ margin: 'auto', textAlign: 'center', color: 'var(--text-dim)' }}>
            <div style={{ fontSize: '2rem', marginBottom: '0.5rem' }}>💬</div>
            <div style={{ fontSize: '0.85rem' }}>Ask Cognia anything to get started</div>
          </div>
        )}
        {messages.map((msg, i) => (
          <div key={i} className={`msg-wrap ${msg.role}`}>
            <div className="msg-label">{getLabel(msg)}</div>
            <div className={`msg-bubble ${msg.type || msg.role}`}>
              {msg.type === 'thinking' && <div className="spinner"></div>}
              {msg.content}
            </div>
          </div>
        ))}
        <div ref={endRef} />
      </div>
      <div className="chat-input-bar">
        <form className="chat-form" onSubmit={handleSubmit}>
          <input
            type="text"
            className="chat-input"
            placeholder="Ask Cognia..."
            value={input}
            onChange={(e) => setInput(e.target.value)}
            disabled={isProcessing}
          />
          <button type="submit" className="send-btn" disabled={!input.trim() || isProcessing}>
            Send
          </button>
        </form>
      </div>
    </div>
  );
};

export default Chat;
