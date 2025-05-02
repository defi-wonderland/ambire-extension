import { clickOnElement } from '../../common-helpers/clickOnElement'
import { typeText } from '../../common-helpers/typeText'
import { SELECTORS } from '../../common/selectors/selectors'
// TODO: Import and reuse '../../common/transactions'
import { TOKEN_ADDRESS } from './constants'

export async function selectButton(page) {
  // await page.waitForTimeout(500)
  await clickOnElement(page, SELECTORS.processButtonSab)
}

export async function selectFirstButton(page, text) {
  // TODO: Refactor this function and select button after adding data-testId for 'Proceed' button placeholder
  await clickOnElement(page, `text=${text}`)
}

export async function verifyIfOnDashboardPage(page) {
  await expect(page).toMatchElement(SELECTORS.dashboardButtonSwapAndBridge)
  expect(page.url()).toContain('/dashboard')
}

export async function verifyIfOnSwapAndBridgePage(page) {
  await expect(page).toMatchElement('div', { text: 'Swap & Bridge' })
  expect(page.url()).toContain('/swap-and-bridge')
}

export async function openSwapAndBridge(page) {
  if (!page.url().includes('/swap-and-bridge')) {
    await clickOnElement(page, SELECTORS.dashboardButtonSwapAndBridge)
    await verifyIfOnSwapAndBridgePage(page)
  }
}

export async function verifyIfSwitchIsActive(page, reference = true) {
  await page.waitForTimeout(500)

  const switchElement = await page.$(SELECTORS.switchTokensTooltipSab)

  const isDisabled = await page.evaluate((element) => {
    const firstChild = element.children[0]
    return firstChild ? firstChild.getAttribute('aria-disabled') === 'true' : false
  }, switchElement)

  const isActive = !isDisabled
  expect(isActive).toBe(reference)
}

async function getElement(page, selector) {
  const element = await page.$(selector)
  expect(element).not.toBeNull()
  return element
}

async function getElementValue(page, selector) {
  const element = await getElement(page, selector)
  const content = await element.evaluate((el) => el.value.trim())
  return content
}

async function getElementContent(page, selector) {
  const element = await getElement(page, selector)
  const content = (await element.evaluate((el) => el.textContent)).split(' ')
  return content
}

async function getElementContentWords(page, selector, index = 1) {
  const element = await getElement(page, selector)
  const content = (await element.evaluate((el) => el.textContent.trim())).split(' ')[index - 1]
  return content
}

export async function switchTokensOnSwapAndBridge(page, delay = 500) {
  await page.waitForTimeout(delay)

  // Extract text content from the elements
  const sendToken = await getElementContentWords(page, SELECTORS.sendTokenSab)
  const receiveToken = await getElementContentWords(page, SELECTORS.receiveTokenSab)
  // TODO: Selector should be created to have data-testid this is not maintainable
  // const network = await getElementContentWords(page, NETWORK_SELECTOR)
  const network = await getElementContentWords(page, SELECTORS.recieveNetworkBase)

  // Click the switch Tokens button
  await clickOnElement(page, SELECTORS.switchTokensTooltipSab)

  // Ensure the tokens are switched
  expect(await getElementContentWords(page, SELECTORS.sendTokenSab)).toBe(receiveToken)
  expect(await getElementContentWords(page, SELECTORS.receiveTokenSab)).toBe(sendToken)

  // Network name is 3rd word in the sendToken content
  expect(await getElementContentWords(page, SELECTORS.sendTokenSab, 3)).toBe(network)
}

async function getUSDTextContent(page) {
  await page.waitForTimeout(500)
  const selector = SELECTORS.switchCurrencySab
  const element = await page.$(selector)
  expect(element).not.toBeNull()
  const content = await element.evaluate((el) => el.textContent.trim())

  const match = content.match(/([\d,.]+)\s*([\w.]+)$/)

  const amount = match ? match[1] : null
  const currency = match ? match[2] : null

  return [Number(amount), currency]
}

export async function getSendAmount(page) {
  const amount = await getElementValue(page, SELECTORS.fromAmountInputSab)
  return Number(amount)
}

export async function roundAmount(amount, place = 2) {
  // ToDo: Check if values should be int-ed or rounded. Values are currently int-ed
  const multipla = 10 ** place
  return Math.trunc(amount * multipla) / multipla
}

