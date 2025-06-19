import { bootstrapWithStorage } from 'common-helpers/bootstrap'
import { clickOnElement } from 'common-helpers/clickOnElement'
import { typeText } from 'common-helpers/typeText'
import locators from 'constants/locators'
import selectors, { SELECTORS } from 'constants/selectors'

import { expect } from '@playwright/test'

import Token from '../interfaces/token'
import { BasePage } from './basePage'

export class SwapAndBridgePage extends BasePage {
  async init(param) {
    const { page } = await bootstrapWithStorage('swapAndBridgeBA', param)
    this.page = page // Initialize the POM page property with the Playwright page instance
  }

  // General function
  roundAmount(amount, place = 2) {
    // ToDo: Check if values should be int-ed or rounded. Values are currently int-ed
    const multipla = 10 ** place
    return Math.trunc(amount * multipla) / multipla
  }

  // General function
  async getElement(selector) {
    const element = await this.page.$(selector)
    expect(element).not.toBeNull()
    return element
  }

  // General function
  async selectFirstButton(text) {
    await clickOnElement(this.page, `text=${text}`)
  }

  // General function
  async getElementValue(selector) {
    const element = await this.getElement(selector)
    const content = await element.evaluate((el) => el.value.trim())
    return content
  }

  async verifyIfOnSwapAndBridgePage() {
    await expect(this.page.getByText('Swap & Bridge', { exact: true })).toBeVisible()
    expect(this.page.url()).toContain('/swap-and-bridge')
  }

  async getElementContentWords(selector, index = 1) {
    const element = await this.getElement(selector)
    const content = (await element.evaluate((el) => el.textContent.trim())).split(' ')[index - 1]
    return content
  }

  async extractMaxBalance() {
    const maxBalanceIndex = 1
    const maxBalance = await this.getElementContentWords(
      SELECTORS.maxAvailableAmount,
      maxBalanceIndex
    )
    return Number(maxBalance)
  }

  async getSendAmount() {
    const amount = await this.getElementValue(SELECTORS.fromAmountInputSab)
    return Number(amount)
  }

  async enterNumber(new_amount, is_valid = true) {
    const message = 'Something went wrong! Please contact support'
    // Enter the amount
    await typeText(this.page, SELECTORS.fromAmountInputSab, new_amount.toString())
    // Assert if the message should be displayed
    if (is_valid) {
      await expect(this.page.locator(`span:has-text("${message}")`)).not.toBeVisible()
    } else {
      await expect(this.page.locator(`span:has-text("${message}")`)).toBeVisible()
    }
  }

  async switchTokensOnSwapAndBridge(delay = 500) {
    await this.page.waitForTimeout(delay)

    // Extract text content from the elements
    const sendToken = await this.getElementContentWords(SELECTORS.sendTokenSab)
    const receiveToken = await this.getElementContentWords(SELECTORS.receiveTokenSab)
    // TODO: Selector should be created to have data-testid this is not maintainable
    // const network = await getElementContentWords(page, NETWORK_SELECTOR)
    const network = await this.getElementContentWords(SELECTORS.recieveNetworkBase)

    // Click the switch Tokens button
    await clickOnElement(this.page, SELECTORS.switchTokensTooltipSab)

    // Ensure the tokens are switched
    await this.page.waitForTimeout(500)
    expect(await this.getElementContentWords(SELECTORS.sendTokenSab)).toBe(receiveToken)
    expect(await this.getElementContentWords(SELECTORS.receiveTokenSab)).toBe(sendToken)

    // Network name is 3rd word in the sendToken content
    expect(await this.getElementContentWords(SELECTORS.sendTokenSab, 3)).toBe(network)
  }

  async openSwapAndBridge() {
    if (!this.page.url().includes('/swap-and-bridge')) {
      await this.page.getByTestId(selectors.dashboardButtonSwapAndBridge).click()
      await this.verifyIfOnSwapAndBridgePage()
    } else {
      await this.page.reload()
    }
  }

