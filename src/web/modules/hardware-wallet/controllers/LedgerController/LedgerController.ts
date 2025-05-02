import * as sigUtil from 'eth-sig-util'

import ExternalSignerError from '@ambire-common/classes/ExternalSignerError'
import { ExternalSignerController } from '@ambire-common/interfaces/keystore'
import { TypedMessage } from '@ambire-common/interfaces/userRequest'
import { normalizeLedgerMessage } from '@ambire-common/libs/ledger/ledger'
import { getHdPathFromTemplate } from '@ambire-common/utils/hdPath'
import { DeviceModelId as LedgerDeviceModels, ledgerUSBVendorId } from '@ledgerhq/devices'
import Eth, { ledgerService } from '@ledgerhq/hw-app-eth'
import TransportWebHID from '@ledgerhq/hw-transport-webhid'

export { LedgerDeviceModels }

const TIMEOUT_FOR_RETRIEVING_FROM_LEDGER = 5000

class LedgerController implements ExternalSignerController {
  unlockedPath: string = ''

  unlockedPathKeyAddr: string = ''

  isWebHID: boolean

  transport: TransportWebHID | null

  walletSDK: null | Eth

  type = 'ledger'

  deviceModel: LedgerDeviceModels | 'unknown' = 'unknown'

  deviceId = ''

  static vendorId = ledgerUSBVendorId

  constructor() {
    // TODO: make it optional (by default should be false and set it to true only when there is ledger connected via usb)
    this.isWebHID = true
    this.transport = null
    this.walletSDK = null

    // When the `cleanUpListener` method gets passed to the navigator.hid listeners
    // the `this` context gets lost, so we need to bind it here. The `this` context
    // in the `cleanUp` method should be the `LedgerController` instance.
    this.cleanUpListener = this.cleanUpListener.bind(this)
  }

  isUnlocked(path?: string, expectedKeyOnThisPath?: string) {
    // If no path or expected key is provided, just check if there is any
    // unlocked path, that's a valid case when retrieving accounts for import.
    if (!path || !expectedKeyOnThisPath) {
      return !!(this.unlockedPath && this.unlockedPathKeyAddr)
    }

    // Make sure it's unlocked with the right path and with the right key,
    // otherwise - treat as not unlocked.
    return this.unlockedPathKeyAddr === expectedKeyOnThisPath && this.unlockedPath === path
  }

  /**
   * Checks if WebUSB transport is supported by the browser. Does not work in the
   * service worker (background) in manifest v3, because it needs a `window` ref.
   */
  static isSupported = TransportWebHID.isSupported

  /**
   * Checks if at least one Ledger device is connected.
   */
  static isConnected = async () => {
    const devices = await navigator.hid.getDevices()
    return devices.filter((device) => device.vendorId === LedgerController.vendorId).length > 0
  }

  /**
   * Grant permission to the extension service worker to access an HID device.
   * Should be called only from the foreground and it requires a user gesture
   * to open the device selection prompt (click on a button, etc.).
   */
  static grantDevicePermissionIfNeeded = async () => {
    // If a device is already connected and permission is granted, no need to
    // reselect it again. The service worker than can access the device.
    if (await LedgerController.isConnected()) return

    const filters = [{ vendorId: LedgerController.vendorId }]
    const devices = await navigator.hid.requestDevice({ filters })

    if (devices.length === 0)
      throw new ExternalSignerError('Ledger device connection request was canceled.')

    const device = devices[0]
    await device.open()
  }

