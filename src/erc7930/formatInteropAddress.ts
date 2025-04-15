import bs58 from 'bs58'
import { fromBytes, fromHex, Hex } from 'viem'
import { calculateChecksum } from './calculateChecksum'
import { AddressFormat, CHAIN_NAMESPACES, ParsedInteroperableAddress } from './types'

/**
 * Converts an address from the specified format to bytes.
 *
 * @param address - The address to convert
 * @param format - Format of the input address ('hex' or 'base58')
 * @returns Address as a Uint8Array
 */
function convertToBytes(address: Uint8Array | string, format: AddressFormat): Uint8Array {
  if (address instanceof Uint8Array) return address

  if (format === 'hex') return fromHex(address as `0x${string}`, 'bytes')
  if (format === 'base58') return bs58.decode(address)
  if (format === 'base64') {
    const binaryString = atob(address)
    const bytes = new Uint8Array(binaryString.length)
    for (let i = 0; i < binaryString.length; i++) {
      bytes[i] = binaryString.charCodeAt(i)
    }
    return bytes
  }

  throw new Error(`Unsupported address format: ${format}`)
}

/**
 * Formats a chain for human readability.
 *
 * @param chainNamespace - The chain namespace (e.g., 'eip155', 'solana')
 * @param chainId - The chain ID in hex format
 * @returns Human-readable chain string
 */
function formatChain(chainNamespace: string, chainId: string): string {
  // Handle specific chain namespaces
  if (chainNamespace === 'eip155') {
    return `${chainNamespace}:${fromHex(chainId as Hex, 'number')}`
  }

  if (chainNamespace === 'solana') {
    // For Solana, reference is base58btc-encoded
    return `${chainNamespace}:${bs58.encode(fromHex(chainId as Hex, 'bytes'))}`
  }

  // Default handling for unknown namespaces
  return `${chainNamespace}:${chainId}`
}

/**
 * Formats an address based on chain namespace.
 *
 * @param chainNamespace - The chain namespace (e.g., 'eip155', 'solana')
 * @param address - The address in hex format
 * @returns Formatted address string appropriate for the chain
 */
function formatAddress(chainNamespace: string, address: string): string {
  // Address formatting depends on the chain
  if (chainNamespace === 'eip155') {
    // EVM addresses are displayed as hex
    return address
  }

  if (chainNamespace === 'solana') {
    // Solana addresses are base58btc-encoded
    return bs58.encode(fromHex(address as `0x${string}`, 'bytes'))
  }

  // Default to hex representation
  return address
}

/**
 * Parses an Interoperable Address into its components.
 *
 * @example
 * ```ts
 * import { parseInteroperableAddress } from '@/erc7930'
 *
 * parseInteroperableAddress('0x0001000001011234567890abcdef', 'hex')
 * // {
 * //   version: '0001',
 * //   chainIdLength: 1,
 * //   chainId: '01',
 * //   chainType: '0000',
 * //   addressLength: 10,
 * //   address: '1234567890abcdef',
 * //   chainNamespace: 'eip155'
 * // }
 * ```
 *
 * @param serializedAddress - Interoperable Address in the specified format
 * @param format - Format of the input address ('hex' or 'base58')
 * @returns Parsed components of the Interoperable Address
 */
export function parseInteroperableAddress(
  serializedAddress: Uint8Array | string,
  format: AddressFormat = 'hex'
): ParsedInteroperableAddress {
  // Convert the address to bytes based on the format
  const bytes = convertToBytes(serializedAddress, format)
  let offset = 0

  // Parse version (2 bytes)
  const version = fromBytes(bytes.slice(offset, offset + 2), 'hex')
  offset += 2

  // Parse chainType (2 bytes)
  const chainType = fromBytes(bytes.slice(offset, offset + 2), 'hex')
  offset += 2

  // Parse chainIdLength
  const chainIdLength = fromBytes(bytes.slice(offset, offset + 1), 'hex')
  const chainIdLengthNumber = parseInt(chainIdLength, 16)
  offset += 1

  // Parse chainId
  const chainId = fromBytes(bytes.slice(offset, offset + chainIdLengthNumber), 'hex')
  offset += chainIdLengthNumber

  // Parse addressLength (1 byte)
  const addressLength = fromBytes(bytes.slice(offset, offset + 1), 'hex')
  const addressLengthNumber = parseInt(addressLength, 16)
  offset += 1

  // Parse address
  const address = fromBytes(bytes.slice(offset, offset + addressLengthNumber), 'hex')

  return {
    version,
    chainIdLength: parseInt(chainIdLength, 16),
    chainId,
    chainType,
    addressLength: parseInt(addressLength, 16),
    address,
    chainNamespace: CHAIN_NAMESPACES[chainType.slice(2)] || chainType
  }
}

/**
 * Converts an Interoperable Address to a human-readable format.
 *
 * Transforms interoperable address to the format: `<account>@<chain>#<checksum>`
 *
 * @example
 * ```ts
 * import { formatInteroperableAddress } from '@/erc7930'
 *
 * formatInteroperableAddress('0x0001000001011234567890abcdef')
 * // '1234567890abcdef@eip155:1#8F7E6D5C'
 * ```
 *
 * @param address - Interoperable Address in the specified format
 * @param format - Format of the input address ('hex' or 'base58')
 * @returns Human-readable representation of the Interoperable Address
 */
export function formatInteroperableAddress(address: string, format: AddressFormat = 'hex'): string {
  // 1. Parse the address based on the format
  const parsedAddress = parseInteroperableAddress(address, format)

  // 2. Format the chain part
  const chainPart = formatChain(parsedAddress.chainNamespace, parsedAddress.chainId)

  // 3. Format the address part
  const addressPart = formatAddress(parsedAddress.chainNamespace, parsedAddress.address)

  // 4. Calculate the checksum
  const checksum = calculateChecksum(`0x${address.slice(6)}`)

  // 5. Return the full format
  return `${addressPart}@${chainPart}#${checksum}`
}

/**
 * Converts a hex interoperable address to a human-readable format.
 *
 * @example
 * ```ts
 * import { hexToHumanInteropAddress } from '@/erc7930'
 *
 * hexToHumanInteropAddress('0x00010000010171c7656ec7ab88b098defb751b7401b5f6d8976f')
 * // '0x71c7656ec7ab88b098defb751b7401b5f6d8976f@eip155:1#8F7E6D5C'
 * ```
 *
 * @param hexAddress - Hex interoperable address
 * @returns Human-readable interoperable address or null if invalid
 */
export function hexToHumanInteropAddress(hexAddress: string): string | null {
  try {
    return formatInteroperableAddress(hexAddress, 'hex')
  } catch (error) {
    return null
  }
}