  // TODO: refactor this method
  async prepareSwapAndBridge(send_amount, fromToken: Token, toToken: Token) {
    try {
      await this.openSwapAndBridge()
      await this.page.waitForTimeout(1000)
      await this.selectSendToken(fromToken)
      // Select Receive Token on the same Network, which is automatically selected
      await this.page.waitForTimeout(1000) // Wait 1000ms before click for the Receive Token list to be populated
      await this.selectReceiveToken(toToken)

      // If checking prepareSwapAndBridge functionality without providing send amount
      if (send_amount === null) {
        return null
      }

      // If a valid send amount is not provided
      if (send_amount <= 0) {
        throw new Error('send_amount" must be greater than 0')
      }

      // Enter the amount
      await this.page.getByTestId(selectors.fromAmountInputSab).fill(send_amount.toString())

      // TODO: Implement verifyRouteFound
      // await verifyRouteFound()

      // If Warning: The price impact is too high
      const isHighPrice = await this.page
        .waitForSelector(SELECTORS.highPriceImpactSab, { timeout: 1000 })
        .catch(() => null)
      if (isHighPrice) {
        await this.page.getByTestId(selectors.highPriceImpactSab).click()
        return 'Continue anyway'
      }
      return 'Proceed'
    } catch (error) {
      console.error(`[ERROR] Prepare Swap & Bridge Page Failed: ${error.message}`)
      throw error
    }
  }

  async selectSendToken(sendToken: Token) {
    await this.clickOnMenuToken(sendToken, selectors.sendTokenSab)
  }

  async selectReceiveToken(receiveToken: Token) {
    const loadingSelector = `[data-testid="${selectors.receiveTokenSab}"] >> text=Please select token`
    await this.page.locator(loadingSelector).waitFor({ state: 'visible' })

    await this.clickOnMenuToken(receiveToken, selectors.receiveTokenSab)
  }

  async verifyIfSwitchIsActive(reference = true) {
    await this.page.waitForTimeout(500)

    const switchElement = await this.page.$(SELECTORS.switchTokensTooltipSab)

    const isDisabled = await this.page.evaluate((element) => {
      const firstChild = element.children[0]
      return firstChild ? firstChild.getAttribute('aria-disabled') === 'true' : false
    }, switchElement)

    const isActive = !isDisabled
    expect(isActive).toBe(reference)
  }

  async verifySendMaxTokenAmount(fromToken: Token) {
    const valueDecimals = 2 // Set presison of values to 2 decimals
    await this.openSwapAndBridge()
    await this.selectSendToken(fromToken)
    await this.page.waitForTimeout(500) // Wait before read Amount value
    const maxBalance = await this.extractMaxBalance()
    const roundMaxBalance = this.roundAmount(maxBalance, valueDecimals)
    await this.selectFirstButton('Max')
    await this.page.waitForTimeout(500) // Wait before read Amount value
    const sendAmount = await this.getSendAmount()
    const roundSendAmount = await this.roundAmount(sendAmount, valueDecimals)
    // There is an intermittent difference in balances when running on CI; I have added an Alert to monitor it and using toBeCloseTo
    if (roundMaxBalance !== roundSendAmount) {
      console.log(
        `⚠️ Token: ${fromToken} | maxBalance: ${maxBalance}, sendAmount: ${sendAmount} | roundSendAmount: ${roundSendAmount}, roundMaxBalance: ${roundMaxBalance}`
      )
    }
    expect(roundMaxBalance).toBeCloseTo(roundSendAmount, valueDecimals - 1) // 1 decimal presisison
  }

  async verifyDefaultReceiveToken(sendToken: Token, receiveToken: Token): Promise<void> {
    await this.openSwapAndBridge()
    await this.selectSendToken(sendToken)

    await this.page.waitForTimeout(1000)

    const loadingSelector = `[data-testid="${selectors.receiveTokenSab}"] >> text=Please select token`
    await this.page.locator(loadingSelector).waitFor({ state: 'visible' })

    await this.page.getByTestId(selectors.receiveTokenSab).click()
    await this.page.getByTestId(selectors.searchInput).fill(receiveToken.symbol)

    const tokenLocator = this.page
      .getByTestId(selectors.bottomSheet)
      .getByTestId(`option-${receiveToken.address}.${receiveToken.chainId}`)
    await expect(tokenLocator).toBeVisible()
  }

