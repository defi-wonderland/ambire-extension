import { Signature, Transaction, TransactionLike } from 'ethers'

import ExternalSignerError from '@ambire-common/classes/ExternalSignerError'
import { Hex } from '@ambire-common/interfaces/hex'
import { ExternalKey, KeystoreSignerInterface } from '@ambire-common/interfaces/keystore'
import { normalizeLedgerMessage } from '@ambire-common/libs/ledger/ledger'
import { addHexPrefix } from '@ambire-common/utils/addHexPrefix'
import { getHdPathFromTemplate } from '@ambire-common/utils/hdPath'
import shortenAddress from '@ambire-common/utils/shortenAddress'
import { stripHexPrefix } from '@ambire-common/utils/stripHexPrefix'
import LedgerController, {
  LedgerDeviceModels,
  ledgerService
} from '@web/modules/hardware-wallet/controllers/LedgerController'

class LedgerSigner implements KeystoreSignerInterface {
  key: ExternalKey

  controller: LedgerController | null = null

  constructor(_key: ExternalKey) {
    this.key = _key
  }

  // TODO: the ExternalSignerController type is missing some properties from
  // type 'LedgerController', sync the types mismatch
  // @ts-ignore
  init(externalDeviceController?: LedgerController) {
    if (!externalDeviceController) {
      throw new ExternalSignerError('ledgerSigner: externalDeviceController not initialized')
    }

    this.controller = externalDeviceController
  }

  #prepareForSigning = async () => {
    if (!this.controller) {
      throw new ExternalSignerError(
        'Something went wrong when preparing Ledger to sign. Please try again or contact support if the problem persists.'
      )
    }

    const path = getHdPathFromTemplate(this.key.meta.hdPathTemplate, this.key.meta.index)
    await this.controller.unlock(path, this.key.addr)

    // After unlocking, SDK instance should always be present, double-check here
    if (!this.controller.walletSDK) {
      throw new ExternalSignerError(
        'Something went wrong when preparing Ledger to sign. Please try again or contact support if the problem persists.'
      )
    }

    if (!this.controller.isUnlocked(path, this.key.addr)) {
      throw new ExternalSignerError(
        `The Ledger is unlocked, but with different seed or passphrase, because the address of the retrieved key is different than the key expected (${shortenAddress(
          this.key.addr,
          13
        )})`
      )
    }
  }

  async #withNormalizedError<T>(operation: () => Promise<T>): Promise<T> {
    try {
      return await operation()
    } catch (error: any) {
      throw new ExternalSignerError(normalizeLedgerMessage(error?.message))
    }
  }

  signRawTransaction: KeystoreSignerInterface['signRawTransaction'] = async (txnRequest) => {
    await this.#prepareForSigning()

    // In case `maxFeePerGas` is provided, treat as an EIP-1559 transaction,
    // since there's no other better way to distinguish between the two in here.
    const type = typeof txnRequest.maxFeePerGas === 'bigint' ? 2 : 0

    try {
      const unsignedTxn: TransactionLike = { ...txnRequest, type }

      const unsignedSerializedTxn = Transaction.from(unsignedTxn).unsignedSerialized

      // Sending NFTs is NOT available for Ledger Nano S users via Ledger Live
      // (and probably to Ledger Blue users, both devices are considered legacy).
      // As a magic workaround, disabling "clearer" signing makes it work,
      // otherwise, the Ledger SDK fails with "EthAppNftNotSupported" error.
      const shouldResolveNFTs =
        !!this.key.meta.deviceModel &&
        ![LedgerDeviceModels.nanoS, LedgerDeviceModels.blue, 'unknown'].includes(
          this.key.meta.deviceModel as LedgerDeviceModels
        )
      // Look for resolutions for external plugins and ERC20 for "clearer" signing.
      // Without this step, Ledger may just show a generic "Contract call" screen.
      const resolution = await ledgerService.resolveTransaction(
        stripHexPrefix(unsignedSerializedTxn),
        this.controller!.walletSDK!.loadConfig,
        {
          externalPlugins: true, // enable support for DeFi dapps via plugins
          erc20: true, // enable ERC20 parsing so token info is shown
          nft: shouldResolveNFTs // enable NFT parsing so names/images are shown
        }
      )

      const path = getHdPathFromTemplate(this.key.meta.hdPathTemplate, this.key.meta.index)

      const res = await LedgerController.withDisconnectProtection(() =>
        this.#withNormalizedError(() =>
          this.controller!.walletSDK!.signTransaction(
            path,
            stripHexPrefix(unsignedSerializedTxn),
            resolution
          )
        )
      )

      const signature = Signature.from({
        r: addHexPrefix(res.r),
        s: addHexPrefix(res.s),
        v: Signature.getNormalizedV(addHexPrefix(res.v))
      })
      const signedSerializedTxn = Transaction.from({
        ...unsignedTxn,
        signature
      }).serialized

      return signedSerializedTxn
    } catch (e: any) {
      throw new ExternalSignerError(e?.message || 'ledgerSigner: singing failed for unknown reason')
    }
  }

  signTypedData: KeystoreSignerInterface['signTypedData'] = async (signTypedData) => {
    await this.#prepareForSigning()

    try {
      const path = getHdPathFromTemplate(this.key.meta.hdPathTemplate, this.key.meta.index)
      const rsvRes = await LedgerController.withDisconnectProtection(() =>
        this.#withNormalizedError(() =>
          this.controller!.signEIP712MessageWithHashFallback({
            path,
            signTypedData
          })
        )
      )

      const signature = addHexPrefix(`${rsvRes.r}${rsvRes.s}${rsvRes.v.toString(16)}`)
      return signature
    } catch (e: any) {
      throw new ExternalSignerError(
        e?.message ||
          'Signing the typed data message failed. Please try again or contact Ambire support if issue persists.'
      )
    }
  }

  signMessage: KeystoreSignerInterface['signMessage'] = async (hex) => {
    if (!stripHexPrefix(hex)) {
      throw new ExternalSignerError(
        'Request for signing an empty message detected. Signing empty messages with Ambire is disallowed.'
      )
    }

    await this.#prepareForSigning()

    try {
      const path = getHdPathFromTemplate(this.key.meta.hdPathTemplate, this.key.meta.index)
      const rsvRes = await LedgerController.withDisconnectProtection(() =>
        this.#withNormalizedError(() =>
          this.controller!.walletSDK!.signPersonalMessage(path, stripHexPrefix(hex))
        )
      )

      const signature = addHexPrefix(`${rsvRes?.r}${rsvRes?.s}${rsvRes?.v.toString(16)}`)
      return signature
    } catch (e: any) {
      throw new ExternalSignerError(
        e?.message ||
          'Signing the message failed. Please try again or contact Ambire support if issue persists.'
      )
    }
  }

  // eslint-disable-next-line class-methods-use-this
  sign7702(hex: string): { yParity: Hex; r: Hex; s: Hex } {
    throw new Error('not support', { cause: hex })
  }
}

export default LedgerSigner
