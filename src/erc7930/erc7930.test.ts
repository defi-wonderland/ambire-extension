import { formatToHumanInterop, ChainData } from './formatToHumanInterop'
import { humanToHexInteropAddress } from './humanToHexInterop'
import { parseInteropAddress } from './parseInteropAddress'
import { ParsedInteroperableAddress, AddressFormat } from './types'

// Mock dependencies for formatToHumanInterop
// We assume humanToHexInteropAddress converts the human format to a hex string
// and calculateChecksum generates a fixed checksum for testing.
// jest.mock('./humanToHexInterop', () => ({
//   humanToHexInteropAddress: jest.fn((humanAddress: string) => {
//     // Simple mock: return a fixed hex string based on input structure for checksum calculation
//     if (humanAddress.includes('eip155:1')) return '0x000100000101...' // Mock hex for EVM
//     if (humanAddress.includes('solana')) return '0x0001000201...' // Mock hex for Solana
//     return '0x' // Default mock hex
//   })
// }))

// jest.mock('./calculateChecksum', () => ({
//   calculateChecksum: jest.fn((hexInterop: string) => {
//     // Fixed checksum for predictable testing
//     if (hexInterop.startsWith('0x00010000')) return 'fedcba98' // Checksum for mocked EVM
//     if (hexInterop.startsWith('0x00010002')) return '12345678' // Checksum for mocked Solana
//     return '00000000'
//   })
// }))

