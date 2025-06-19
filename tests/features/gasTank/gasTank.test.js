import { bootstrapWithStorage } from '../../common-helpers/bootstrapWithStorage'
import { saParams, baParams } from '../../config/constants'
import { SELECTORS } from '../../common/selectors/selectors'
import { clickOnElement } from '../../common-helpers/clickOnElement'
import { MOCK_RESPONSE, CONFETTI_MODAL_WAIT_TIME } from './constants'
import { wait } from '../auth/functions'
import { mockPortfolioResponse } from './functions'

describe('Gas Tank tests with Smart Account', () => {
  let browser
  let page
  let recorder
  let serviceWorker

  beforeEach(async () => {
    ;({ browser, page, recorder, serviceWorker } = await bootstrapWithStorage(
      'gas_tank_sa',
      saParams
    ))
  })

  afterEach(async () => {
    await recorder.stop()
    await browser.close()
  })

  it('Should test Confetti modal on first cashback', async () => {
    const client = await serviceWorker.client

    try {
      await mockPortfolioResponse(client, MOCK_RESPONSE)

      await clickOnElement(page, SELECTORS.refreshButton)
      await wait(CONFETTI_MODAL_WAIT_TIME)

      await clickOnElement(page, SELECTORS.refreshButton)
      await clickOnElement(page, SELECTORS.bannerButtonOpen)
      await clickOnElement(page, SELECTORS.confettiModalActionButton, true, 500)
    } finally {
      // Disable Fetch after test to clean up
      await client
        .send('Fetch.disable')
        .catch((error) => console.warn('Fetch.disable failed:', error.message))
    }
  })

  it('Should check if all the data in the Gas Tank modal exists', async () => {
    await page.waitForSelector(SELECTORS.dashboardGasTankButton)

    // Click on 'Discover Gas Tank' button
    await clickOnElement(page, SELECTORS.dashboardGasTankButton)

    // Get all the divs in the modal, then returns only the number values of them
    const numberValues = await page.evaluate(() => {
      const numbers = Array.from(document.querySelectorAll('div[data-testid="bottom-sheet"] div'))
        .flatMap((el) => el.textContent.match(/-?\d+(\.\d+)?/g) || [])
        .map((num) => parseFloat(num))

      return Array.from(new Set(numbers))
    })

    // Check if the numbers are exact 3 (Balance, saved and cashback)
    expect(numberValues.length).toEqual(3)

    // Check if the numbers are equal or greater than 0
    numberValues.forEach((value) => {
      expect(value).toBeGreaterThanOrEqual(0)
    })
  })
})

describe('Gas Tank tests with Basic Account', () => {
  let browser
  let page
  let recorder

  beforeEach(async () => {
    ;({ browser, page, recorder } = await bootstrapWithStorage('gas_tank_ba', baParams))
  })

  afterEach(async () => {
    await recorder.stop()
    await browser.close()
  })

  it('Should check if all the data in the Gas Tank modal exists', async () => {
    await page.waitForSelector(SELECTORS.dashboardGasTankButton)

    // Click on 'Discover Gas Tank' button
    await clickOnElement(page, SELECTORS.dashboardGasTankButton)

    // Get all the divs in the modal, then returns only the number values of them
    const numberValues = await page.evaluate(() => {
      const numbers = Array.from(document.querySelectorAll('div[data-testid="bottom-sheet"] div'))
        .flatMap((el) => el.textContent.match(/-?\d+(\.\d+)?/g) || [])
        .map((num) => parseFloat(num))

      return Array.from(new Set(numbers))
    })

    // Check if the numbers are exact 3 (Balance, saved and cashback)
    expect(numberValues.length).toEqual(3)

    // Check if the numbers are equal or greater than 0
    numberValues.forEach((value) => {
      expect(value).toBeGreaterThanOrEqual(0)
    })
  })
})
