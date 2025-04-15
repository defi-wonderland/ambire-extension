/**
 * Known chain namespaces and their human-readable representation.
 *
 * Maps chain type hex codes to their human-readable namespace names.
 *
 * @example
 * ```ts
 * import { CHAIN_NAMESPACES } from '@/erc7930'
 *
 * console.log(CHAIN_NAMESPACES['0000']) // 'eip155'
 * console.log(CHAIN_NAMESPACES['0002']) // 'solana'
 * ```
 */
export const CHAIN_NAMESPACES: Record<string, string> = {
  '0000': 'eip155',
  '0002': 'solana'
}

/**
 * Supported formats for Interoperable Address input.
 *
 * @example
 * ```ts
 * import { AddressFormat } from '@/erc7930'
 *
 * const format: AddressFormat = 'hex'
 * // or
 * const format: AddressFormat = 'base58'
 * ```
 */
export type AddressFormat = 'hex' | 'base58' | 'base64'

/**
 * Parsed components of an Interoperable Address.
 *
 * Contains all the decoded elements of an interoperable address.
 *
 * @example
 * ```ts
 * import { ParsedInteroperableAddress } from '@/erc7930'
 *
 * const parsed: ParsedInteroperableAddress = {
 *   version: '0001',
 *   chainIdLength: 1,
 *   chainId: '01',
 *   chainType: '0000',
 *   addressLength: 20,
 *   address: '71c7656ec7ab88b098defb751b7401b5f6d8976f',
 *   chainNamespace: 'eip155'
 * }
 * ```
 */
export interface ParsedInteroperableAddress {
  version: string
  chainIdLength: number
  chainId: string
  chainType: string
  addressLength: number
  address: string
  chainNamespace: string
}

/**
 * Address format type identifiers.
 *
 * Enum of supported address format types for validation and identification.
 *
 * @example
 * ```ts
 * import { AddressFormatType } from '@/erc7930'
 *
 * const type = AddressFormatType.EVM
 * // or
 * const type = AddressFormatType.INTEROP_HEX
 * ```
 */
export enum AddressFormatType {
  EVM = 'evm', // Ethereum/EVM address (0x...)
  SOLANA = 'solana', // Solana address (base58)
  BITCOIN = 'bitcoin', // Bitcoin address (base58)
  ENS = 'ens', // ENS domain (.eth, .xyz, etc.)
  INTEROP_HEX = 'interop_hex', // Interoperable address in hex format
  INTEROP_BASE58 = 'interop_base58', // Interoperable address in base58 format
  INTEROP_BASE64 = 'interop_base64', // Interoperable address in base64 format
  INTEROP_HUMAN = 'interop_human', // Human-readable interoperable address (<account>@<chain>#<checksum>)
  UNKNOWN = 'unknown' // Unknown format
}

/**
 * Result of address format validation.
 *
 * Contains validation results including original data, format type, validity, and optional parsed details.
 *
 * @example
 * ```ts
 * import { AddressFormatResult, AddressFormatType } from '@/erc7930'
 *
 * const result: AddressFormatResult = {
 *   data: '0x71C7656EC7ab88b098defB751B7401B5f6d8976F',
 *   type: AddressFormatType.EVM,
 *   isValid: true
 * }
 * ```
 */
export interface AddressFormatResult {
  data: string // The original address string
  type: AddressFormatType // The identified format type
  isValid: boolean // Whether the address is valid in its format
  details?: ParsedInteroperableAddress
}
