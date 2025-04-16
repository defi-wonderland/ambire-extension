import { calculateChecksum } from './calculateChecksum'
import { humanToHexInteropAddress } from './humanToHexInterop'

/**
 * Interface for chain data
 */
export interface ChainData {
  namespace: string // e.g., 'eip155', 'solana'
  id?: string // Chain ID (e.g., '1' for Ethereum Mainnet)
}

/**
 * Converts an address and chainData into a human-readable interoperable address.
 *
 * @example
 * ```ts
 * import { addressToHumanInterop } from '@/erc7930'
 *
 * addressToHumanInterop('0x71C7656EC7ab88b098defB751B7401B5f6d8976F', { namespace: 'eip155', id: '1' })
 * // '0x71C7656EC7ab88b098defB751B7401B5f6d8976F@eip155:1#12345678'
 * ```
 *
 * @param address - The address to convert
 * @param chainData - The chain data (namespace and id)
 * @returns Human-readable interoperable address
 */
export function addressToHumanInterop(address: string, chainData: ChainData): string {
  // Format the address for consistent processing
  const formattedAddress = address.startsWith('0x') ? address : `0x${address}`

  // Format the chain part
  const chainPart = `${chainData.namespace}:${chainData.id}`

  // Create a temporary human interop address with a placeholder checksum
  const tempHumanInterop = `${formattedAddress}@${chainPart}#00000000`

  // Convert to hex interop address format
  const hexInterop = humanToHexInteropAddress(tempHumanInterop)

  if (!hexInterop) {
    throw new Error('Failed to generate interoperable address')
  }

  // Calculate the correct checksum from the hex interop address
  const checksum = calculateChecksum(`0x${hexInterop.slice(6)}`)

  // Return the final human-readable interoperable address with the correct checksum
  return `${formattedAddress}@${chainPart}#${checksum}`
}