describe('ERC-7930 Utilities', () => {
  afterEach(() => {
    jest.clearAllMocks()
  })

  describe('formatToHumanInterop', () => {
    it('should correctly format an EVM address with chain ID', () => {
      const address = '0xd8dA6BF26964aF9D7eEd9e03E53415D37aA96045'
      const chainData: ChainData = { namespace: 'eip155', id: '1' }
      const expected = '0xd8dA6BF26964aF9D7eEd9e03E53415D37aA96045@eip155:1#4CA88C9C'

      expect(formatToHumanInterop(address, chainData)).toBe(expected)
    })

    it('should correctly format a non-EVM address', () => {
      const address = 'MJKqp326RZCHnAAbew9MDdui3iCKWco7fsK9sVuZTX2' // Example Solana address
      const chainData: ChainData = { namespace: 'solana', id: '5eykt4UsFv8P8NJdTREpY1vzqKqZKvdp' } // Example Solana chain ID
      const expected =
        'MJKqp326RZCHnAAbew9MDdui3iCKWco7fsK9sVuZTX2@solana:5eykt4UsFv8P8NJdTREpY1vzqKqZKvdp#4A58ACC6'

      expect(formatToHumanInterop(address, chainData)).toBe(expected)
    })

    it('should throw error if address is missing', () => {
      const chainData: ChainData = { namespace: 'eip155', id: '1' }
      expect(() => formatToHumanInterop('', chainData)).toThrow('Address is required')
    })

    it('should throw error if chain namespace is missing', () => {
      const address = '0x1234...'
      const chainData = { namespace: '', id: '1' } as ChainData
      expect(() => formatToHumanInterop(address, chainData)).toThrow('Chain namespace is required')
    })

    it('should throw error if chain ID is missing', () => {
      const address = '0x1234...'
      const chainData = { namespace: 'eip155', id: '' } as ChainData
      expect(() => formatToHumanInterop(address, chainData)).toThrow('Chain ID is required')
    })
  })

  describe('parseInteropAddress', () => {
    it('should correctly parse a valid hex address with EVM chain ID', () => {
      // Hex representation: version(0001) + chainType(0000 for eip155) + chainIdLength(01) + chainId(01) + addressLength(14/20) + address
      const hexInput = '0x000100000101141234567890abcdef1234567890abcdef12345678'
      const expected: ParsedInteroperableAddress = {
        version: '0x0001',
        chainType: '0x0000',
        chainIdLength: 1,
        chainId: '0x01',
        addressLength: 20,
        address: '0x1234567890abcdef1234567890abcdef12345678',
        chainNamespace: 'eip155'
      }
      expect(parseInteropAddress(hexInput, 'hex')).toEqual(expected)
    })

    it('should correctly parse a valid hex address with Solana chain ID (mocked type)', () => {
      // Hex representation: version(0001) + chainType(0002 for solana) + chainIdLength(20/32) + chainId(...) + addressLength(20/32) + address(...)
      // Example values assumed
      const hexInput =
        '0x00010002203473476a4d573173556e487a5378477370756870714c4478367769796a4e745a20c147b7b30db9c3724f12db3be1f948790050a005c23bb1b755f0a3b72c1f2523'
      const expected: ParsedInteroperableAddress = {
        version: '0x0001',
        chainType: '0x0002',
        chainIdLength: 32,
        chainId: '0x3473476a4d573173556e487a5378477370756870714c4478367769796a4e745a',
        addressLength: 32,
        address: '0xc147b7b30db9c3724f12db3be1f948790050a005c23bb1b755f0a3b72c1f2523',
        chainNamespace: 'solana' // Assuming CHAIN_NAMESPACES maps 0002 -> solana
      }
      expect(parseInteropAddress(hexInput, 'hex')).toEqual(expected)
    })

    it('should correctly parse a base58 address (mocked data)', () => {
      // This requires a valid base58 encoded string that decodes to the expected byte structure
      // For simplicity, we'll mock the input/output relation based on the hex test
      // const base58Input = '...some_valid_base58_string...' // Placeholder
      const correspondingBytes = Buffer.from(
        '000100000101141234567890abcdef1234567890abcdef12345678',
        'hex'
      )

      const expected: ParsedInteroperableAddress = {
        version: '0x0001',
        chainType: '0x0000',
        chainIdLength: 1,
        chainId: '0x01',
        addressLength: 20,
        address: '0x1234567890abcdef1234567890abcdef12345678',
        chainNamespace: 'eip155'
      }

      // We'd need a real base58 library and input for this test
      // expect(parseInteroperableAddress(base58Input, 'base58')).toEqual(expected)
      // Convert Buffer to Uint8Array
      const byteArray = new Uint8Array(
        correspondingBytes.buffer,
        correspondingBytes.byteOffset,
        correspondingBytes.byteLength
      )
      expect(parseInteropAddress(byteArray)).toEqual(expected) // Test with bytes directly
    })

    it('should throw error for unsupported format', () => {
      const hexInput = '0x0001...'
      expect(() => parseInteropAddress(hexInput, 'invalidFormat' as AddressFormat)).toThrow(
        'Unsupported address format: invalidFormat'
      )
    })
  })

  describe('humanToHexInteropAddress', () => {
    it('should correctly convert a human-readable EVM address to hex', () => {
      const humanAddress = '0xd8dA6BF26964aF9D7eEd9e03E53415D37aA96045@eip155:1#4CA88C9C'
      const expected = '0x00010000010114D8DA6BF26964AF9D7EED9E03E53415D37AA96045'.toLowerCase()
      expect(humanToHexInteropAddress(humanAddress)).toBe(expected)
    })

    it('should correctly convert EVM address without chainid', () => {
      const humanAddress = '0xd8dA6BF26964aF9D7eEd9e03E53415D37aA96045@#144A4B21'
      const expected = '0x000100000014D8DA6BF26964AF9D7EED9E03E53415D37AA96045'.toLowerCase()
      expect(humanToHexInteropAddress(humanAddress)).toBe(expected)
    })

    it('should correctly convert a human-readable Solana address to hex', () => {
      const humanAddress =
        'MJKqp326RZCHnAAbew9MDdui3iCKWco7fsK9sVuZTX2@solana:5eykt4UsFv8P8NJdTREpY1vzqKqZKvdp#4A58ACC6'
      const expected =
        '0x0001000217e15de390a1bfea7ad6ed13c9898b4881b8aef9e705b31b2005333498d5aea4ae009585c43f7b8c30df8e70187d4a713d134f977fc8dfe0b5'
      expect(humanToHexInteropAddress(humanAddress)).toBe(expected)
    })

    it('should correctly convert a Solana mainnet network with no address', () => {
      const humanAddress = '@solana:5eykt4UsFv8P8NJdTREpY1vzqKqZKvdp#DE9AAA3F'
      const expected = '0x0001000217e15de390a1bfea7ad6ed13c9898b4881b8aef9e705b31b00'
      expect(humanToHexInteropAddress(humanAddress)).toBe(expected)
    })
  })
})
