import { AddressFormatType } from './types'
import { validateAddressFormat } from './validateAddressFormat'

/**
 * Detects the format of an address string.
 *
 * @example
 * ```ts
 * import { detectAddressFormat } from '@/erc7930'
 *
 * detectAddressFormat('0x71C7656EC7ab88b098defB751B7401B5f6d8976F')
 * // AddressFormatType.EVM
 * ```
 *
 * @param address - Address to detect
 * @returns The detected format type
 */
export function detectAddressFormat(address: string): AddressFormatType {
  return validateAddressFormat(address).type
}