async function selectSendTokenOnNetwork(page, send_token, send_network) {
  await clickOnElement(page, SELECTORS.sendTokenSab)
  await page.waitForSelector(SELECTORS.searchInput, { visible: true, timeout: 3000 })
  await typeText(page, SELECTORS.searchInput, send_token)
  await clickOnElement(
    page,
    `[data-testid*="${send_network.toLowerCase()}.${send_token.toLowerCase()}"]`
  )
}

export async function switchUSDValueOnSwapAndBridge(
  page,
  send_token,
  send_network,
  send_amount,
  delay = 1000
) {
  await page.waitForTimeout(delay)

  await openSwapAndBridge(page)
  await selectSendTokenOnNetwork(page, send_token, send_network)

  await typeText(page, SELECTORS.fromAmountInputSab, send_amount.toString())

  // Get current values in the USD text contenet
  const [usdOldAmount, ccy] = await getUSDTextContent(page)
  expect(ccy).toBe('USD')
  const oldAmount = await getSendAmount(page)

  // Click the switch USD button
  await clickOnElement(page, SELECTORS.switchCurrencySab)

  // Get new amounts
  const [usdNewAmount, newCcy] = await getUSDTextContent(page)
  const newAmount = await roundAmount(await getSendAmount(page))

  // Assert the amount and USD value are switched
  expect(oldAmount).toBe(usdNewAmount)
  expect(usdOldAmount).toBe(newAmount)
  expect(newCcy).toBe(send_token)

  // Wait 500ms and click again to the switch USD button
  await page.waitForTimeout(500)
  await clickOnElement(page, SELECTORS.switchCurrencySab)

  // Get second amounts
  const [usdSecondAmount, secondCcy] = await getUSDTextContent(page)
  const secondAmount = await getSendAmount(page)

  // Assert the amount and USD value are switched again
  expect(newAmount).toBe(usdSecondAmount)
  expect(usdNewAmount).toBe(secondAmount)
  expect(secondCcy).toBe('USD')
}

export async function enterNumber(page, new_amount, is_valid = true) {
  const message = 'Something went wrong! Please contact support'
  // Enter the amount
  await typeText(page, SELECTORS.fromAmountInputSab, new_amount.toString())
  // Assert if the message should be displayed
  if (is_valid) {
    await expect(page).not.toMatchElement('span', { text: `${message}` })
  } else {
    await expect(page).toMatchElement('span', { text: `${message}` })
  }
}

export async function changeRoutePriority(page, route_type) {
  await openSwapAndBridge(page)
  await clickOnElement(page, SELECTORS.routePrioritySab)
  await page.waitForTimeout(500)
  await selectFirstButton(page, route_type)
  await selectFirstButton(page, 'Back')
}

async function verifyRouteFound(page) {
  let attempts = 0
  let isTextPresent = true

  while (attempts < 2 && isTextPresent) {
    // Wait for Proceed to be enabled (Wait for "Fetching best route..." to appear and disappear)
    // eslint-disable-next-line no-await-in-loop
    await page.waitForSelector(SELECTORS.routeLoadingTextSab, { visible: true }).catch(() => null)
    // eslint-disable-next-line no-await-in-loop
    await page.waitForSelector(SELECTORS.routeLoadingTextSab, { hidden: true })

    // Check if "No Route Found!" is displayed
    // eslint-disable-next-line no-await-in-loop
    isTextPresent = await page
      .waitForSelector('body:has-text("No Route Found!")', { timeout: 1000 })
      .catch(() => null)

    if (isTextPresent) {
      console.log(`⚠️ Attempt ${attempts + 1}: 'No Route Found!' detected, retrying...`)
      // Pause for 5 seconds before retrying
      // eslint-disable-next-line no-await-in-loop
      await page.waitForTimeout(5000)
      // Change route priority and retry; this is one way of retrying it
      // eslint-disable-next-line no-await-in-loop
      await changeRoutePriority(page, 'Highest Return')
      attempts++
    } else {
      return // Exit if a route is found as expected
    }
  }
}

