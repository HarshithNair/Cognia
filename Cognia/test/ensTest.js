import { resolveENS } from '../src/utils/ens.js'

async function test() {
  const address = await resolveENS('vitalik.eth')
  console.log('Address:', address)
}

test()