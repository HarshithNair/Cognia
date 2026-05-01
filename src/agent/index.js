import dotenv from 'dotenv'
import path from 'path'
import { fileURLToPath } from 'url'
import { runAgent as runAgentCore } from './agent.js'
import { mock_resolveENS, mock_executeTransfer } from './mockTools.js'

dotenv.config()

// Swap point for real teammate utilities:
// - replace mock_resolveENS with real resolveENS from src/utils/ens.js
// - replace mock_executeTransfer with real executeTransfer from src/utils/keeperhub.js
const tools = {
  resolve_ens: (name) => mock_resolveENS(name),
  send_via_keeperhub: (to, amount) => mock_executeTransfer(to, amount),
}

/**
 * runAgent(message)
 * Takes a user message and returns the agent execution steps array.
 */
export async function runAgent(message) {
  return runAgentCore(message, tools)
}

// Simple smoke test
const currentFile = fileURLToPath(import.meta.url)
const entryFile = process.argv[1] ? path.resolve(process.argv[1]) : ''

if (entryFile && currentFile === entryFile) {
  const steps = await runAgent('send 0.01 ETH to vitalik.eth')
  steps.forEach((step, i) => {
    console.log(`[${i + 1}] ${step.type.toUpperCase()} -> ${step.content}`)
  })
}