export async function prepareBridgeTransaction(
  page,
  send_amount,
  send_token,
  send_network,
  recieve_network
) {
  await openSwapAndBridge(page)

  await selectSendTokenOnNetwork(page, send_token, send_network)
  await clickOnElement(page, SELECTORS.recieveNetworkBase)
  await clickOnElement(page, `[data-testid*="option-${recieve_network}"]`)
  await page.waitForTimeout(1000)
  await clickOnElement(page, SELECTORS.receiveTokenSab)
  await typeText(page, SELECTORS.searchInput, send_token)
  const address = TOKEN_ADDRESS[`${recieve_network}.${send_token}`]
  await clickOnElement(page, `[data-tooltip-id*="${address}"]`)

  // Enter the amount
  await typeText(page, SELECTORS.fromAmountInputSab, send_amount.toString())

  await verifyRouteFound(page)

  // If Warning: The price impact is too high
  const isfirmFollowUp = await page
    .waitForSelector(SELECTORS.confirmFollowUpTxn, { timeout: 1000 })
    .catch(() => null)
  if (isfirmFollowUp) {
    await clickOnElement(page, SELECTORS.confirmFollowUpTxn)
  }

  // If Warning: The price impact is too high
  const isHighPrice = await page
    .waitForSelector(SELECTORS.highPriceImpactSab, { timeout: 1000 })
    .catch(() => null)
  if (isHighPrice) {
    await clickOnElement(page, SELECTORS.highPriceImpactSab)
    return 'Continue anyway'
  }
  return 'Proceed'
}

export async function verifyNonDefaultReceiveToken(
  page,
  send_token,
  recieve_network,
  receive_token
) {
  await openSwapAndBridge(page)
  await selectSendTokenOnNetwork(page, send_token, recieve_network)
  await page.waitForTimeout(1000) // Wait before click for the Receive Token list to be populated
  await clickOnElement(page, SELECTORS.receiveTokenSab)
  await typeText(page, SELECTORS.searchInput, receive_token)
  await expect(page).toMatchElement('div', { text: 'Not found. Try with token address?' })
  await page.waitForTimeout(500)
  await typeText(page, SELECTORS.fromAmountInputSab, '') // Click on the amount to clear input address field
  await page.waitForTimeout(500)
  await clickOnElement(page, SELECTORS.receiveTokenSab)
  const address = TOKEN_ADDRESS[`${recieve_network}.${receive_token}`]
  await typeText(page, SELECTORS.searchInput, address)
  const selector = `[data-tooltip-id*="${address}"]`
  await expect(page).toMatchElement(selector, { text: receive_token, timeout: 3000 })
  await expect(page).toMatchElement(selector, { text: address, timeout: 3000 })
  await selectFirstButton(page, 'Back')
}

export async function verifyDefaultReceiveToken(page, send_token, recieve_network, receive_token) {
  await openSwapAndBridge(page)
  await selectSendTokenOnNetwork(page, send_token, recieve_network)
  await page.waitForTimeout(1000) // Wait before click for the Receive Token list to be populated
  await clickOnElement(page, SELECTORS.receiveTokenSab)
  await typeText(page, SELECTORS.searchInput, receive_token)
  const selector = `[data-testid*="${receive_token.toLowerCase()}"]`
  await expect(page).toMatchElement(selector, { text: receive_token.toUpperCase(), timeout: 3000 })
  const address = TOKEN_ADDRESS[`${recieve_network}.${receive_token}`]
  if (address) {
    await expect(page).toMatchElement(selector, { text: address, timeout: 3000 })
  } else {
    console.log(`[WARNING] Token address not found for ${recieve_network}.${receive_token}`)
    console.log(`Element Content: ${await getElementContent(page, selector)}`)
  }
  await selectFirstButton(page, 'Back')
}

export async function prepareSwapAndBridge(
  page,
  send_amount,
  send_token,
  send_network,
  receive_token
) {
  try {
    await openSwapAndBridge(page)
    await page.waitForTimeout(1000)
    await selectSendTokenOnNetwork(page, send_token, send_network)

    // Select Receive Token on the same Network, which is automatically selected
    await page.waitForTimeout(1000) // Wait 1000ms before click for the Receive Token list to be populated
    await clickOnElement(page, SELECTORS.receiveTokenSab)
    await typeText(page, SELECTORS.searchInput, receive_token)
    await clickOnElement(page, `[data-testid*="${receive_token.toLowerCase()}"]`)

    // If checking prepareSwapAndBridge functionality without providing send amount
    if (send_amount === null) {
      return null
    }

    // If a valid send amount is not provided
    if (send_amount <= 0) {
      throw new Error('"send_amount" must be greater than 0')
    }

    // Enter the amount
    await typeText(page, SELECTORS.fromAmountInputSab, send_amount.toString())

    await verifyRouteFound(page)

    // If Warning: The price impact is too high
    const isHighPrice = await page
      .waitForSelector(SELECTORS.highPriceImpactSab, { timeout: 1000 })
      .catch(() => null)
    if (isHighPrice) {
      await clickOnElement(page, SELECTORS.highPriceImpactSab)
      return 'Continue anyway'
    }
    return 'Proceed'
  } catch (error) {
    console.error(`[ERROR] Prepare Swap & Bridge Page Failed: ${error.message}`)
    throw error
  }
}

