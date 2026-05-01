# 🧠 Cognia — Decentralized AI Agent Identity Layer

Cognia is a Web3 infrastructure layer that gives AI agents a **persistent, discoverable identity** using ENS, enabling them to be reused and interact seamlessly across applications.

---

## 🚀 Problem

Today, AI agents are:

* ❌ Stateless — no persistent identity
* ❌ Not reusable across applications
* ❌ Hard to discover
* ❌ Unable to interact with each other

Every app requires agents to be recreated from scratch.

---

## 💡 Solution

Cognia introduces a **universal identity layer for AI agents**.

Each agent is assigned an ENS name (e.g. `cognia.eth`) and stores:

* Capabilities
* Description
* Configuration

This allows:

* 🔁 Reusability across apps
* 🔍 Discoverability
* 🤝 Agent-to-agent interaction

---

## ⚙️ How It Works

1. **Agent Identity (ENS)**
   Each agent is registered using ENS and mapped to a human-readable name.

2. **Agent Metadata (ENS Text Records)**
   Agent capabilities and configuration are stored on-chain.

3. **Execution Layer**
   When a user sends a request:

   * ENS is resolved
   * Agent config is fetched
   * AI model executes task
   * Tools (e.g., KeeperHub) handle execution

4. **Response Returned**
   The agent returns a structured response.

---

## 🖥️ Frontend Demo

The UI demonstrates:

* 🪪 Agent identity (`cognia.eth`)
* 💬 Chat interface
* ⚙️ Step-by-step execution flow:

  * Thinking
  * ENS resolution
  * Tool execution
  * Final result

---

## 🧱 Tech Stack

* ⚛️ React + Vite
* 🎨 Plain CSS
* 🌐 ENS (Ethereum Name Service)
* 🤖 Groq API (Llama 3)
* ⚙️ KeeperHub (execution layer)
* 🔗 Sepolia Testnet

---

## ✨ Key Features

* 🔗 Persistent AI agent identity
* 🔍 Agent discovery via ENS
* 🔁 Cross-application reuse
* 🤖 Agent-to-agent interaction (concept/demo)
* ⚙️ Transparent execution flow

---

## 🎯 Use Cases

* AI agent marketplaces
* Developer tools for reusable agents
* Cross-platform AI assistants
* Multi-agent collaboration systems

---

## 🏆 Why Cognia

Cognia moves AI from:

> isolated tools → interconnected intelligent systems

By combining **AI + Web3 identity**, it enables a future where agents are:

* Persistent
* Discoverable
* Composable

---

## 🛠️ Setup (Frontend)

```bash
npm install
npm run dev
```

---

## 🌍 Vision

Cognia aims to become the **identity and interoperability layer for AI agents on the decentralized web**.

---

## 📌 Demo Flow

1. User sends a request
2. Agent identity is resolved via ENS
3. Execution steps are shown in real-time
4. Final response is returned

---

## 🤝 Contributors

* Frontend: React UI & demo experience
* Agent Layer: ENS + execution logic

---

## 🧠 Tagline

**“One identity for every AI agent.”**

---
