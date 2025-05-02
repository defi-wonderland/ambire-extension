/* eslint-disable no-await-in-loop */
import { baParams, saParams } from '../../config/constants'
import { bootstrapWithStorage } from '../../common-helpers/bootstrapWithStorage'

import {
  selectButton,
  openSwapAndBridge,
  enterNumber,
  prepareSwapAndBridge,
  openSwapAndBridgeActionPage,
  batchActionPage,
  signActionPage,
  verifyIfSwitchIsActive,
  switchTokensOnSwapAndBridge,
  switchUSDValueOnSwapAndBridge,
  prepareBridgeTransaction,
  clickOnSecondRoute,
  changeRoutePriority,
  verifySendMaxTokenAmount,
  verifyNonDefaultReceiveToken,
  verifyDefaultReceiveToken,
  verifyAutoRefreshRoute,
  selectFirstButton
} from './functions'

describe('Swap & Bridge transactions with a Basic Account', () => {
  let browser
  let page
  let recorder

  beforeEach(async () => {
    ;({ browser, page, recorder } = await bootstrapWithStorage('swapAndBridgeBA', baParams))
  })

  afterEach(async () => {
    await recorder.stop()
    await browser.close()
  })

  afterAll(async () => {})

  it('should Swap ERC20 tokens USDC to WALLET on Base network with a Basic Account', async () => {
    const text = await prepareSwapAndBridge(page, 0.009, 'USDC', '8453', 'WALLET')
    await signActionPage(
      await openSwapAndBridgeActionPage(page, (callback_page) => selectButton(callback_page, text))
    )
  })
})

