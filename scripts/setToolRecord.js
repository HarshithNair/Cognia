import { setAgentProfile } from '../src/utils/ensRecords.js';

const TOOL_DEFINITIONS = [
  {
    type: 'function',
    function: {
      name: 'resolve_ens',
      description: 'Resolve an ENS name to an Ethereum address',
      parameters: {
        type: 'object',
        properties: {
          name: { type: 'string', description: 'ENS name like vitalik.eth' },
        },
        required: ['name'],
      },
    },
  },
  {
    type: 'function',
    function: {
      name: 'send_via_keeperhub',
      description: 'Send ETH with KeeperHub and return a tx hash',
      parameters: {
        type: 'object',
        properties: {
          to: { type: 'string', description: 'Recipient 0x... address' },
          amount: { type: 'string', description: 'ETH amount string, e.g. 0.01' },
        },
        required: ['to', 'amount'],
      },
    },
  },
];

async function main() {
  console.log("Setting tool schema on cognia.eth...");
  const records = {
    "tools.agentpass": JSON.stringify(TOOL_DEFINITIONS)
  };
  
  const txHashes = await setAgentProfile("cognia.eth", records);
  if (txHashes) {
    console.log("Success! Tool schema written. TxHashes:", txHashes);
  } else {
    console.error("Failed to write tool schema.");
  }
}

main();
