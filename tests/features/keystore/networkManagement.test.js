import { bootstrapWithStorage } from '../../common-helpers/bootstrapWithStorage'
import { saParams } from '../../config/constants'

import {
  addNetworkManually,
  editNetwork,
  disableNetwork,
  addNetworkFromChainlist
} from './functions'

describe('networkManagement', () => {
  let browser
  let page
  let recorder

  beforeEach(async () => {
    ;({ browser, page, recorder } = await bootstrapWithStorage('networkManagement', saParams))
  })

  afterEach(async () => {
    await recorder.stop()
    await browser.close()
  })

  it.skip('adding network manually', async () => {
    await addNetworkManually(page, 'FLR')
    await editNetwork(page, 'FLR')
    await disableNetwork(page, 'FLR')
  })

  it.skip('adding network from Chainlist', async () => {
    await addNetworkFromChainlist(page, 'FLOW')
    await editNetwork(page, 'FLOW')
    await disableNetwork(page, 'FLOW')
  })
})
