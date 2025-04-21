const supportedEVMChainIds = [
  1, // Ethereum
  10, // Optimism
  11155111, // Sepolia
  56, // BNB Chain
  137, // Polygon
  5000, // Mantle
  8453, // Base
  42161, // Arbitrum
  43114, // Avalanche
  534352 // Scroll
]

export function isChainSupported(chainId: number): boolean {
  return supportedEVMChainIds.includes(chainId)
}
