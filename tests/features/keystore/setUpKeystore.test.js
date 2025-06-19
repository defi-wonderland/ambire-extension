import { bootstrapWithStorage } from '../../common-helpers/bootstrapWithStorage'
import { saParams } from '../../config/constants'

import { setUpKeystore } from './functions'

describe('setUpKeystore', () => {
  let browser
  let page
  let extensionURL
  let recorder

  beforeEach(async () => {
    ;({ browser, page, recorder, extensionURL } = await bootstrapWithStorage(
      'setUpKeystore',
      saParams,
      true
    ))
  })

  afterEach(async () => {
    await recorder.stop()
    await browser.close()
  })

  it.skip('should set up keystore', async () => {
    await setUpKeystore(page, extensionURL)
  })
})
