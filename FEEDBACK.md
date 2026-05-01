# Feedback Notes

> Required for the $250 hackathon bounty — every confusion or blocker is logged here.

---

## 2026-05-01 — KeeperHub API Shape (Initial Integration)

**Issue:** KeeperHub API docs for exact endpoint paths and request/response shape are not present in this repo.

**Assumed pattern based on standard workflow REST APIs:**
- Trigger endpoint: `POST /workflows/execute`
- Request body: `{ workflowId, inputs: { recipient, amount } }`
- Status endpoint: `GET /executions/{executionId}`
- Auth: `Authorization: Bearer <API_KEY>`

**Potential mismatches to watch for:**
- Field name `inputs` → may be `variables`, `params`, or `body` depending on tenant config
- Field name `recipient` → may be `to`, `address`, or a custom variable name from your workflow builder
- `workflowId` may be embedded in the URL path rather than the body (e.g. `POST /workflows/{id}/execute`)
- Response may return `id` instead of `executionId`

**Mitigation:** Added `KEEPERHUB_DRY_RUN=true` mode so the full agent loop can be tested without a live KeeperHub call. Switch to `false` once the exact API shape is confirmed.

---

## 2026-05-01 — Model Availability on Free Tier

**Issue:** `llama-3.3-70b-versatile` requires a paid Groq tier on some accounts.

**Fix:** Changed default model to `llama3-70b-8192` which is explicitly listed as free tier. Set `GROQ_MODEL=llama-3.3-70b-versatile` in `.env` to override if you have access.

---

## 2026-05-01 — ENS Resolution: Mainnet vs Sepolia

**Clarification (not a bug):** ENS names always resolve on **Ethereum mainnet**, even when the actual ETH transfer happens on **Sepolia testnet**. This is by design — the ENS registry lives on mainnet. The `ens.js` client correctly connects to mainnet for reads, while KeeperHub uses Sepolia for execution.

---

## 2026-05-01 — `import.meta.env` in Node.js Context

**Issue:** Vite's `import.meta.env` is only available in browser/Vite bundles. The root Node.js files (`agent.js`, `index.js`) cannot use `import.meta.env` at runtime.

**Fix:** Root Node files use `process.env` + `dotenv.config()`. Vite frontend files use `import.meta.env`. Both fall back gracefully. The env variable names are kept identical (`VITE_GROQ_API_KEY` etc.) so they work in both contexts.
