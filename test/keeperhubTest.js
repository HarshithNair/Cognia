import dotenv from 'dotenv'

dotenv.config()

async function main() {
  const { executeTransfer, getExecutionStatus } = await import('../src/utils/keeperhub.js')
  console.log('[KEEPERHUB TEST] Triggering transfer...')

  const result = await executeTransfer('0xYourTestAddress', '0.001')
  console.log('[KEEPERHUB TEST] Execute result:', result)

  if (result?.executionId) {
    console.log('[KEEPERHUB TEST] Polling execution status...')
    const status = await getExecutionStatus(result.executionId)
    console.log('[KEEPERHUB TEST] Status result:', status)
  }
}

main().catch((err) => {
  console.error('[KEEPERHUB TEST] Unexpected error:', err)
})
