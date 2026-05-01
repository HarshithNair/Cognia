import { createPublicClient, http } from 'viem'
import { mainnet } from 'viem/chains'

const client = createPublicClient({
  chain: mainnet,
  transport: http(import.meta.env.VITE_ALCHEMY_RPC),
})

export async function resolveENS(name) {
  try {
    if (!name) return null

    const address = await client.getEnsAddress({ name })
    return address || null
  } catch (error) {
    console.error('ENS resolution error:', error.message)
    return null
  }
}