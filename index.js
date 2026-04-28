// src/agent/index.js
// Public entry point for AgentPass.
// Currently wired to mock tools — swap the imports below when real
// teammate utilities are ready.

import dotenv from "dotenv";
dotenv.config();

import { runAgent as _runAgent } from "./agent.js";

// ─── TOOL SWAP POINT ──────────────────────────────────────────────────────────
// When teammates deliver their modules, replace these two lines:
//
//   import { mock_resolveENS, mock_executeTransfer } from "./mockTools.js";
//
// with the real implementations, e.g.:
//
//   import { resolveENS }       from "../ens/ensResolver.js";       // teammate A
//   import { executeTransfer }  from "../keeperhub/transfer.js";    // teammate B
//
// Then update the `tools` object below to point at the real functions.
// Nothing else needs to change.
// ─────────────────────────────────────────────────────────────────────────────

import { mock_resolveENS, mock_executeTransfer } from "./mockTools.js";

const tools = {
  resolve_ens: (name) => mock_resolveENS(name),
  send_via_keeperhub: (to, amount) => mock_executeTransfer(to, amount),
};

/**
 * Run the AgentPass agent with a natural-language message.
 *
 * @param {string} message
 * @returns {Promise<Array<{type: "thinking"|"tool"|"result", content: string}>>}
 */
export async function runAgent(message) {
  return _runAgent(message, tools);
}

// ─── Quick smoke test ─────────────────────────────────────────────────────────
// Run directly:  node --experimental-vm-modules src/agent/index.js
// (or via your bundler's test runner)

if (import.meta.url === new URL(import.meta.url).href) {
  console.log("━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━");
  console.log("AgentPass — smoke test");
  console.log("━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━");

  const steps = await runAgent("send 0.01 ETH to vitalik.eth");

  steps.forEach((step, i) => {
    const icon =
      step.type === "thinking" ? "🧠" :
      step.type === "tool"     ? "🔧" :
                                 "✅";
    console.log(`\n[${i + 1}] ${icon} [${step.type.toUpperCase()}]`);
    console.log(`    ${step.content}`);
  });

  console.log("\n━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━");
  console.log(`Done — ${steps.length} steps total`);
}
