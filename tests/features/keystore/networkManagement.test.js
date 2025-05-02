import { bootstrapWithStorage } from '../../common-helpers/bootstrapWithStorage'
import { saParams } from '../../config/constants'

import { addNetworkManually, editNetwork, deletNetwork } from './functions'

describe('networkManagement', () => {
  let browser
  let page
  let extensionURL
  let recorder

  beforeEach(async () => {
    ;({ browser, page, recorder, extensionURL } = await bootstrapWithStorage(
      'networkManagement',
      saParams
    ))
  })

  afterEach(async () => {
    await recorder.stop()
    await browser.close()
  })

  it('adding network manually', async () => {
    await addNetworkManually(page, 'FLR')
    await editNetwork(page, 'FLR')
    await deletNetwork(page, 'FLR')
  })

  it.skip('adding network from Chainlist', async () => {
    // TODO: Implement the test
  })
})
