import { createPublicClient, http } from 'viem'
import { mainnet } from 'viem/chains'

const env = (typeof import.meta !== 'undefined' && import.meta.env) ? import.meta.env : {}

// Public client for ENS reads. Prefer Vite env, with Node fallbacks for scripts.
const ALCHEMY_RPC_URL = env.VITE_ALCHEMY_RPC || process.env.VITE_ALCHEMY_RPC || process.env.ALCHEMY_RPC || ''

const client = createPublicClient({
  chain: mainnet,
  transport: http(ALCHEMY_RPC_URL),
})

/**
 * resolveENS(name)
 * Takes an ENS name (e.g., "alice.eth") and returns the resolved wallet address string,
 * or `null` if the name does not resolve or on error.
 */
export async function resolveENS(name) {
  if (!name) return null
  try {
    const address = await client.getEnsAddress({ name })
    return address || null
  } catch (err) {
    // Gracefully return null on any resolution error
    console.error('resolveENS error:', err?.message ?? String(err))
    return null
  }
}
