import { getAgentProfile } from '../src/utils/ensRecords.js'

const name = process.argv[2] || 'vitalik.eth'

async function run() {
  console.log(`\n🔍 ENS Name: ${name}`)

  const profile = await getAgentProfile(name)

  console.log('\n📦 Agent Profile:')
  console.log(JSON.stringify(profile, null, 2))
}

run()