describe('Swap & Bridge transactions with a Smart Account', () => {
  let browser
  let page
  let recorder

  beforeEach(async () => {
    ;({ browser, page, recorder } = await bootstrapWithStorage('swapAndBridgeSA', saParams))
  })

  afterEach(async () => {
    await recorder.stop()
    await browser.close()
  })

  afterAll(async () => {})

  it('should batch Swap of ERC20 tokens and Native to ERC20 token with a Smart Account', async () => {
    let text = await prepareSwapAndBridge(page, 0.003, 'WALLET', '8453', 'USDC')
    let actionPage = await openSwapAndBridgeActionPage(page, (callback_page) =>
      selectButton(callback_page, text)
    )
    await batchActionPage(actionPage)
    text = await prepareSwapAndBridge(page, 0.002, 'USDC', '8453', 'ETH')
    actionPage = await openSwapAndBridgeActionPage(page, (callback_page) =>
      selectButton(callback_page, text)
    )
    await signActionPage(actionPage)

    // ToDo: redo reverese the above batch to recover tokens balances considering a changes of new release
    // actionPage.close() // To be able to run the reverse below
    // const reverseAmount1 = 0.000324
    // const reverseAmount2 = 0.000010453

    // text = await prepareSwapAndBridge(page, reverseAmount1, 'USDC', '8453', 'WALLET')
    // actionPage = await openSwapAndBridgeActionPage(page, (callback_page) =>
    //   selectButton(callback_page, text)
    // )
    // await batchActionPage(actionPage)
    // text = await prepareSwapAndBridge(page, reverseAmount2, 'ETH', '8453', 'USDC')
    // actionPage = await openSwapAndBridgeActionPage(page, (callback_page) =>
    //   selectButton(callback_page, text)
    // )
    // await signActionPage(actionPage)
  })

  it('should accept amount starting with zeros like "00.01" with during Swap & Bridge with a Smart Account', async () => {
    await prepareSwapAndBridge(page, 0.1, 'DAI', '10', 'USDC.E')
    await enterNumber(page, '00.01', true)
  })

  it('should accept amount starting with point like ".01" during Swap & Bridge with a Smart Account', async () => {
    await prepareSwapAndBridge(page, 0.1, 'DAI', '10', 'USDC.E')
    await enterNumber(page, '.01', true)
  })

  it('should not accept chars as amount during Swap & Bridge with a Smart Account', async () => {
    await prepareSwapAndBridge(page, 0.1, 'DAI', '10', 'USDC.E')
    await enterNumber(page, 'abc', true)
  })

  it('should Bridge tokens with a Smart Account', async () => {
    const text = await prepareBridgeTransaction(page, '0.063', 'USDC', '8453', '10')
    await signActionPage(
      await openSwapAndBridgeActionPage(page, (callback_page) => selectButton(callback_page, text))
    )
  })

  it('should "proceed" Swap & Bridge from the Pending Route component with a Smart Account', async () => {
    const text = await prepareSwapAndBridge(page, 0.1, 'USDC.E', '10', 'DAI')
    let actionPage = await openSwapAndBridgeActionPage(page, (callback_page) =>
      selectButton(callback_page, text)
    )
    actionPage.close()
    await expect(page).toMatchElement('div', { text: 'Pending Route', timeout: 3000 })
    actionPage = await openSwapAndBridgeActionPage(page, (callback_page) =>
      selectFirstButton(callback_page, 'Proceed')
    )
    actionPage.close()
    await expect(page).toMatchElement('div', { text: 'Pending Route', timeout: 3000 })
  })

  it('should "reject" (ie cancel) Swap & Bridge from the Pending Route component with a Smart Account', async () => {
    const text = await prepareSwapAndBridge(page, 0.008, 'USDC', '8453', 'WALLET')
    const actionPage = await openSwapAndBridgeActionPage(page, (callback_page) =>
      selectButton(callback_page, text)
    )
    actionPage.close()
    await expect(page).toMatchElement('div', { text: 'Pending Route', timeout: 1000 })
    await selectFirstButton(page, 'Cancel')
    await expect(page).not.toMatchElement('div', { text: 'Pending Route', timeout: 1000 })
  })

  it('should select a different route when Swap & Bridge with a Smart Account', async () => {
    await prepareSwapAndBridge(page, 0.009, 'USDC', '8453', 'WALLET')
    await clickOnSecondRoute(page)
  })

  it('should auto-refresh active route on 60s during Swap & Bridge with a Smart Account', async () => {
    await prepareSwapAndBridge(page, 0.009, 'USDC', '8453', 'WALLET')
    await verifyAutoRefreshRoute(page)
  })

  it('should switch tokens during Swap & Bridge with a Smart Account', async () => {
    await openSwapAndBridge(page)
    await verifyIfSwitchIsActive(page, false)
    await prepareSwapAndBridge(page, null, 'USDC', '8453', 'WALLET')
    await verifyIfSwitchIsActive(page, true)
    await switchTokensOnSwapAndBridge(page)
  })

  it('should do MAX token "From" amount during Swap & Bridge with a Smart Account', async () => {
    await verifySendMaxTokenAmount(page, 'DAI', '10')
    await verifySendMaxTokenAmount(page, 'USDC', '8453')
    // POL: await verifySendMaxTokenAmount(page, 'POL', 'polygon')
  })

  it('should switch from token amount to USD value and vise-versa during Swap & Bridge with a Smart Account', async () => {
    await switchUSDValueOnSwapAndBridge(page, 'USDC.E', '10', 0.34)
    await switchUSDValueOnSwapAndBridge(page, 'DAI', '10', 0.02)
    await switchUSDValueOnSwapAndBridge(page, 'USDC', '8453', 0.012)
    await switchUSDValueOnSwapAndBridge(page, 'xWALLET', '1', 1)
    await switchUSDValueOnSwapAndBridge(page, 'DAI', '10', 0.51)
    await switchUSDValueOnSwapAndBridge(page, 'xWALLET', '1', 0.9)
  })

  it('should import a token by address that is NOT in the default "Receive" list during Swap & Bridge with a Smart Account', async () => {
    await verifyNonDefaultReceiveToken(page, 'ETH', '1', 'wCRES')
    // POL: await verifyNonDefaultReceiveToken(page, 'POL', 'polygon', 'AMUSDC')
  })

  it('should find token that already exists within the "Receive" list during Swap & Bridge with a Smart Account', async () => {
    await verifyDefaultReceiveToken(page, 'USDC', '8453', 'WALLET')
    await verifyDefaultReceiveToken(page, 'WALLET', '8453', 'USDC')
    // await verifyDefaultReceiveToken(page, 'ETH', '10', 'DAI')
  })

  it('should be able to change route priority from highest return to fastest transfer and vise-versa during Swap & Bridge with a Smart Account', async () => {
    // Use Fastest Transfer route
    await changeRoutePriority(page, 'Fastest Transfer')
    let text = await prepareSwapAndBridge(page, 0.1, 'DAI', '10', 'USDC.E')
    let actionPage = await openSwapAndBridgeActionPage(page, (callback_page) =>
      selectButton(callback_page, text)
    )
    await selectFirstButton(actionPage, 'Reject')
    await selectFirstButton(page, 'Back')

    // Use Highest Return route
    await changeRoutePriority(page, 'Highest Return')
    text = await prepareSwapAndBridge(page, 0.1, 'DAI', '10', 'USDC.E')
    actionPage = await openSwapAndBridgeActionPage(page, (callback_page) =>
      selectButton(callback_page, text)
    )
    await selectFirstButton(actionPage, 'Reject')
    await selectFirstButton(page, 'Back')
  })
})
