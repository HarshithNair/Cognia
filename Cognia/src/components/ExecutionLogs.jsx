import React, { useEffect, useRef } from 'react';

const getSourceClass = (source) => {
  if (source.includes('ENS') || source.includes('0G')) return 'ens';
  if (source.includes('KeeperHub') || source.includes('Groq')) return 'tool';
  if (source.includes('Result')) return 'success';
  if (source.includes('Error')) return 'error';
  return 'system';
};

const ExecutionSteps = ({ logs, compact = false }) => {
  const endRef = useRef(null);

  useEffect(() => {
    endRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [logs]);

  return (
    <div className={compact ? "panel steps-panel" : "panel steps-panel logs-full"}>
      <div className="steps-header">Execution Flow</div>
      <div className="steps-list">
        {logs.length === 0 && (
          <div style={{ color: 'var(--text-dim)', fontSize: '0.78rem' }}>
            Waiting for activity...
          </div>
        )}
        {logs.map((log, i) => (
          <div key={i} className="step-entry">
            <span className={`step-src ${getSourceClass(log.source)}`}>[{log.source}]</span>
            <span className="step-msg">{log.message}</span>
          </div>
        ))}
        <div ref={endRef} />
      </div>
    </div>
  );
};

export default ExecutionSteps;
