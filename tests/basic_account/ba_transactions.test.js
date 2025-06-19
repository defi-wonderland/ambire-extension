import { bootstrapWithStorage } from '../common-helpers/bootstrapWithStorage'
import { baParams } from '../config/constants'

import { signMessage } from '../common/transactions.js'

describe('ba_transactions', () => {
  let browser
  let page
  let extensionURL
  let recorder

  beforeEach(async () => {
    ;({ browser, page, recorder, extensionURL } = await bootstrapWithStorage(
      'ba_transactions',
      baParams
    ))
  })

  afterEach(async () => {
    await recorder.stop()
    await browser.close()
  })

  it('Signs a message', async () => {
    await signMessage(page, extensionURL, browser, baParams.envSelectedAccount)
  })
})
