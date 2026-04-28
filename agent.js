// src/agent/agent.js
// Core AgentPass reasoning loop.
// Calls Groq with tool definitions, executes tool calls, feeds results back,
// and returns a structured trace of every step.

import Groq from "groq-sdk";

const MAX_ITERATIONS = 5;

// ─── Input validation ─────────────────────────────────────────────────────────

function validateETHAmount(amount) {
  if (!amount || typeof amount !== "string") {
    return { valid: false, error: "Amount must be a non-empty string" };
  }
  const num = parseFloat(amount);
  if (isNaN(num) || num <= 0) {
    return { valid: false, error: `Invalid amount: "${amount}" (must be > 0)` };
  }
  if (num > 1000) {
    return { valid: false, error: `Amount too large: ${amount} ETH (max 1000)` };
  }
  return { valid: true };
}

function validateEthereumAddress(addr) {
  // ENS names end with .eth (or other TLDs), or Ethereum addresses are 0x + 40 hex chars
  if (addr.endsWith(".eth") || addr.endsWith(".xyz")) {
    return { valid: true };
  }
  if (/^0x[a-fA-F0-9]{40}$/.test(addr)) {
    return { valid: true };
  }
  return {
    valid: false,
    error: `Invalid address: "${addr}" (must be ENS name or 0x... address)`,
  };
}

// ─── Groq tool schemas ────────────────────────────────────────────────────────

const TOOL_DEFINITIONS = [
  {
    type: "function",
    function: {
      name: "resolve_ens",
      description:
        "Resolves an ENS domain name (e.g. vitalik.eth) to an Ethereum wallet address.",
      parameters: {
        type: "object",
        properties: {
          name: {
            type: "string",
            description: "The ENS name to resolve, e.g. 'vitalik.eth'",
          },
        },
        required: ["name"],
      },
    },
  },
  {
    type: "function",
    function: {
      name: "send_via_keeperhub",
      description:
        "Sends ETH to a resolved wallet address using KeeperHub. Returns a transaction hash.",
      parameters: {
        type: "object",
        properties: {
          to: {
            type: "string",
            description: "The recipient Ethereum address (0x...).",
          },
          amount: {
            type: "string",
            description: "The amount of ETH to send as a string, e.g. '0.01'.",
          },
        },
        required: ["to", "amount"],
      },
    },
  },
];

// ─── main export ──────────────────────────────────────────────────────────────

/**
 * Runs the AgentPass reasoning + tool-execution loop.
 *
 * @param {string} userMessage        - Natural-language instruction from the user.
 * @param {Object} tools              - Object with callable tool implementations:
 *                                      { resolve_ens, send_via_keeperhub }
 * @returns {Promise<Array<{type: string, content: string}>>}
 *          A step-by-step trace of the agent's work.
 */
export async function runAgent(userMessage, tools) {
  const client = new Groq({ apiKey: process.env.VITE_GROQ_API_KEY });

  const steps = [];

  // Conversation history fed back to Groq on every iteration
  const messages = [
    {
      role: "system",
      content:
        "You are AgentPass, a Web3 AI agent. When the user wants to send ETH to an ENS name, " +
        "resolve the ENS name to get the address, then call send_via_keeperhub to execute the transfer. " +
        "After you receive the transaction hash confirming the transfer, provide a summary of what was done and stop. " +
        "Do not make redundant tool calls.",
    },
    { role: "user", content: userMessage },
  ];

  steps.push({ type: "thinking", content: `User: ${userMessage}` });

  for (let i = 0; i < MAX_ITERATIONS; i++) {
    let response;

    try {
      response = await client.chat.completions.create({
        model: "llama-3.3-70b-versatile",
        messages,
        tools: TOOL_DEFINITIONS,
        tool_choice: "auto",
      });
    } catch (err) {
      const errMsg = `Groq API error: ${err?.message ?? String(err)}`;
      steps.push({ type: "result", content: errMsg });
      return steps;
    }

    const choice = response.choices[0];
    const assistantMessage = choice.message;

    // Always push the assistant turn back into history
    messages.push(assistantMessage);

    // ── Case 1: model wants to call one or more tools ──────────────────────
    if (choice.finish_reason === "tool_calls" && assistantMessage.tool_calls?.length) {
      for (const toolCall of assistantMessage.tool_calls) {
        const fnName = toolCall.function.name;
        let fnArgs;

        try {
          fnArgs = JSON.parse(toolCall.function.arguments);
        } catch {
          fnArgs = {};
        }

        steps.push({
          type: "tool",
          content: `Calling tool: ${fnName}(${JSON.stringify(fnArgs)})`,
        });

        // ── Execute the tool ───────────────────────────────────────────────
        let toolResult;
        try {
          if (fnName === "resolve_ens") {
            const ensName = fnArgs.name;
            const addrVal = validateEthereumAddress(ensName);
            if (!addrVal.valid) {
              toolResult = `Validation error: ${addrVal.error}`;
            } else {
              toolResult = await tools.resolve_ens(ensName);
            }
          } else if (fnName === "send_via_keeperhub") {
            const to = fnArgs.to;
            const amount = fnArgs.amount;

            // Validate both fields
            const addrVal = validateEthereumAddress(to);
            if (!addrVal.valid) {
              toolResult = `Validation error: ${addrVal.error}`;
            } else {
              const amtVal = validateETHAmount(amount);
              if (!amtVal.valid) {
                toolResult = `Validation error: ${amtVal.error}`;
              } else {
                toolResult = await tools.send_via_keeperhub(to, amount);
              }
            }
          } else {
            toolResult = `Unknown tool: ${fnName}`;
          }
        } catch (err) {
          toolResult = `Tool execution failed: ${err?.message ?? String(err)}`;
        }

        const resultStr = String(toolResult);

        steps.push({
          type: "tool",
          content: `Tool result [${fnName}]: ${resultStr}`,
        });

        // Feed the tool result back to Groq
        messages.push({
          role: "tool",
          tool_call_id: toolCall.id,
          content: resultStr,
        });
      }

      // Continue the loop so Groq can reason over the tool results
      continue;
    }

    // ── Case 2: model is done — extract final text reply ──────────────────
    const finalText =
      assistantMessage.content?.trim() ??
      "Agent completed without a text reply.";

    steps.push({ type: "result", content: finalText });
    return steps;
  }

  // Reached max iterations without a final answer
  steps.push({
    type: "result",
    content: `Agent hit the ${MAX_ITERATIONS}-iteration limit without completing. Last messages logged above.`,
  });

  return steps;
}
