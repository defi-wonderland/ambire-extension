import { calculateChecksum } from './calculateChecksum'
import { humanToHexInteropAddress } from './humanToHexInterop'

/**
 * Interface for chain data
 */
export interface ChainData {
  namespace: string // e.g., 'eip155', 'solana'
  id: string // Chain ID (e.g., '1' for Ethereum Mainnet, or a base58 ID for Solana)
}

/**
 * Formats an address based on its format and chain namespace
 */
function formatAddressForDisplay(address: string, namespace: string): string {
  // For EVM addresses, ensure they have 0x prefix
  if (namespace === 'eip155') {
    return address.startsWith('0x') ? address : `0x${address}`
  }

  // For Solana addresses, use the original format (likely base58)
  if (namespace === 'solana') {
    return address
  }

  // Default format
  return address
}

/**
 * Converts an address and chainData into a human-readable interoperable address.
 * Handles different address formats including hex, base58, and base64.
 *
 * @example
 * ```ts
 * import { addressToHumanInterop } from '@/erc7930'
 *
 * // EVM address example
 * addressToHumanInterop('0x71C7656EC7ab88b098defB751B7401B5f6d8976F', { namespace: 'eip155', id: '1' })
 * // '0x71C7656EC7ab88b098defB751B7401B5f6d8976F@eip155:1#12345678'
 *
 * // Solana address example
 * addressToHumanInterop('AKp5u1QF3HA9hUTx5jcJbZupuiB7CVjZ2EANAQsaX2pm', { namespace: 'solana', id: '4sGjMW1sUnHzSxGspuhpqLDx6wiyjNtZ' })
 * // 'AKp5u1QF3HA9hUTx5jcJbZupuiB7CVjZ2EANAQsaX2pm@solana:4sGjMW1sUnHzSxGspuhpqLDx6wiyjNtZ#87654321'
 * ```
 *
 * @param address - The address to convert
 * @param chainData - The chain data (namespace and id)
 * @returns Human-readable interoperable address
 */
export function addressToHumanInterop(address: string, chainData: ChainData): string {
  if (!address) {
    throw new Error('Address is required')
  }

  if (!chainData.namespace) {
    throw new Error('Chain namespace is required')
  }

  if (!chainData.id) {
    throw new Error('Chain ID is required')
  }

  // Format the address for display (maintains the appropriate format for the chain)
  const displayAddress = formatAddressForDisplay(address, chainData.namespace)

  // Format the chain part
  const chainPart = `${chainData.namespace}:${chainData.id}`

  // Create a temporary human interop address with a placeholder checksum
  const tempHumanInterop = `${displayAddress}@${chainPart}#00000000`

  // Convert to hex interop address format using the existing function
  const hexInterop = humanToHexInteropAddress(tempHumanInterop)

  if (!hexInterop) {
    throw new Error('Failed to generate interoperable address')
  }

  // Calculate the correct checksum from the hex interop address
  const checksum = calculateChecksum(`0x${hexInterop.slice(6)}`)

  // Return the final human-readable interoperable address with the correct checksum
  return `${displayAddress}@${chainPart}#${checksum}`
}
