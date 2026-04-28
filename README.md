# AgentPass — Groq-powered agent brain

Minimal project scaffolding for the AgentPass Web3 agent brain. The code in this repository implements a Groq-powered reasoning loop that can call tools (ENS resolution and KeeperHub transfers). Mock tools are provided so the agent loop can be developed and tested before teammate utilities are available.

Quick start

1. Install dependencies:

```bash
npm install
```

2. Set your Groq API key in the environment (the code reads `import.meta.env.VITE_GROQ_API_KEY`). Example for a POSIX shell:

```bash
export VITE_GROQ_API_KEY="your_groq_api_key_here"
```

3. Run the smoke test (uses the mock tools by default):

```bash
npm start
```

Files of interest

- [src/agent/agent.js](src/agent/agent.js) — main Groq loop and tool-call handling.
- [src/agent/index.js](src/agent/index.js) — public entry point wired to mocks and includes a smoke test.
- [src/agent/mockTools.js](src/agent/mockTools.js) — `mock_resolveENS` and `mock_executeTransfer` used for local testing.

Swapping in real teammate utilities

Replace the mock imports in [src/agent/index.js](src/agent/index.js#L1) with your real functions and update the `tools` object accordingly. The repository includes comments showing exactly where to swap.

Safety note

The agent can call `send_via_keeperhub` which might broadcast real transactions when real tools are wired in. Keep the following in mind:

- Use a `dry-run` or testnet environment when developing.
- Require explicit human confirmation before broadcasting real transfers.

If you want, I can add a `dry-run` toggle, minimal unit tests for `runAgent()`, or CI-friendly test scripts next.
