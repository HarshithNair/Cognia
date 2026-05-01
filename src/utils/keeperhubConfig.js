const env = (typeof import.meta !== 'undefined' && import.meta.env) ? import.meta.env : {}

// KeeperHub API key from environment. Keep this server-side when possible.
export const KEEPERHUB_API_KEY = env.VITE_KEEPERHUB_API_KEY || process.env.VITE_KEEPERHUB_API_KEY || process.env.KEEPERHUB_API_KEY || ''

// Workflow identifier from KeeperHub dashboard.
export const WORKFLOW_ID =
  env.VITE_KEEPERHUB_WORKFLOW_ID ||
  process.env.VITE_KEEPERHUB_WORKFLOW_ID ||
  process.env.KEEPERHUB_WORKFLOW_ID ||
  process.env.KEEPERHUB_WORKFLOW_KEY ||
  ''

// Override if KeeperHub provides a different hostname for your project.
export const KEEPERHUB_BASE_URL =
  env.VITE_KEEPERHUB_BASE_URL ||
  process.env.VITE_KEEPERHUB_BASE_URL ||
  process.env.KEEPERHUB_BASE_URL ||
  'https://api.keeperhub.io/v1'

/**
 * DRY_RUN mode — when true, the transfer function logs the intent and
 * returns a mock response WITHOUT hitting the real KeeperHub endpoint.
 * Set KEEPERHUB_DRY_RUN=true in your .env to enable.
 */
export const DRY_RUN =
  env.VITE_KEEPERHUB_DRY_RUN === 'true' ||
  process.env.KEEPERHUB_DRY_RUN === 'true' ||
  false
