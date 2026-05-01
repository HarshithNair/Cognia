
import { 
  createPublicClient, 
  createWalletClient, 
  http, 
  namehash 
} from 'viem'
import { mainnet } from 'viem/chains'
import { privateKeyToAccount } from 'viem/accounts'


const resolverAbi = [
  {
    name: 'setText',
    type: 'function',
    stateMutability: 'nonpayable',
    inputs: [
      { name: 'node', type: 'bytes32' },
      { name: 'key', type: 'string' },
      { name: 'value', type: 'string' },
    ],
    outputs: [],
  },
]

const client = createPublicClient({
  chain: mainnet,
  transport: http(import.meta.env.VITE_ALCHEMY_RPC),
})

/**
 * getAgentProfile(name)
 * Takes an ENS name (e.g., "agent.eth")
 * Returns ENS text records or null
 */
export async function getAgentProfile(name) {
  try {
    if (!name) return null

    const [description, capabilities, agentType, owner] =
      await Promise.all([
        client.getEnsText({ name, key: 'description' }),
        client.getEnsText({ name, key: 'capabilities' }),
        client.getEnsText({ name, key: 'agentType' }),
        client.getEnsText({ name, key: 'owner' }),
      ])

    return {
     description: description || 'AI-powered agent',
  capabilities: capabilities || 'analysis, automation',
  agentType: agentType || 'general-agent',
  owner: owner || null,
    }
  } catch (error) {
    console.error('ENS record fetch error:', error.message)
    return null
  }
  
}
/**
 * setAgentProfile(name, records)
 * Writes ENS text records for a given ENS name
 * Returns array of transaction hashes or null
 */
export async function setAgentProfile(name, records) {
  try {
    if (!name || !records) return null

    // 1. Convert ENS name → node (VERY IMPORTANT)
    const node = namehash(name)

    // 2. Get resolver address
    const resolver = await client.getEnsResolver({ name })
    if (!resolver) {
      console.error('No resolver set for this ENS name')
      return null
    }

    // 3. Setup wallet
    const account = privateKeyToAccount(import.meta.env.VITE_PRIVATE_KEY)

    const walletClient = createWalletClient({
      account,
      chain: mainnet,
      transport: http(import.meta.env.VITE_ALCHEMY_RPC),
    })

    const txHashes = []

    // 4. Write each record
    for (const [key, value] of Object.entries(records)) {
      if (!value) continue

      const hash = await walletClient.writeContract({
        address: resolver.address,
        abi: resolverAbi,
        functionName: 'setText',
        args: [node, key, value],
      })

      txHashes.push(hash)
    }

    return txHashes
  } catch (error) {
    console.error('ENS write error:', error.message)
    return null
  }
}