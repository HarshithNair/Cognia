import Groq from 'groq-sdk'

const MAX_ITERATIONS = 5
// Default: llama3-70b-8192 was specified in the hackathon brief but has been decommissioned.
// Using llama-3.3-70b-versatile — Groq's official replacement (still free tier).
// Override with GROQ_MODEL env var if needed.
const GROQ_MODEL = process.env.GROQ_MODEL || 'llama-3.3-70b-versatile'

const TOOL_DEFINITIONS = [
  {
    type: 'function',
    function: {
      name: 'resolve_ens',
      description: 'Resolve an ENS name to an Ethereum address',
      parameters: {
        type: 'object',
        properties: {
          name: { type: 'string', description: 'ENS name like vitalik.eth' },
        },
        required: ['name'],
      },
    },
  },
  {
    type: 'function',
    function: {
      name: 'send_via_keeperhub',
      description: 'Send ETH with KeeperHub and return a tx hash',
      parameters: {
        type: 'object',
        properties: {
          to: { type: 'string', description: 'Recipient 0x... address' },
          amount: { type: 'string', description: 'ETH amount string, e.g. 0.01' },
        },
        required: ['to', 'amount'],
      },
    },
  },
]

/**
 * runAgent(userMessage, tools)
 * Takes a user message + tool functions and returns an execution trace array of steps.
 */
export async function runAgent(userMessage, tools) {
  const apiKey = process.env.VITE_GROQ_API_KEY
  if (!apiKey) {
    return [{ type: 'result', content: 'Groq API error: missing VITE_GROQ_API_KEY in environment' }]
  }

  const client = new Groq({ apiKey })
  const steps = [{ type: 'thinking', content: `User: ${userMessage}` }]

  const messages = [
    {
      role: 'system',
      content:
        'You are AgentPass. For transfer requests with ENS names, call resolve_ens first, then call send_via_keeperhub. '
        + 'After tool results, provide a concise final summary and stop.',
    },
    { role: 'user', content: userMessage },
  ]

  for (let i = 0; i < MAX_ITERATIONS; i++) {
    let response
    try {
      response = await client.chat.completions.create({
        model: GROQ_MODEL,
        messages,
        tools: TOOL_DEFINITIONS,
        tool_choice: 'auto',
      })
    } catch (err) {
      return [
        ...steps,
        { type: 'result', content: `Groq API error: ${err?.message ?? String(err)}` },
      ]
    }

    const choice = response.choices?.[0]
    const assistantMessage = choice?.message
    if (!assistantMessage) {
      return [...steps, { type: 'result', content: 'Groq API error: empty response from model' }]
    }

    messages.push(assistantMessage)

    if (choice.finish_reason === 'tool_calls' && assistantMessage.tool_calls?.length) {
      for (const toolCall of assistantMessage.tool_calls) {
        const toolName = toolCall.function.name
        let args = {}
        try {
          args = JSON.parse(toolCall.function.arguments || '{}')
        } catch {
          args = {}
        }

        steps.push({
          type: 'tool',
          content: `Calling ${toolName} with ${JSON.stringify(args)}`,
        })

        let toolResult
        try {
          if (toolName === 'resolve_ens') {
            toolResult = await tools.resolve_ens(args.name)
          } else if (toolName === 'send_via_keeperhub') {
            toolResult = await tools.send_via_keeperhub(args.to, args.amount)
          } else {
            toolResult = `Unknown tool: ${toolName}`
          }
        } catch (err) {
          toolResult = `Tool execution failed: ${err?.message ?? String(err)}`
        }

        const resultContent = typeof toolResult === 'string' ? toolResult : JSON.stringify(toolResult)
        steps.push({ type: 'tool', content: `Tool result [${toolName}]: ${resultContent}` })

        messages.push({
          role: 'tool',
          tool_call_id: toolCall.id,
          content: resultContent,
        })
      }
      continue
    }

    return [
      ...steps,
      { type: 'result', content: assistantMessage.content?.trim() || 'Agent completed with no text output.' },
    ]
  }

  return [
    ...steps,
    { type: 'result', content: `Agent hit iteration limit (${MAX_ITERATIONS}) before finishing.` },
  ]
}