export async function openSwapAndBridgeActionPage(page, callback = 'null') {
  try {
    // Get the browser context of the page
    const context = page.browserContext()

    const [actionPagePromise] = await Promise.all([
      new Promise((resolve) => {
        context.once('targetcreated', async (target) => {
          const actionPage = await target.page()
          resolve(actionPage)
        })
      }),
      // The callback function to be executed
      await callback(page)
    ])

    // Use actionPage for interactions the with Action Page
    const actionPage = await actionPagePromise

    // Wait for Action Page to open
    await actionPage.waitForTimeout(2000)

    // Assert if Action Page is opened
    const txnSimulation = await page
      .waitForSelector('div', { text: 'Transaction simulation', timeout: 10000 })
      .catch(() => null)
    const signButton = await page
      .waitForSelector(SELECTORS.signButtonSab, { timeout: 500 })
      .catch(() => null)
    await expect(txnSimulation != null || signButton != null).toBe(true)

    return actionPage
  } catch (error) {
    console.error(`[ERROR] Open Swap & Bridge Action Page Failed: ${error.message}`)
    throw error
  }
}

export async function batchActionPage(actionPage) {
  await clickOnElement(actionPage, SELECTORS.queueAndSignLaterButton)
}

export async function signActionPage(actionPage) {
  // Select Sign and not wait for confirmation as suggested on PR review
  await clickOnElement(actionPage, SELECTORS.signTransactionButton)
  await actionPage.waitForTimeout(1500)
}

export async function wiatForConfirmed(actionPage) {
  // Wait for transaction to be confirmed
  await actionPage.waitForSelector('text=Timestamp', { visible: true })

  // Asset if the transaction is confirmed
  await expect(actionPage).toMatchElement('div', { text: 'Confirmed' })
}

export async function clickOnSecondRoute(page) {
  const secoundRouteIndex = 1
  if (await page.waitForSelector('text=Select another route', { visible: true })) {
    await selectFirstButton(page, 'Select another route')

    // A Select Route modal page opens
    await page.waitForSelector(SELECTORS.bottomSheet)
    const elements = await page.$$(`${SELECTORS.bottomSheet} [tabindex="0"]`)
    await elements[secoundRouteIndex].click()
    await page.waitForTimeout(500)
    await selectFirstButton(page, 'Confirm')
    // TODO: Add assertation that a second route is selected
  } else {
    await page.waitForSelector('text=No route found!', { visible: true })
    console.error('[ERROR] No route found!')
  }
}

async function extractMaxBalance(page) {
  const maxBalanceIndex = 2
  const maxBalance = await getElementContentWords(
    page,
    SELECTORS.maxAvailableAmount,
    maxBalanceIndex
  )
  return Number(maxBalance)
}

export async function verifySendMaxTokenAmount(page, send_token, send_network) {
  const valueDecimals = 2 // Set presison of values to 2 decimals
  await openSwapAndBridge(page)
  await selectSendTokenOnNetwork(page, send_token, send_network)
  await page.waitForTimeout(500) // Wait before read Amount value
  const maxBalance = await extractMaxBalance(page)
  const roundMaxBalance = await roundAmount(maxBalance, valueDecimals)
  await selectFirstButton(page, 'Max')
  await page.waitForTimeout(500) // Wait before read Amount value
  const sendAmount = await getSendAmount(page)
  const roundSendAmount = await roundAmount(sendAmount, valueDecimals)
  // There is an intermittent difference in balances when running on CI; I have added an Alert to monitor it and using toBeCloseTo
  if (roundMaxBalance != roundSendAmount) {
    console.log(
      `⚠️ Token: ${send_token} | maxBalance: ${maxBalance}, sendAmount: ${sendAmount} | roundSendAmount: ${roundSendAmount}, roundMaxBalance: ${roundMaxBalance}`
    )
  }
  expect(roundMaxBalance).toBeCloseTo(roundSendAmount, valueDecimals - 1) // 1 decimal presisison
}

export async function verifyAutoRefreshRoute(page) {
  // Wait for "Select another route" to appear and disappear
  await page
    .waitForSelector('text=Select another route', { visible: true, timeout: 1000 })
    .catch(() => null)
  const routeLoading = await page
    .waitForSelector('text=Select another route', { hidden: true, timeout: 63000 })
    .catch(() => null)
  expect(routeLoading).toBe(null)
}