  /**
   * This function is designed to handle the scenario where Ledger device loses
   * connectivity during an operation. Without this method, if the Ledger device
   * disconnects, the Ledger SDK hangs indefinitely because the promise
   * associated with the operation never resolves or rejects.
   */
  static withDisconnectProtection = async <T>(operation: () => Promise<T>): Promise<T> => {
    let listenerCbRef: (...args: Array<any>) => any = () => {}
    const disconnectHandler =
      (reject: (reason?: any) => void) =>
      ({ device }: { device: HIDDevice }) => {
        if (LedgerController.vendorId === device.vendorId) {
          reject(new ExternalSignerError('Ledger device got disconnected.'))
        }
      }

    try {
      // Race the operation against a new Promise that rejects if a 'disconnect'
      // event is emitted from the Ledger device. If the device disconnects
      // before the operation completes, the new Promise rejects and the method
      // returns, preventing the SDK from hanging. If the operation completes
      // before the device disconnects, the result of the operation is returned.
      const result = await Promise.race<T>([
        operation(),
        new Promise((_, reject) => {
          listenerCbRef = disconnectHandler(reject)
          navigator.hid.addEventListener('disconnect', listenerCbRef)
        })
      ])

      return result
    } finally {
      // In either case, the 'disconnect' event listener should be removed
      // after the operation to clean up resources.
      if (listenerCbRef) navigator.hid.removeEventListener('disconnect', listenerCbRef)
    }
  }

  /**
   * Handles the scenario where Ledger device hangs indefinitely during an
   * operation. Happens in some cases when the Ledger device gets connected to
   * Ambire, then another app is accessing the Ledger device and then user comes
   * back to Ambire (without unplug-plugging the Ledger).
   */
  static withTimeoutProtection = async <T>(operation: () => Promise<T>): Promise<T> => {
    const timeout = new Promise<never>((_, reject) => {
      setTimeout(() => {
        const message =
          'Could not connect to your Ledger device for an extended period. Please close any other apps that may be accessing your Ledger device (including wallet apps on your computer and web apps). Ensure your Ledger is responsive. Unplug and plug it again.'
        reject(new ExternalSignerError(message))
      }, TIMEOUT_FOR_RETRIEVING_FROM_LEDGER)
    })

    return Promise.race([operation(), timeout])
  }

  /**
   * The Ledger device requires a new SDK instance (session) every time the
   * device is connected (after being disconnected). This method checks if there
   * is an existing SDK instance and creates a new one if needed.
   */
  async #initSDKSessionIfNeeded() {
    const isConnected = await LedgerController.isConnected()
    if (!isConnected)
      throw new ExternalSignerError("Ledger is not connected. Please make sure it's plugged in.")

    if (this.walletSDK) return

