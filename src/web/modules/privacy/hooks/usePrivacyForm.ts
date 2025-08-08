import { useState, useEffect } from 'react'
import {
  AccountCommitment,
  AccountService,
  calculateContext,
  ChainConfig,
  Circuits,
  CommitmentProof,
  DataService,
  generateMerkleProof,
  Hash,
  PoolAccount,
  PrivacyPoolSDK,
  Withdrawal,
  WithdrawalProofInput
} from '@0xbow/privacy-pools-core-sdk'
import usePrivacyControllerState from '@web/hooks/usePrivacyControllerState'
import { getRpcUrl } from '@ambire-common/controllers/privacy/config'
import { createPublicClient, http } from 'viem'
import { sepolia } from 'viem/chains'

import { getTimestampFromBlockNumber } from '../../../utils/privacy'

export enum ReviewStatus {
  PENDING = 'pending',
  APPROVED = 'approved',
  DECLINED = 'declined',
  EXITED = 'exited',
  SPENT = 'spent'
}

interface PrivacySDKState {
  sdk: PrivacyPoolSDK | null
  dataService: DataService | null
  accountService: AccountService | null
  isLoading: boolean
  error: string | null
  isInitialized: boolean
}

type UpdatedPoolAccount = PoolAccount & {
  balance: bigint
  lastCommitment: AccountCommitment
  reviewStatus: ReviewStatus
  isValid: boolean
  name: number
  scope: Hash
  chainId: number
}

