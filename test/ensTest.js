import dotenv from 'dotenv'

dotenv.config()

async function main() {
  const { resolveENS } = await import('../src/utils/ens.js')
  console.log('[ENS TEST] Resolving vitalik.eth...')
  const address = await resolveENS('vitalik.eth')
  console.log('[ENS TEST] Result:', address)
}

main().catch((err) => {
  console.error('[ENS TEST] Unexpected error:', err)
})
