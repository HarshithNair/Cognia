// src/agent/mockTools.js
// Mock implementations of teammate utilities.
// Drop-in replacements until real ENS + KeeperHub modules are ready.

/**
 * Simulates ENS name resolution.
 * @param {string} name - e.g. "vitalik.eth"
 * @returns {Promise<string>} - a mock Ethereum address
 */
export async function mock_resolveENS(name) {
  await delay(500);
  console.log(`[mockTools] Resolved ENS "${name}" → 0xMockAddress123`);
  return "0xMockAddress123";
}

/**
 * Simulates executing an on-chain transfer via KeeperHub.
 * @param {string} to   - recipient address
 * @param {string} amount - e.g. "0.01"
 * @returns {Promise<string>} - a mock transaction hash
 */
export async function mock_executeTransfer(to, amount) {
  await delay(500);
  console.log(`[mockTools] Transfer executed → to: ${to}, amount: ${amount} ETH → 0xMockTxHash456`);
  return "0xMockTxHash456";
}

// ─── helpers ─────────────────────────────────────────────────────────────────

function delay(ms) {
  return new Promise((resolve) => setTimeout(resolve, ms));
}