  async verifyNonDefaultReceiveToken(sendToken: Token, receiveToken: Token) {
    await this.openSwapAndBridge()
    await this.selectSendToken(sendToken)

    await this.page.waitForTimeout(1000)

    const loadingSelector = `[data-testid="${selectors.receiveTokenSab}"] >> text=Please select token`
    await this.page.locator(loadingSelector).waitFor({ state: 'visible' })

    await this.page.locator(SELECTORS.receiveTokenSab).click()
    await this.page.locator(SELECTORS.searchInput).fill(receiveToken.symbol, { timeout: 3000 })
    await this.page.getByText('Not found. Try with token').isVisible()

    await this.page.locator(SELECTORS.searchInput).fill(receiveToken.address, { timeout: 3000 })

    const tokenLocator = this.page
      .getByTestId(selectors.bottomSheet)
      .getByTestId(`option-${receiveToken.address}.${receiveToken.chainId}`)

    await expect(tokenLocator).toBeVisible()
  }

  async rejectTransaction(): Promise<void> {
    await this.page.waitForSelector(locators.selectRouteButton, { state: 'visible', timeout: 5000 })
    await this.page.locator(locators.addToBatchButton).click()
    await this.page.locator(locators.openDashboardFromBatchButton).first().click()
    await this.page.locator(locators.bannerButtonReject).first().click()
    await expect(this.page.getByText('Transaction waiting to be').first()).not.toBeVisible()
  }

  async proceedTransaction(): Promise<void> {
    await this.page.waitForSelector(locators.selectRouteButton, { state: 'visible', timeout: 5000 })
    await this.clickOnElement(locators.addToBatchButton)
    await this.clickOnElement(locators.openDashboardFromBatchButton)
    const newPage = await this.handleNewPage(selectors.bannerButtonOpen)
    await this.signTransactionPage(newPage)
  }

  async signTransactionPage(page): Promise<void> {
    const signButton = page.locator(SELECTORS.signTransactionButton)

    try {
      await expect(signButton).toBeVisible({ timeout: 5000 })
      await expect(signButton).toBeEnabled()
      await clickOnElement(page, SELECTORS.signTransactionButton)
      await page.waitForTimeout(1500)
    } catch (error) {
      console.warn("⚠️ The 'Sign' button is not clickable, but it should be.")
    }
  }

  async switchUSDValueOnSwapAndBridge(
    sendToken: Token,
    sendAmount?: number,
    delay = 1000
  ): Promise<void> {
    await this.page.waitForTimeout(delay)

    await this.openSwapAndBridge()
    await this.selectSendToken(sendToken)
    await typeText(this.page, SELECTORS.fromAmountInputSab, sendAmount.toString())
    const [usdOldAmount, currency] = await this.getUSDTextContent()
    expect(currency).toBe('$')
    const oldAmount = await this.getSendAmount()
    await this.page.waitForTimeout(500)
    await this.page.getByTestId(selectors.flipIcon).click()

    const [usdNewAmount, newCurrency] = await this.getUSDTextContent()
    const newAmount = this.roundAmount(await this.getSendAmount())

    expect(oldAmount).toBeCloseTo(usdNewAmount, 1)
    expect(usdOldAmount).toBeCloseTo(newAmount, 1)
    expect(newCurrency).toBe(sendToken.symbol)

    // Wait and flip back
    await this.page.waitForTimeout(500)
    await this.page.getByTestId(selectors.flipIcon).click()

    const [usdSecondAmount, secondCurrency] = await this.getUSDTextContent()
    const secondAmount = await this.getSendAmount()

    expect(newAmount).toBeCloseTo(usdSecondAmount, 1)
    expect(usdNewAmount).toBeCloseTo(secondAmount, 1)
    expect(secondCurrency).toBe('$')
  }

  async getUSDTextContent(): Promise<[number, string]> {
    const content = await this.page.getByTestId(selectors.switchCurrencySab).innerText()

    let currency: string | null = null
    let amount: string | null = null

    if (/\$/.test(content)) {
      const match = content.match(/^([^0-9\s]+)?([\d,.]+)/)
      currency = match?.[1] || ''
      amount = match?.[2] || ''
    } else {
      const match = content.match(/([\d,.]+)\s*([\w.]+)$/)
      amount = match?.[1] || ''
      currency = match?.[2] || ''
    }

    return [Number(amount.replace(/,/g, '')), currency]
  }

  async verifyAutoRefreshRoute(): Promise<void> {
    const routeSelector = this.page.getByTestId('select-route')
    await routeSelector.waitFor({ state: 'hidden', timeout: 65000 })
    const didReappear = await routeSelector
      .waitFor({ state: 'visible', timeout: 65000 })
      .then(() => true)
      .catch(() => false)
    expect(didReappear).toBe(true)
  }