const usePrivacyForm = () => {
  const { pools, poolsByChain, chainDataByWhitelistedChains, chainData } =
    usePrivacyControllerState()

  const [sdkState, setSdkState] = useState<PrivacySDKState>({
    sdk: null,
    dataService: null,
    accountService: null,
    isLoading: false,
    error: null,
    isInitialized: false
  })

  // Initialize Privacy Pools SDK
  useEffect(() => {
    let isMounted = true

    const initializeSDK = async () => {
      if (sdkState.isInitialized || sdkState.isLoading) return

      setSdkState((prev) => ({ ...prev, isLoading: true, error: null }))

      try {
        const baseUrl = typeof window !== 'undefined' ? window.location.origin : ''
        if (!baseUrl) throw new Error('SDK can only be initialized on client-side') // TODO: fix this, will probably fail in server-side

        const circuits = new Circuits({ baseUrl })
        // Initialize the privacy pools SDK with browser-safe configuration
        const sdk = new PrivacyPoolSDK(circuits)

        const dataServiceConfig: ChainConfig[] = poolsByChain.map((pool) => {
          return {
            chainId: pool.chainId,
            privacyPoolAddress: pool.address,
            startBlock: pool.deploymentBlock,
            rpcUrl: chainDataByWhitelistedChains[pool.chainId].sdkRpcUrl,
            apiKey: 'sdk' // It's not an api key https://viem.sh/docs/clients/public#key-optional
          }
        })

        const dataService = new DataService(dataServiceConfig)

        if (isMounted) {
          setSdkState({
            sdk,
            dataService,
            accountService: null,
            isLoading: false,
            error: null,
            isInitialized: true
          })
        }
      } catch (error) {
        // eslint-disable-next-line no-console
        console.error('Failed to initialize Privacy Pools SDK:', error)
        if (isMounted) {
          setSdkState({
            sdk: null,
            dataService: null,
            accountService: null,
            isLoading: false,
            error: error instanceof Error ? error.message : 'Failed to initialize SDK',
            isInitialized: false
          })
        }
      }
    }

    initializeSDK().catch((error) => {
      console.error('Failed to initialize Privacy Pools SDK:', error)
    })

    return () => {
      isMounted = false
      // Cleanup SDK if needed
      if (sdkState.sdk) {
        // Add any cleanup logic here if the SDK provides cleanup methods
      }
    }
  }, [
    sdkState.isInitialized,
    sdkState.isLoading,
    sdkState.sdk,
    poolsByChain,
    chainDataByWhitelistedChains
  ])

  /**
   * Generates a zero-knowledge proof for a commitment using Poseidon hash.
   *
   * @param value - The value being committed to
   * @param label - Label associated with the commitment
   * @param nullifier - Unique nullifier for the commitment
   * @param secret - Secret key for the commitment
   * @returns Promise resolving to proof and public signals
   * @throws {ProofError} If proof generation fails
   */
  const generateRagequitProof = async (commitment: AccountCommitment): Promise<CommitmentProof> => {
    if (!sdkState.sdk) throw new Error('SDK not initialized')

    return sdkState.sdk.proveCommitment(
      commitment.value,
      commitment.label,
      commitment.nullifier,
      commitment.secret
    )
  }

  /**
   * Verifies a commitment proof.
   *
   * @param proof - The commitment proof to verify
   * @param publicSignals - Public signals associated with the proof
   * @returns Promise resolving to boolean indicating proof validity
   * @throws {ProofError} If verification fails
   */
  const verifyRagequitProof = async ({ proof, publicSignals }: CommitmentProof) => {
    if (!sdkState.sdk) throw new Error('SDK not initialized')

    return sdkState.sdk.verifyCommitment({ proof, publicSignals })
  }

  /**
   * Generates a withdrawal proof.
   *
   * @param commitment - Commitment to withdraw
   * @param input - Input parameters for the withdrawal
   * @param withdrawal - Withdrawal details
   * @returns Promise resolving to withdrawal payload
   * @throws {ProofError} If proof generation fails
   */
  const generateWithdrawalProof = async (
    commitment: AccountCommitment,
    input: WithdrawalProofInput
  ) => {
    if (!sdkState.sdk) throw new Error('SDK not initialized')

    return sdkState.sdk.proveWithdrawal(
      {
        preimage: {
          label: commitment.label,
          value: commitment.value,
          precommitment: {
            hash: BigInt('0x1234') as Hash,
            nullifier: commitment.nullifier,
            secret: commitment.secret
          }
        },
        hash: commitment.hash,
        nullifierHash: BigInt('0x1234') as Hash
      },
      input
    )
  }

  const verifyWithdrawalProof = async (proof: WithdrawalProof) => {
    if (!sdkState.sdk) throw new Error('SDK not initialized')

    return sdkState.sdk.verifyWithdrawal(proof)
  }

  /**
   * Always recreate the accountService -because we cannot store
   * the seed in memory due to security issues- and retrieve history
   */
  const loadAccount = async (seed: string) => {
    if (!sdkState.dataService) {
      throw new Error('DataService not initialized')
    }

    const accountService = new AccountService(sdkState.dataService, { mnemonic: seed })
    await accountService.retrieveHistory(pools)

    setSdkState((prev) => ({ ...prev, accountService }))
  }

  const createDepositSecrets = (scope: Hash) => {
    if (!sdkState.accountService) {
      throw new Error('AccountService not initialized')
    }

    return sdkState.accountService.createDepositSecrets(scope)
  }

  const createWithdrawalSecrets = (commitment: AccountCommitment) => {
    if (!sdkState.accountService) {
      throw new Error('AccountService not initialized')
    }

    return sdkState.accountService.createWithdrawalSecrets(commitment)
  }

  const getContext = (withdrawal: Withdrawal, scope: Hash) => {
    return calculateContext(withdrawal, scope)
  }

  const getMerkleProof = (leaves: bigint[], leaf: bigint) => {
    return generateMerkleProof(leaves, leaf)
  }

  const getPoolAccountsFromAccount = async (chainId: number) => {
    if (!sdkState.accountService) {
      throw new Error('AccountService not initialized')
    }

    const paMap = sdkState.accountService.account.poolAccounts.entries()
    const poolAccounts: PoolAccount[] = []

    Array.from(paMap).forEach(([scope, poolAccountsArray]) => {
      poolAccountsArray.forEach(async (poolAccount, idx) => {
        const lastCommitment =
          poolAccount.children.length > 0
            ? poolAccount.children[poolAccount.children.length - 1]
            : poolAccount.deposit

        const chainIdKey = Object.keys(chainData).find((key) =>
          chainData[Number(key)].poolInfo.some((pool) => pool.scope === scope)
        )

        const updatedPoolAccount: UpdatedPoolAccount = {
          ...(poolAccount as PoolAccount),
          balance: lastCommitment!.value,
          lastCommitment,
          reviewStatus: ReviewStatus.PENDING,
          isValid: false,
          name: idx + 1, // Use idx from forEach instead of manual counter
          scope,
          chainId: Number(chainIdKey)
        }

        const publicClient = createPublicClient({
          chain: sepolia,
          transport: http(getRpcUrl(Number(chainId)))
        })

        updatedPoolAccount.deposit.timestamp = await getTimestampFromBlockNumber(
          poolAccount.deposit.blockNumber,
          publicClient
        )

        if (updatedPoolAccount.children.length > 0) {
          updatedPoolAccount.children.forEach(async (child) => {
            child.timestamp = await getTimestampFromBlockNumber(child.blockNumber, publicClient)
          })
        }

        if (updatedPoolAccount.ragequit) {
          updatedPoolAccount.balance = 0n
          updatedPoolAccount.reviewStatus = ReviewStatus.EXITED
        }

        if (updatedPoolAccount.ragequit) {
          updatedPoolAccount.ragequit.timestamp = await getTimestampFromBlockNumber(
            updatedPoolAccount.ragequit.blockNumber,
            publicClient
          )
        }

        poolAccounts.push(updatedPoolAccount)
      })
    })

    const poolAccountsByChainScope = poolAccounts.reduce((acc, curr) => {
      acc[`${curr.chainId}-${curr.scope}`] = [...(acc[`${curr.chainId}-${curr.scope}`] || []), curr]
      return acc
    }, {} as Record<string, PoolAccount[]>)

    const poolAccountsByCurrentChain = poolAccounts.filter((pa) => pa.chainId === chainId)

    return { poolAccounts: poolAccountsByCurrentChain, poolAccountsByChainScope }
  }

  return {
    sdkState
  }
}

export default usePrivacyForm
