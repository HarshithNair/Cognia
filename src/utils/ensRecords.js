import {
  createPublicClient,
  createWalletClient,
  http,
  namehash,
} from 'viem'
import { mainnet } from 'viem/chains'
import { privateKeyToAccount } from 'viem/accounts'

const env = (typeof import.meta !== 'undefined' && import.meta.env) ? import.meta.env : {}

const ALCHEMY_RPC_URL = env.VITE_ALCHEMY_RPC || process.env.VITE_ALCHEMY_RPC || process.env.ALCHEMY_RPC || ''

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
  transport: http(ALCHEMY_RPC_URL),
})

/**
 * getAgentProfile(name)
 * Takes an ENS name (e.g., "myagent.eth") and returns an object with text records:
 * { description, capabilities, agentType, owner } or `null` on error.
 */
export async function getAgentProfile(name) {
  try {
    if (!name) return null

    const [description, capabilities, agentType, owner] = await Promise.all([
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
    console.error('getAgentProfile error:', error?.message ?? String(error))
    return null
  }
}

/**
 * setAgentProfile(name, records)
 * Writes ENS text records for a given ENS name. `records` is an object of key->value strings.
 * Returns an array of transaction hashes or `null` on error.
 */
export async function setAgentProfile(name, records) {
  try {
    if (!name || !records) return null

    const node = namehash(name)

    const resolver = await client.getEnsResolver({ name })
    if (!resolver) {
      console.error('No resolver set for this ENS name')
      return null
    }

    const privateKey = env.VITE_PRIVATE_KEY || process.env.VITE_PRIVATE_KEY || process.env.PRIVATE_KEY
    if (!privateKey) {
      console.error('No private key found in environment (VITE_PRIVATE_KEY or PRIVATE_KEY)')
      return null
    }

    const account = privateKeyToAccount(privateKey)

    const walletClient = createWalletClient({
      account,
      chain: mainnet,
      transport: http(ALCHEMY_RPC_URL),
    })

    const txHashes = []

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
    console.error('setAgentProfile error:', error?.message ?? String(error))
    return null
  }
}

/**
 * readTextRecord(name, key)
 * Reads an arbitrary text record from an ENS name.
 */
export async function readTextRecord(name, key) {
  try {
    if (!name || !key) return null
    const text = await client.getEnsText({ name, key })
    return text || null
  } catch (error) {
    console.error('readTextRecord error:', error?.message ?? String(error))
    return null
  }
}
