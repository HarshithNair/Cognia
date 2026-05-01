// Mock implementations used to unblock agent-loop development.

function delay(ms) {
  return new Promise((resolve) => setTimeout(resolve, ms))
}

/**
 * mock_resolveENS(name)
 * Takes an ENS name string (e.g., "vitalik.eth") and returns a mock address string.
 */
export async function mock_resolveENS(name) {
  await delay(500)
  console.log(`[mockTools] resolve ENS ${name} -> 0xMockAddress123`)
  return '0xMockAddress123'
}

/**
 * mock_executeTransfer(to, amount)
 * Takes recipient address + ETH amount string and returns a mock tx hash string.
 */
export async function mock_executeTransfer(to, amount) {
  await delay(500)
  console.log(`[mockTools] transfer ${amount} ETH to ${to} -> 0xMockTxHash456`)
  return '0xMockTxHash456'
}
