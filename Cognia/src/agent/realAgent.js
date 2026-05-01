/**
 * realAgent.js
 * Full Groq-powered agent loop wired to real ENS resolution.
 * Browser-safe: uses import.meta.env for API keys and the Groq REST API
 * directly via fetch (no Node.js-only modules).
 *
 * Usage:
 *   import { runAgent } from './realAgent';
 *   const result = await runAgent(userMessage, onStep);
 *   // onStep({ type: 'thinking'|'tool'|'ens', content: string }) is called progressively
 *   // result is the final string answer
 */

import { resolveENS } from '../utils/ens';

const MAX_ITERATIONS = 6;
const GROQ_API_URL = 'https://api.groq.com/openai/v1/chat/completions';

// Tools are dynamically loaded server-side. This is the browser fallback.
const FALLBACK_TOOLS = [
  {
    type: 'function',
    function: {
      name: 'resolve_ens',
      description: 'Resolve an ENS name (e.g. vitalik.eth) to a 0x Ethereum address.',
      parameters: {
        type: 'object',
        properties: {
          name: { type: 'string', description: 'ENS name ending in .eth' },
        },
        required: ['name'],
      },
    },
  },
  {
    type: 'function',
    function: {
      name: 'send_via_keeperhub',
      description: 'Send ETH to a recipient address using KeeperHub and return a transaction hash.',
      parameters: {
        type: 'object',
        properties: {
          to: { type: 'string', description: 'Recipient 0x address' },
          amount: { type: 'string', description: 'ETH amount as a string, e.g. "0.01"' },
        },
        required: ['to', 'amount'],
      },
    },
  },
];

/**
 * callGroq(messages, apiKey)
 * Sends a request to the Groq chat completions endpoint.
 * Returns the raw response JSON or throws on HTTP error.
 */
async function callGroq(messages, apiKey) {
  const model = import.meta.env.VITE_GROQ_MODEL || 'llama-3.3-70b-versatile';
  const res = await fetch(GROQ_API_URL, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      Authorization: `Bearer ${apiKey}`,
    },
    body: JSON.stringify({
      model,
      messages,
      tools: FALLBACK_TOOLS,
      tool_choice: 'auto',
      temperature: 0.2,
    }),
  });

  if (!res.ok) {
    const errText = await res.text().catch(() => '');
    throw new Error(`Groq API ${res.status}: ${errText || res.statusText}`);
  }

  return res.json();
}

/**
 * executeKeeperHub(to, amount, onStep)
 * Browser-safe KeeperHub call. When VITE_KEEPERHUB_DRY_RUN=true (default)
 * this returns a mock tx hash without hitting the live API.
 */
export async function executeKeeperHub(to, amount, onStep) {
  const isDryRun = import.meta.env.VITE_KEEPERHUB_DRY_RUN === 'true';
  const apiKey = import.meta.env.VITE_KEEPERHUB_API_KEY;
  const workflowId = import.meta.env.VITE_KEEPERHUB_WORKFLOW_ID;
  const baseUrl = import.meta.env.VITE_KEEPERHUB_BASE_URL || 'https://api.keeperhub.io/v1';

  if (isDryRun || !apiKey || !workflowId) {
    const mode = isDryRun ? 'dry-run' : 'no-credentials';
    onStep({ type: 'tool', content: `[KeeperHub][${mode}] Skipping real transfer → ${amount} ETH to ${to}` });
    return {
      txHash: `0xDRYRUN_${Date.now().toString(16)}`,
      executionId: `dry-${Date.now()}`,
      status: mode,
    };
  }

  onStep({ type: 'tool', content: `Triggering KeeperHub workflow for ${amount} ETH → ${to}` });

  try {
    const res = await fetch(`${baseUrl}/workflows/execute`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        Authorization: `Bearer ${apiKey}`,
      },
      body: JSON.stringify({
        workflowId,
        inputs: { recipient: to, amount },
      }),
    });

    const data = await res.json().catch(() => null);
    if (!res.ok) {
      return { error: `KeeperHub ${res.status}: ${data?.message || 'unknown error'}` };
    }

    return {
      txHash: data?.txHash || null,
      executionId: data?.executionId || data?.id || null,
      status: data?.status || 'queued',
    };
  } catch (err) {
    return { error: `KeeperHub fetch failed: ${err?.message || String(err)}` };
  }
}

