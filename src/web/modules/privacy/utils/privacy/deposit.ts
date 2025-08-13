import { parseEther, getAddress, encodeFunctionData } from 'viem'
import type { Hash, Secret } from '@0xbow/privacy-pools-core-sdk'
import type { PublicClient, Address } from 'viem'
import { sepolia } from 'viem/chains'
import { chainData } from '@ambire-common/controllers/privacy/config'
import { entrypointAbi } from './abi'

export type DepositSecrets = {
  nullifier: Secret
  secret: Secret
  precommitment: Hash
}

type DepositTransactionParams = {
  amount: string
  depositSecrets: DepositSecrets
  entryPointAddress: string
  userAddress: Address
  publicClient: PublicClient
}

type DepositResult = {
  from: Address
  to: Address
  data: `0x${string}`
  value: bigint
}

/**
 * Prepares and simulates a deposit transaction
 */
export async function prepareDepositTransaction({
  amount,
  depositSecrets,
  entryPointAddress,
  userAddress,
  publicClient
}: DepositTransactionParams): Promise<{
  request: any
}> {
  try {
    const { request } = await publicClient
      .simulateContract({
        account: userAddress,
        address: getAddress(entryPointAddress),
        abi: entrypointAbi,
        functionName: 'deposit',
        args: [depositSecrets.precommitment],
        value: parseEther(amount)
      })
      .catch((err) => {
        if (err?.metaMessages[0] === 'Error: PrecommitmentAlreadyUsed()') {
          throw new Error('Precommitment already used')
        }
        throw err
      })

    return { request }
  } catch (error) {
    // eslint-disable-next-line no-console
    console.error(error)
    return { request: null }
  }
}

/**
 * Executes a deposit transaction
 */
export async function executeDepositTransaction({
  amount,
  depositSecrets,
  userAddress
}: DepositTransactionParams): Promise<DepositResult> {
  const entryPointAddress = chainData[sepolia.id].poolInfo[0].entryPointAddress

  const data = encodeFunctionData({
    abi: entrypointAbi,
    functionName: 'deposit',
    args: [depositSecrets.precommitment]
  })

  return { from: userAddress, to: getAddress(entryPointAddress), data, value: parseEther(amount) }
}
