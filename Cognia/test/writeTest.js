import { setAgentProfile } from '../src/utils/ensRecords.js'

async function test() {
  const result = await setAgentProfile('harry.eth', {
    description: 'AI trading agent',
    capabilities: 'trading, analysis',
    agentType: 'defi-bot',
  })

  console.log(result)
}

test()