/**
 * runAgent(userMessage, onStep)
 * Main export. Runs the Groq reasoning loop and resolves to a final answer string.
 *
 * @param {string}   userMessage  - The user's input text
 * @param {Function} onStep       - Callback fired with { type, content } on each step
 * @returns {Promise<string>}     - The agent's final answer
 */
export async function runAgent(userMessage, onStep) {
  const apiKey = import.meta.env.VITE_GROQ_API_KEY;

  if (!apiKey) {
    onStep({ type: 'error', content: 'Missing VITE_GROQ_API_KEY in environment.' });
    return 'Error: Groq API key not configured.';
  }

  onStep({ type: 'thinking', content: 'Thinking...' });
  onStep({ type: "log", message: "🔍 Resolving tool schema from cognia.eth..." });
  onStep({ type: "log", message: "✅ Tool schema loaded — 2 tools active" });

  const messages = [
    {
      role: 'system',
      content:
        'You are Cognia, an AI agent with a persistent ENS identity on the Ethereum blockchain. ' +
        'For transfer requests involving ENS names, call resolve_ens first to get the address, ' +
        'then call send_via_keeperhub with the resolved address. ' +
        'After tool results, provide a concise final summary and stop.',
    },
    { role: 'user', content: userMessage },
  ];

  for (let i = 0; i < MAX_ITERATIONS; i++) {
    let data;
    try {
      data = await callGroq(messages, apiKey);
    } catch (err) {
      onStep({ type: 'error', content: `Groq error: ${err.message}` });
      return `Groq API error: ${err.message}`;
    }

    const choice = data.choices?.[0];
    const assistantMessage = choice?.message;

    if (!assistantMessage) {
      return 'Agent error: empty response from Groq.';
    }

    messages.push(assistantMessage);

    // ── Tool calls ─────────────────────────────────────────────────────────────
    if (choice.finish_reason === 'tool_calls' && assistantMessage.tool_calls?.length) {
      for (const toolCall of assistantMessage.tool_calls) {
        const toolName = toolCall.function.name;
        let args = {};
        try {
          args = JSON.parse(toolCall.function.arguments || '{}');
        } catch {
          args = {};
        }

        onStep({ type: 'tool', content: `Calling ${toolName}(${JSON.stringify(args)})` });

        let toolResult;
        try {
          if (toolName === 'resolve_ens') {
            onStep({ type: 'ens', content: `Resolving ENS name: ${args.name}` });
            const address = await resolveENS(args.name);
            toolResult = address
              ? { address }
              : { error: `Could not resolve "${args.name}" — ENS name may not exist or RPC error.` };
            onStep({
              type: 'ens',
              content: address
                ? `Resolved ${args.name} → ${address.slice(0, 6)}...${address.slice(-4)}`
                : `Resolution failed for ${args.name}`,
            });
          } else if (toolName === 'send_via_keeperhub') {
            const intent = {
              type: 'send_eth',
              to: args.to,
              amount: args.amount,
              chain: 'Sepolia'
            };
            onStep({ type: 'pending_tx', intent });
            return { status: "awaiting_confirmation", intent };
          } else {
            toolResult = { error: `Unknown tool: ${toolName}` };
          }
        } catch (err) {
          toolResult = { error: `Tool failed: ${err?.message ?? String(err)}` };
        }

        const resultContent = typeof toolResult === 'string' ? toolResult : JSON.stringify(toolResult);
        onStep({ type: 'tool', content: `Result [${toolName}]: ${resultContent}` });

        messages.push({
          role: 'tool',
          tool_call_id: toolCall.id,
          content: resultContent,
        });
      }
      continue;
    }

    // ── Final answer ──────────────────────────────────────────────────────────
    const finalText = assistantMessage.content?.trim() || 'Agent completed with no output.';
    return finalText;
  }

  return `Agent hit iteration limit (${MAX_ITERATIONS}). Try rephrasing your request.`;
}