    try {
      // @ts-ignore types mismatch, not sure why
      this.transport = await TransportWebHID.create()
      if (!this.transport) throw new ExternalSignerError('Transport failed to get initialized')
      navigator.hid.addEventListener('disconnect', this.cleanUpListener)

      this.walletSDK = new Eth(this.transport)

      // Transport is glitchy and its types mismatch, so overprotect by optional chaining
      this.deviceModel = this.transport.deviceModel?.id || 'unknown'
      this.deviceId = this.transport.device?.productId?.toString() || ''
    } catch (e: any) {
      throw new ExternalSignerError(normalizeLedgerMessage(e?.message))
    }
  }

  async unlock(path: ReturnType<typeof getHdPathFromTemplate>, expectedKeyOnThisPath?: string) {
    await this.#initSDKSessionIfNeeded()

    if (this.isUnlocked(path, expectedKeyOnThisPath)) {
      return 'ALREADY_UNLOCKED'
    }

    if (!this.isWebHID) {
      throw new ExternalSignerError(
        'Ledger only supports USB connection between Ambire and your device. Please connect your device via USB.'
      )
    }

    if (!this.walletSDK) {
      throw new ExternalSignerError(normalizeLedgerMessage()) // no message, indicating no connection
    }

    try {
      const response = await this.walletSDK.getAddress(
        path,
        false // prioritize having less steps for the user
      )
      this.unlockedPath = path
      this.unlockedPathKeyAddr = response.address

      return 'JUST_UNLOCKED'
    } catch (error: any) {
      throw new ExternalSignerError(normalizeLedgerMessage(error?.message))
    }
  }

  async retrieveAddresses(paths: string[]) {
    return LedgerController.withDisconnectProtection(async () => {
      await this.#initSDKSessionIfNeeded()

      if (!this.walletSDK) {
        throw new ExternalSignerError(normalizeLedgerMessage()) // no message, indicating no connection
      }

      const keys: string[] = []
      let latestGetAddressError: ExternalSignerError | undefined
      for (let i = 0; i < paths.length; i++) {
        try {
          // Purposely await in loop to avoid sending multiple requests at once.
          // Send them 1 by 1, the Ledger device can't handle them in parallel,
          // it throws a "device busy" error.
          // eslint-disable-next-line no-await-in-loop
          const key = await LedgerController.withTimeoutProtection(() =>
            this.walletSDK!.getAddress(
              paths[i],
              false, // no need to show on display
              false // no need for the chain code
            )
          )

          if (key) keys.push(key.address)
        } catch (e: any) {
          latestGetAddressError = e
        }
      }

      // Corner-case: if user interacts with Ambire, then interacts with another
      // wallet app (installed on the computer or a web app) and then comes back
      // to Ambire, the Ledger device might not respond to all requests. Therefore
      // we might receive only some of the keys, but not all of them.
      // To reproduce: 1. Plug in and unlock Ledger, open Ambire, import accounts;
      // 2. Now switch to Ledger Live and connect (My Ledger); 3. Switch back to
      // Ambire and try importing accounts again.
      const notAllKeysGotRetrieved = keys.length !== paths.length
      if (notAllKeysGotRetrieved) {
        throw new ExternalSignerError(normalizeLedgerMessage(latestGetAddressError?.message))
      }

      return keys
    })
  }

  /**
   * Attempts to sign an EIP-712 message using the Ledger device. If the device
   * does not support direct (clear) EIP-712 signing, it falls back to signing
   * hashes of the message (that works across all Ledger devices).
   */
  signEIP712MessageWithHashFallback = async ({
    path,
    signTypedData: { domain, types, message, primaryType }
  }: {
    path: string
    signTypedData: TypedMessage
  }) => {
    let res: { v: number; s: string; r: string }
    try {
      res = await this.walletSDK!.signEIP712Message(path, {
        domain,
        types,
        message,
        primaryType
      })
    } catch {
      // NOT all Ledger devices support clear signing EIP-721 message (via
      // `signEIP712Message`), example: Ledger Nano S. The alternative is signing
      // hashes - that works across all Ledger devices.
      const domainSeparatorHex = sigUtil.TypedDataUtils.hashStruct(
        'EIP712Domain',
        domain,
        types,
        true
      ).toString('hex')
      const hashStructMessageHex = sigUtil.TypedDataUtils.hashStruct(
        primaryType,
        message,
        types,
        true
      ).toString('hex')

      res = await this.walletSDK!.signEIP712HashedMessage(
        path,
        domainSeparatorHex,
        hashStructMessageHex
      )
    }

    if (!res)
      throw new ExternalSignerError(
        'Your Ledger device returned an empty signature, which is unexpected. Please try signing again.'
      )

    return res
  }

  cleanUp = async () => {
    if (!this.walletSDK) return

    this.walletSDK = null
    this.unlockedPath = ''
    this.unlockedPathKeyAddr = ''

    navigator.hid.removeEventListener('disconnect', this.cleanUpListener)

    try {
      // Might hang! If user interacts with Ambire, then interacts with another
      // wallet app (installed on the computer or a web app) and then comes back
      // to Ambire, closing the current transport hangs indefinitely.
      await Promise.race([
        // Might fail if the transport was already closed, which is fine.
        this.transport?.close(),
        new Promise((_, reject) => {
          const message = normalizeLedgerMessage('No response received from the Ledger device.')
          setTimeout(() => reject(message), 3000)
        })
      ])
    } finally {
      this.transport = null
    }
  }

  async cleanUpListener({ device }: { device: HIDDevice }) {
    if (device.vendorId === LedgerController.vendorId) await this.cleanUp()
  }
}

export { Eth, ledgerService }
export default LedgerController
