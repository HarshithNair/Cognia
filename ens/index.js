/**
 * ens/index.js
 * Barrel re-export of all ENS utilities.
 * Import from here instead of reaching into src/utils/ directly.
 *
 * Usage:
 *   import { resolveENS, getAgentProfile, setAgentProfile } from './ens/index.js'
 */

export { resolveENS } from '../src/utils/ens.js'
export { getAgentProfile, setAgentProfile } from '../src/utils/ensRecords.js'
