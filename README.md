# AgentPass

> **"One ENS name. One agent. Any dApp."**

AgentPass is a Web3 AI agent that gives itself a **persistent, on-chain identity** via ENS (Ethereum Name Service). It accepts natural-language commands, resolves ENS names to wallet addresses, and executes on-chain ETH transfers through KeeperHub — all inside a live demo UI.

Built at the ENS × KeeperHub hackathon.

---

## 🚀 Quick Start

```bash
# 1. Clone and install
npm install

# 2. Set environment variables
cp .env.example .env
# Fill in your keys (see Environment Variables below)

# 3. Run the agent smoke test
npm start

# 4. Run the frontend
cd Cognia && npm install && npm run dev
```

---

## 🏗️ Architecture

```
User (natural language)
       │
       ▼
 ┌─────────────────┐
 │  Cognia React UI │  ← Cognia/ (React + Vite)
 └────────┬────────┘
          │ runAgent(message)
          ▼
 ┌─────────────────────────────┐
 │   Groq Reasoning Loop       │  ← src/agent/agent.js
 │   (Llama 3 / tool calling)  │
 └───────┬──────────┬──────────┘
         │          │
    resolve_ens  send_via_keeperhub
         │          │
         ▼          ▼
 ┌──────────┐  ┌────────────────┐
 │  ENS     │  │   KeeperHub    │
 │ (mainnet)│  │ (Sepolia)      │
 └──────────┘  └────────────────┘
```

---

## 🌐 How ENS Is Used

AgentPass uses ENS (Ethereum Name Service) at **two levels**:

### 1. Address Resolution
When a user says *"send 0.01 ETH to vitalik.eth"*, the agent calls `resolveENS("vitalik.eth")` which:
- Creates a `viem` public client connected to **Ethereum mainnet** via Alchemy
- Calls `client.getEnsAddress({ name })` — ENS names always resolve on mainnet even when the transfer happens on Sepolia
- Returns the raw `0x...` wallet address, or `null` if the name doesn't exist

**File:** `src/utils/ens.js`

### 2. Agent Identity (Text Records)
The agent itself has an ENS name (`cognia.eth`) that stores its identity metadata as on-chain text records:

| Record key | Example value |
|---|---|
| `description` | "AI agent with persistent ENS identity" |
| `capabilities` | "analysis, automation, ETH transfers" |
| `agentType` | "general-agent" |
| `owner` | "0x..." |

`getAgentProfile(name)` reads these records. `setAgentProfile(name, records)` writes them (requires a wallet private key).

**File:** `src/utils/ensRecords.js`

---

## ⚙️ How KeeperHub Is Used

KeeperHub is an **onchain execution layer** for AI agents. We use it as the transfer execution engine:

1. The agent (Groq loop) decides to send ETH and calls `send_via_keeperhub(to, amount)`
2. `executeTransfer(to, amount)` POSTs to the KeeperHub REST API:
   ```
   POST https://api.keeperhub.io/v1/workflows/execute
   Authorization: Bearer <KEEPERHUB_API_KEY>
   {
     "workflowId": "<KEEPERHUB_WORKFLOW_ID>",
     "inputs": {
       "recipient": "0x...",
       "amount": "0.01"
     }
   }
   ```
3. KeeperHub triggers the "Transfer Native Token" workflow on **Sepolia testnet**
4. Returns `{ txHash, executionId, status }` — the `txHash` is shown to the user as proof of execution

`getExecutionStatus(executionId)` can poll for the result asynchronously.

**File:** `src/utils/keeperhub.js`

> 🛡️ **Dry-run mode:** Set `KEEPERHUB_DRY_RUN=true` in `.env` to skip real transactions during development. The agent will log the intent and return a mock tx hash.

---

## 📁 Project Structure

```
AI Brain/
├── src/
│   ├── agent/
│   │   ├── agent.js          # Groq reasoning loop + tool execution
│   │   ├── index.js          # Public entry point (swap mocks for real tools here)
│   │   └── mockTools.js      # Mock ENS + KeeperHub for local dev
│   └── utils/
│       ├── ens.js            # resolveENS(name) → address
│       ├── ensRecords.js     # getAgentProfile / setAgentProfile
│       ├── keeperhub.js      # executeTransfer / getExecutionStatus
│       └── keeperhubConfig.js # API key + workflow ID constants
├── ens/
│   └── index.js              # Barrel re-export of ENS utilities
├── test/
│   ├── ensTest.js            # Test resolveENS("vitalik.eth")
│   └── keeperhubTest.js      # Test executeTransfer
├── Cognia/                   # React + Vite frontend
│   └── src/
│       ├── App.jsx
│       ├── agent/
│       │   ├── mockAgent.js  # Stub for UI dev
│       │   └── realAgent.js  # Real Groq loop (browser-safe)
│       ├── components/
│       │   ├── AgentCard.jsx
│       │   ├── Chat.jsx
│       │   ├── Discover.jsx
│       │   ├── ExecutionLogs.jsx
│       │   └── About.jsx
│       └── utils/
│           ├── ens.js
│           └── ensRecords.js
├── .env                      # Real secrets (never commit)
├── .env.example              # Template for teammates
├── FEEDBACK.md               # Hackathon bounty notes
└── README.md                 # This file
```

---

## 🔑 Environment Variables

| Variable | Where used | Description |
|---|---|---|
| `VITE_GROQ_API_KEY` | `src/agent/agent.js` | Groq API key for Llama 3 |
| `VITE_ALCHEMY_RPC` | `src/utils/ens.js` | Alchemy mainnet RPC URL for ENS reads |
| `KEEPERHUB_API_KEY` | `src/utils/keeperhub.js` | KeeperHub API key |
| `KEEPERHUB_WORKFLOW_ID` | `src/utils/keeperhubConfig.js` | KeeperHub workflow identifier |
| `KEEPERHUB_DRY_RUN` | `src/utils/keeperhub.js` | Set `true` to skip real transfers |
| `VITE_PRIVATE_KEY` | `src/utils/ensRecords.js` | Private key for writing ENS records |

---

## 🧪 Running Tests

```bash
# ENS resolution test (calls Alchemy mainnet RPC)
npm run test:ens

# KeeperHub transfer test (dry-run by default)
npm run test:keeperhub

# Both
npm test

# Agent smoke test (Groq + mock tools)
npm start
```

---

## 🛠️ Swapping Mocks for Real Tools

In `src/agent/index.js`, find the **TOOL SWAP POINT** comment and replace:

```js
// Before (mock):
import { mock_resolveENS, mock_executeTransfer } from './mockTools.js'

// After (real):
import { resolveENS } from '../utils/ens.js'
import { executeTransfer } from '../utils/keeperhub.js'
```

---

## 🏆 Hackathon Notes

- **ENS** provides persistent, human-readable identity for AI agents
- **KeeperHub** provides the trustless execution layer that actually moves funds
- **Groq + Llama 3** provides the reasoning layer that interprets natural language and decides which tools to call
- The architecture is modular: each teammate's module is independently testable and swappable
