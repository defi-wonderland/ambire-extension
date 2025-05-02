import ExternalSignerError from '@ambire-common/classes/ExternalSignerError'
import { HD_PATH_TEMPLATE_TYPE } from '@ambire-common/consts/derivation'
import { KeyIterator as KeyIteratorInterface } from '@ambire-common/interfaces/keyIterator'
import { getMessageFromTrezorErrorCode } from '@ambire-common/libs/trezor/trezor'
import { getHdPathFromTemplate } from '@ambire-common/utils/hdPath'
import { TrezorConnect } from '@web/modules/hardware-wallet/controllers/TrezorController'

const PREFETCH_ADDRESSES_COUNT = 20 // enough to cover the next 4 pages (5 addresses per page)

interface KeyIteratorProps {
  walletSDK: TrezorConnect
}

/**
 * Serves for retrieving a range of addresses/keys from a Trezor hardware wallet
 */
class TrezorKeyIterator implements KeyIteratorInterface {
  type = 'trezor' as 'trezor'

  subType = 'hw' as 'hw'

  walletSDK: KeyIteratorProps['walletSDK']

  // Cache the already retrieved addresses, to avoid unnecessary requests to the
  // Trezor device, because each request opens a popup window and requires the
  // user to explicitly approve exporting the addresses, which leads to a bad UX.
  cache: { [path: string]: string } = {}

  constructor({ walletSDK }: KeyIteratorProps) {
    if (!walletSDK) throw new Error('trezorKeyIterator: missing walletSDK prop')

    this.walletSDK = walletSDK
  }

  async retrieve(
    fromToArr: { from: number; to: number }[],
    hdPathTemplate?: HD_PATH_TEMPLATE_TYPE
  ) {
    if (!this.walletSDK) throw new Error('trezorKeyIterator: walletSDK not initialized')

    // Prefetch only when the first address is requested and the range is more
    // than 1. This will be the most common case, covering up to the first
    // a couple of pages (depending on the PREFETCH_ADDRESSES_COUNT).
    // If user requests pages beyond that, whatever. Do not prefetch further.
    const shouldPrefetch = fromToArr.some(({ from, to }) => from === 0 && to > 1)
    const addrBundleToBeRequested: { path: string; showOnTrezor: boolean }[] = []
    const addrBundleToBePrefetched: { path: string; showOnTrezor: boolean }[] = []
    fromToArr.forEach(({ from, to }) => {
      if ((!from && from !== 0) || (!to && to !== 0) || !hdPathTemplate)
        throw new Error('trezorKeyIterator: invalid or missing arguments')

      for (let i = from; i <= to; i++) {
        const path = getHdPathFromTemplate(hdPathTemplate, i)
        addrBundleToBeRequested.push({ path, showOnTrezor: false })
      }

      if (shouldPrefetch) {
        const next = to + 1
        for (let i = next; i < next + PREFETCH_ADDRESSES_COUNT; i++) {
          const path = getHdPathFromTemplate(hdPathTemplate, i)
          addrBundleToBePrefetched.push({ path, showOnTrezor: false })
        }
      }
    })

    const areAllAddressesInCache = addrBundleToBeRequested.every(({ path }) => this.cache[path])
    if (areAllAddressesInCache) {
      return addrBundleToBeRequested.map(({ path }) => this.cache[path])
    }

    const res = await this.walletSDK.ethereumGetAddress({
      // Combine both in 1 request, so that only 1 popup window is opened
      bundle: [...addrBundleToBeRequested, ...addrBundleToBePrefetched]
    })

    if (!res.success)
      throw new ExternalSignerError(
        getMessageFromTrezorErrorCode(res.payload.code, res.payload.error)
      )

    // Store the already retrieved addresses in the cache
    res.payload.forEach(({ address, serializedPath }) => {
      this.cache[serializedPath] = address
    })

    // Return back the the first half of the response (that was originally requested),
    // since the second half was just a prefetch.
    return res.payload.slice(0, addrBundleToBeRequested.length).map(({ address }) => address)
  }
}

export default TrezorKeyIterator
