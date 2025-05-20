import { bootstrapWithStorage } from '../../common-helpers/bootstrapWithStorage'
import { saParams, baParams } from '../../config/constants'
import { SELECTORS } from '../../common/selectors/selectors'
import { buildFeeTokenSelector } from '../signAccountOp/functions'
import { USDC_TOKEN_SELECTOR, ETH_TOKEN_SELECTOR } from '../signAccountOp/constants'
import {
  makeValidTransaction,
  checkTokenBalanceClickOnGivenActionInDashboard
} from '../../common/transactions'
import { clickOnElement } from '../../common-helpers/clickOnElement'
import { MOCK_RESPONSE, GAS_TANK_TOP_UP_AMOUNT, CONFETTI_MODAL_WAIT_TIME } from './constants'
import { wait } from '../auth/functions'
import { mockPortfolioResponse } from './functions'

describe('Gas Tank tests with Smart Account', () => {
  let browser
  let page
  let extensionURL
  let recorder
  let serviceWorker

  const feeTokenWithGasTankSelector = buildFeeTokenSelector(
    saParams.envSelectedAccount,
    USDC_TOKEN_SELECTOR,
    true
  )

  beforeEach(async () => {
    ;({ browser, page, recorder, extensionURL, serviceWorker } = await bootstrapWithStorage(
      'gas_tank_sa',
      saParams
    ))
  })

  afterEach(async () => {
    await recorder.stop()
    await browser.close()
  })

  it('Should top up Gas Tank with 0.000001 ETH on Base and pay with Gas Tank', async () => {
    await checkTokenBalanceClickOnGivenActionInDashboard(
      page,
      SELECTORS.nativeTokenBaseDashboard,
      SELECTORS.topUpButton
    )

    await makeValidTransaction(page, extensionURL, browser, {
      tokenAmount: GAS_TANK_TOP_UP_AMOUNT,
      feeToken: feeTokenWithGasTankSelector,
      shouldTopUpGasTank: true
    })
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
  let extensionURL
  const feeTokenSelector = buildFeeTokenSelector(
    baParams.envSelectedAccount,
    ETH_TOKEN_SELECTOR,
    false
  )

  beforeEach(async () => {
    ;({ browser, page, recorder, extensionURL } = await bootstrapWithStorage(
      'gas_tank_ba',
      baParams
    ))
  })

  afterEach(async () => {
    await recorder.stop()
    await browser.close()
  })

  it('Should top up Gas Tank with 0.000001 ETH on Base', async () => {
    await checkTokenBalanceClickOnGivenActionInDashboard(
      page,
      SELECTORS.nativeTokenBaseDashboard,
      SELECTORS.topUpButton
    )

    await makeValidTransaction(page, extensionURL, browser, {
      tokenAmount: GAS_TANK_TOP_UP_AMOUNT,
      feeToken: feeTokenSelector,
      shouldTopUpGasTank: true,
      // Temporarily disable the check for the sign button because the Base network still doesn't support EIP 7702
      shouldStopBeforeSign: true
    })
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
