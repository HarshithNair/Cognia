import React from 'react';

export default function TxProposalCard({ intent, onConfirm, onReject }) {
  if (!intent) return null;

  return (
    <div style={{
      background: '#111',
      border: '1px solid #333',
      borderRadius: '8px',
      padding: '16px',
      margin: '16px',
      color: '#fff',
      fontFamily: 'monospace'
    }}>
      <h3 style={{ margin: '0 0 16px 0', borderBottom: '1px solid #333', paddingBottom: '8px', color: '#ffb74d' }}>
        ⚠️ Transaction Proposal
      </h3>
      <div style={{ marginBottom: '8px' }}>
        <strong>To:</strong> {intent.ensName ? `${intent.ensName} → ` : ''}{intent.to}
      </div>
      <div style={{ marginBottom: '8px' }}>
        <strong>Amount:</strong> {intent.amount} ETH
      </div>
      <div style={{ marginBottom: '8px' }}>
        <strong>Network:</strong> {intent.chain}
      </div>
      <div style={{ marginBottom: '16px' }}>
        <strong>Authorized by:</strong> AgentPass / Cognia
      </div>
      <div style={{ display: 'flex', gap: '8px' }}>
        <button 
          onClick={onConfirm} 
          style={{ 
            background: '#2e7d32', 
            color: 'white', 
            border: 'none', 
            padding: '8px 16px', 
            borderRadius: '4px', 
            cursor: 'pointer',
            fontWeight: 'bold'
          }}
        >
          ✅ Sign & Execute
        </button>
        <button 
          onClick={onReject} 
          style={{ 
            background: '#d32f2f', 
            color: 'white', 
            border: 'none', 
            padding: '8px 16px', 
            borderRadius: '4px', 
            cursor: 'pointer',
            fontWeight: 'bold'
          }}
        >
          ❌ Reject
        </button>
      </div>
    </div>
  );
}