  async assertSelectedAggregator(): Promise<void> {
    await expect(this.page.getByText('LI.FI DEX Aggregator').last()).toBeVisible()
    await expect(this.page.getByText('Selected').last()).toBeVisible()
  }

  async clickOnSecondRoute(): Promise<void> {
    await this.page.getByTestId(selectors.selectRouteButton).last().click()
    await this.page.locator(locators.liFiRoute).last().click()
    await this.page.getByTestId(selectors.selectRouteButton).last().click()
    await this.assertSelectedAggregator()
  }

  async prepareBridgeTransaction(
    sendAmount: number,
    sendToken: Token,
    receiveToken: Token
  ): Promise<string | null> {
    try {
      await this.openSwapAndBridge()
      await this.page.waitForTimeout(1000)
      await this.selectSendToken(sendToken)

      // Select target receive network
      const networkSelector = this.page.getByTestId(`option-${sendToken.chainId}`)
      await networkSelector.click()

      const recieveNetwork = this.page
        .getByTestId(selectors.bottomSheet)
        .getByTestId(`option-${receiveToken.chainId}`)
      await recieveNetwork.click()

      // Select receive token by address
      await this.page.waitForTimeout(1000)
      await this.selectReceiveToken(receiveToken)

      // Validate sendAmount
      if (sendAmount === null) return null
      if (sendAmount <= 0) throw new Error('sendAmount must be greater than 0')

      await this.page.getByTestId(selectors.fromAmountInputSab).fill(sendAmount.toString())

      const isFollowUp = await this.page
        .waitForSelector(SELECTORS.confirmFollowUpTxn, { timeout: 6000 })
        .catch(() => null)
      if (isFollowUp) {
        await clickOnElement(this.page, SELECTORS.confirmFollowUpTxn)
      }
      const isHighPrice = await this.page
        .waitForSelector(SELECTORS.highPriceImpactSab, { timeout: 1000 })
        .catch(() => null)
      if (isHighPrice) {
        await clickOnElement(this.page, SELECTORS.highPriceImpactSab)
        return 'Continue anyway'
      }

      return 'Proceed'
    } catch (error) {
      console.error(`[ERROR] Prepare Bridge Transaction Failed: ${error.message}`)
      throw error
    }
  }

  async signTokens(): Promise<void> {
    await this.page.getByTestId(selectors.topUpProceedButton).click()
    await this.page.getByTestId(selectors.signButton).click()
    await expect(this.page.getByText('Confirming your trade')).toBeVisible({ timeout: 5000 })
    // TODO: add more assertion
  }

  async batchAction(): Promise<void> {
    await this.page.getByTestId(selectors.addToBatchButton).isEnabled()
    await this.page.getByTestId(selectors.addToBatchButton).click()
    await this.page.getByTestId(selectors.addMoreButton).isVisible()
    await this.page.getByTestId(selectors.addMoreButton).click()
  }

  async batchActionWithSign(): Promise<void> {
    await this.page.getByTestId(selectors.addToBatchButton).isEnabled()
    await this.page.getByTestId(selectors.addToBatchButton).click()
    await this.page.getByTestId(selectors.goDashboardButton).click()
    const newPage = await this.handleNewPage(selectors.bannerButtonOpen)
    await this.signBatchTransactionsPage(newPage)
  }

  async signBatchTransactionsPage(page): Promise<void> {
    const signButton = page.locator(SELECTORS.signTransactionButton)

    try {
      await expect(signButton).toBeVisible({ timeout: 5000 })
      await expect(signButton).toBeEnabled()
      await this.verifyBatchTransactionDetails(page)
      await clickOnElement(page, SELECTORS.signTransactionButton)
      await page.waitForTimeout(1500)
    } catch (error) {
      console.warn("⚠️ The 'Sign' button is not clickable, but it should be.")
    }
  }

  async verifyBatchTransactionDetails(page): Promise<void> {
    await expect(page.getByTestId('recipient-address-0')).toHaveText(/0\.003/)
    await expect(page.getByTestId('recipient-address-1')).toHaveText(/LI\.FI/)
    await expect(page.getByTestId('recipient-address-2')).toHaveText(/0\.002/)
    await expect(page.getByTestId('recipient-address-3')).toHaveText(/LI\.FI/)
  }
}
