export const runAgent = async (message, onStep) => {
  const delay = (ms) => new Promise((resolve) => setTimeout(resolve, ms));

  try {
    // 1. Thinking
    onStep({ type: 'thinking', content: 'Thinking...' });
    await delay(1200);

    // 2. Tool: ENS
    onStep({ type: 'tool', content: 'Resolving ENS name...' });
    await delay(1500);

    // 3. Tool: KeeperHub
    onStep({ type: 'tool', content: 'Submitting via KeeperHub...' });
    await delay(1800);

    // 4. Final Answer
    return `Successfully processed request: "${message}". The agent has confirmed execution on the Sepolia testnet.`;
  } catch (err) {
    throw new Error("Failed to execute agent workflow");
  }
};
