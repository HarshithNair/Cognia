import { KEEPERHUB_API_KEY, KEEPERHUB_BASE_URL, WORKFLOW_ID, DRY_RUN } from './keeperhubConfig.js'

/**
 * executeTransfer(to, amount)
 * Triggers the KeeperHub transfer workflow and returns { txHash, executionId, status } or { error }.
 */
export async function executeTransfer(to, amount) {
  console.log('[KeeperHub] Starting transfer workflow trigger')

  if (!KEEPERHUB_API_KEY) {
    return { error: 'Missing KeeperHub API key (VITE_KEEPERHUB_API_KEY/KEEPERHUB_API_KEY)' }
  }
  if (!WORKFLOW_ID) {
    return { error: 'Missing KeeperHub workflow id (VITE_KEEPERHUB_WORKFLOW_ID/KEEPERHUB_WORKFLOW_ID)' }
  }
  if (!to || !amount) {
    return { error: 'Missing required inputs: to and amount' }
  }

  // ── DRY-RUN MODE ────────────────────────────────────────────────────────────
  // Set KEEPERHUB_DRY_RUN=true (or VITE_KEEPERHUB_DRY_RUN=true) to prevent
  // real transactions while you verify the API shape and workflow ID.
  if (DRY_RUN) {
    console.log('[KeeperHub][DRY-RUN] Would POST /workflows/execute', { WORKFLOW_ID, to, amount })
    return {
      txHash: `0xDRYRUN_${Date.now().toString(16)}`,
      executionId: `dry-${Date.now()}`,
      status: 'dry-run',
    }
  }
  // ─────────────────────────────────────────────────────────────────────────────

  // Generic workflow trigger shape used by most workflow APIs.
  // If your KeeperHub tenant uses different keys, update payload fields:
  //   - "inputs"    → try "variables" or "params"
  //   - "recipient" → try "to" or "address"
  //   - "workflowId" → try omitting if the ID is already in the URL path
  const payload = {
    workflowId: WORKFLOW_ID,
    inputs: {
      recipient: to,
      amount,
    },
  }

  console.log('[KeeperHub] POST /workflows/execute', { workflowId: WORKFLOW_ID, to, amount })

  try {
    const res = await fetch(`${KEEPERHUB_BASE_URL}/workflows/execute`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        Authorization: `Bearer ${KEEPERHUB_API_KEY}`,
      },
      body: JSON.stringify(payload),
    })

    const data = await safeJson(res)

    if (!res.ok) {
      return {
        error: `KeeperHub execute failed (${res.status}): ${data?.message || 'unknown error'}`,
      }
    }

    return {
      txHash: data?.txHash || null,
      executionId: data?.executionId || data?.id || null,
      status: data?.status || 'queued',
    }
  } catch (err) {
    return { error: `KeeperHub execute request failed: ${err?.message || String(err)}` }
  }
}

/**
 * getExecutionStatus(executionId)
 * Fetches KeeperHub execution status and returns { status, txHash, logs } or { error }.
 */
export async function getExecutionStatus(executionId) {
  console.log('[KeeperHub] Fetching execution status', executionId)

  if (!KEEPERHUB_API_KEY) {
    return { error: 'Missing KeeperHub API key (VITE_KEEPERHUB_API_KEY/KEEPERHUB_API_KEY)' }
  }
  if (!executionId) {
    return { error: 'Missing executionId' }
  }

  // ── DRY-RUN MODE ────────────────────────────────────────────────────────────
  if (DRY_RUN && String(executionId).startsWith('dry-')) {
    console.log('[KeeperHub][DRY-RUN] Would GET /executions/' + executionId)
    return {
      status: 'completed',
      txHash: `0xDRYRUN_${Date.now().toString(16)}`,
      logs: ['Dry run completed successfully.'],
    }
  }
  // ─────────────────────────────────────────────────────────────────────────────

  try {
    const res = await fetch(`${KEEPERHUB_BASE_URL}/executions/${executionId}`, {
      method: 'GET',
      headers: {
        Authorization: `Bearer ${KEEPERHUB_API_KEY}`,
      },
    })

    const data = await safeJson(res)

    if (!res.ok) {
      return {
        error: `KeeperHub status failed (${res.status}): ${data?.message || 'unknown error'}`,
      }
    }

    return {
      status: data?.status || 'unknown',
      txHash: data?.txHash || null,
      logs: data?.logs || [],
    }
  } catch (err) {
    return { error: `KeeperHub status request failed: ${err?.message || String(err)}` }
  }
}

async function safeJson(response) {
  try {
    return await response.json()
  } catch {
    return null
  }
}
