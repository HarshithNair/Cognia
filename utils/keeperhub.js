import dotenv from 'dotenv'
import path from 'path'
import { fileURLToPath } from 'url'

const __filename = fileURLToPath(import.meta.url)
const __dirname = path.dirname(__filename)

dotenv.config({ path: path.join(__dirname, '..', '.env'), override: true })

/**
 * Simple helper to read KeeperHub credentials from environment.
 * Exports: getConfig() -> { apiKey, workflowKey } (values or null)
 */
export function getConfig() {
  const apiKey = process.env.KEEPERHUB_API_KEY || null
  const workflowKey = process.env.KEEPERHUB_WORKFLOW_ID || process.env.KEEPERHUB_WORKFLOW_KEY || null
  return { apiKey, workflowKey }
}

export function validateConfig() {
  const cfg = getConfig()
  return Boolean(cfg.apiKey && cfg.workflowKey)
}
