import { clickOnElement } from '../../common-helpers/clickOnElement'
import { typeText } from '../../common-helpers/typeText'
import { SELECTORS } from '../../common/selectors/selectors'
import {
  URL_SETTINGS_PAGE,
  URL_SETTINGS_GENERAL,
  URL_DEVICE_PASSWORD_CHANGE,
  NEW_KEYSTORE_PASSWORD,
  MANUAL_ADD_BTN,
  GREEN_MSG_NETWORK_ADDED,
  GREEN_MSG_NETWORK_SAVED,
  AMBIRE_SMART_ACCOUNTS_MSG,
  NETWORKS_LIST
} from './constants'
import { DEF_KEYSTORE_PASS } from '../../config/constants'
import { typeKeystorePassAndUnlock } from '../../common-helpers/typeKeystorePassAndUnlock'
import { timeout } from 'rxjs'

// TODO: move to common functions
async function expectButtonIsVisible(page, selector) {
  const isVisible = await page.$eval(selector, (button) => {
    const buttonStyle = window.getComputedStyle(button)
    return (
      buttonStyle &&
      buttonStyle.display !== 'none' &&
      buttonStyle.visibility !== 'hidden' &&
      buttonStyle.opacity !== '0'
    )
  })

  expect(isVisible).toBe(true)
}

async function typeCurrentThenNewPassword(page, currPass, newPass) {
  await page.waitForSelector(SELECTORS.enterCurrentPassField)
  await typeText(page, SELECTORS.enterCurrentPassField, currPass)
  await typeText(page, SELECTORS.enterNewPassField, newPass)
  await typeText(page, SELECTORS.repeatNewPassField, newPass)
  await clickOnElement(page, SELECTORS.changeDevicePassButton)
  // Wait until the "Success device password" modal to be visible
  await page.waitForSelector(SELECTORS.bottomSheet)
  // Expect device the "Got it" button in the "Success device password" modal to be visible
  await expectButtonIsVisible(page, SELECTORS.devicePassSuccessModal)
  // Click on "Got it" button
  await clickOnElement(page, SELECTORS.devicePassSuccessModal, true, 500)
  // Wait until the "Success device password" modal to be hidden
  await page.waitForSelector(SELECTORS.bottomSheet, { hidden: true })
}

export async function changeKeystorePassword(page, extensionURL) {
  await page.goto(`${extensionURL}${URL_DEVICE_PASSWORD_CHANGE}`, {
    waitUntil: 'load'
  })

  // Change the keystore password
  await typeCurrentThenNewPassword(page, DEF_KEYSTORE_PASS, NEW_KEYSTORE_PASSWORD)

  //! !!FOR THE MOMENT "SIGN OUT" BUTTON DOESN'T EXIST IN THE FULL SCREEN MODE. BELLOW WE VERIFY THAT CHANGED PASSWORD IS ALREADY IN USE.
  // THIS STEP WILL BE CHANGED WHEN THE BUTTON IS CREATED!!!

  // Restore the old password
  await typeCurrentThenNewPassword(page, NEW_KEYSTORE_PASSWORD, DEF_KEYSTORE_PASS)
}

export async function lockKeystore(page, extensionURL) {
  await page.goto(`${extensionURL}${URL_SETTINGS_GENERAL}`, {
    waitUntil: 'load'
  })

  await expectButtonIsVisible(page, SELECTORS.lockExtensionButton)
  await clickOnElement(page, SELECTORS.lockExtensionButton)

  const currentURL = page.url()
  expect(currentURL).toContain(URL_SETTINGS_GENERAL)
}

export async function unlockKeystore(page, extensionURL) {
  await page.goto(`${extensionURL}${URL_SETTINGS_GENERAL}`, {
    waitUntil: 'load'
  })

  await expectButtonIsVisible(page, SELECTORS.lockExtensionButton)
  await clickOnElement(page, SELECTORS.lockExtensionButton)

  const currentURL = page.url()
  expect(currentURL).toContain(URL_SETTINGS_GENERAL)
  await typeKeystorePassAndUnlock(page, DEF_KEYSTORE_PASS)
}

export async function setUpKeystore(page, extensionURL) {
  await page.goto(`${extensionURL}${URL_DEVICE_PASSWORD_CHANGE}`, {
    waitUntil: 'load'
  })

  await page.waitForSelector(SELECTORS.enterNewPassField)
  await typeText(page, SELECTORS.enterPassField, DEF_KEYSTORE_PASS)
  await typeText(page, SELECTORS.repeatPassField, DEF_KEYSTORE_PASS)
  await clickOnElement(page, SELECTORS.createKeystorePassBtn)

  await page.waitForSelector(SELECTORS.bottomSheet)
  await expectButtonIsVisible(page, SELECTORS.keystoreBtnContinue)

  await clickOnElement(page, SELECTORS.keystoreBtnContinue, true, 500)
  // Wait until the "Success device password" modal to be hidden
  await page.waitForSelector(SELECTORS.bottomSheet, { hidden: true })
}

async function verifyIfOnSettingPage(page) {
  await expect(page).toMatchElement('div', { text: 'Settings' })
  expect(page.url()).toContain(URL_SETTINGS_GENERAL)
}

export async function openSettingsPage(page) {
  if (!page.url().includes(URL_SETTINGS_PAGE)) {
    await clickOnElement(page, SELECTORS.dashboardHumburgerBtn)
    await verifyIfOnSettingPage(page)
  }
}

async function selectSetting(page, text, assert_text = null) {
  await clickOnElement(page, `text=${text}`)
  expect(page.url()).toContain(URL_SETTINGS_PAGE + text.toLowerCase())
  if (assert_text) {
    await expect(page).toMatchElement('div', { text: `${assert_text}`, timeout: 3000 })
  }
}

async function typeNetworkField(page, field, text) {
  const xpath = `//div[text()="${field}"]/following-sibling::div//input`
  await page.waitForXPath(xpath, { visible: true, timeout: 3000 })
  const [inputElement] = await page.$x(xpath)
  await inputElement.type(text)
}
async function selectManualNetworkButton(page, button_text, delay = 500) {
  if (delay > 0) {
    await page.waitForTimeout(delay)
  }
  const xpath = `//div[.//div[text()="Network details"]]//div[text()="${button_text}"]`
  const [element] = await page.$x(xpath)
  expect(element).not.toBeNull()
  await element.click()
}

async function verifyGreenMessage(page, message = GREEN_MSG_NETWORK_ADDED) {
  const xpath = `//div[contains(normalize-space(), "${message}")]`
  // Wait for green success message to appear
  await page.waitForXPath(xpath, { visible: true, timeout: 3000 })
  // Wait for green success message to disappear
  await page.waitForXPath(xpath, { hidden: true, timeout: 9000 })
}

export async function addNetworkManually(page, network_symbol) {
  await openSettingsPage(page)
  await selectSetting(page, 'Network', 'Network details')
  await clickOnElement(page, SELECTORS.settingsAddNetworkManually)
  const network = NETWORKS_LIST[network_symbol]
  await typeNetworkField(page, 'Network name', network.networkName)
  await typeNetworkField(page, 'Currency Symbol', network.ccySymbol)
  await typeNetworkField(page, 'Currency Name', network.ccyName)
  await typeNetworkField(page, 'RPC URL', network.rpcUrl)
  const [addButton] = await page.$x(MANUAL_ADD_BTN)
  await addButton.click()
  await typeNetworkField(page, 'Block Explorer URL', network.explorerUrl)
  await page.waitForXPath(AMBIRE_SMART_ACCOUNTS_MSG, { hidden: true, timeout: 9000 })
  await selectManualNetworkButton(page, 'Add network', 1000)

  await verifyGreenMessage(page, GREEN_MSG_NETWORK_ADDED)
}

async function verifyNetworkField(page, field, value) {
  const xpath = `//div[.//div[text()="${field}"] and .//div[text()="${value}"]]`
  await page.waitForXPath(xpath, { visible: true, timeout: 5000 })
  const [element] = await page.$x(xpath)
  expect(element).not.toBeNull()
}

async function selectNetworkButton(page, text) {
  const xpath = `//div[.//div[text()="Network details"]]//div[text()="${text}"]`
  const [element] = await page.$x(xpath)
  expect(element).not.toBeNull()
  element.click()
}

async function verifyNetwork(page, network_name, assert = true) {
  await page.waitForTimeout(1000)
  const xpath = `//div[.//div[text()="Network details"]]//div[text()="${network_name}"]`
  if (assert) {
    const element = await page.waitForXPath(xpath, { visible: true, timeout: 3000 })
    expect(element).not.toBe(null)
  } else {
    const element = await page.waitForXPath(xpath, { hidden: true, timeout: 3000 })
    expect(element).toBe(null)
  }
}

async function selectNetwork(page, network_name) {
  const xpath = `//div[.//div[text()="Network details"]]//div[text()="${network_name}"]`
  await page.waitForXPath(xpath, { visible: true, timeout: 3000 })
  const [element] = await page.$x(xpath)
  expect(element).not.toBeNull()
  element.click()
}

export async function editNetwork(page, network_symbol) {
  await openSettingsPage(page)
  await selectSetting(page, 'Network', 'Network details')
  const network = NETWORKS_LIST[network_symbol]
  await selectNetwork(page, network.networkName)
  await verifyNetworkField(page, 'Block Explorer URL', network.explorerUrl)

  // Select Edit, chnage 'Block Explorer URL' and 'Cancel'
  await selectNetworkButton(page, 'Edit')
  const xpath = '//div[text()="Edit network"]'
  await page.waitForXPath(xpath, { visible: true, timeout: 2000 })
  await typeNetworkField(page, 'Block Explorer URL', '/')
  await selectManualNetworkButton(page, 'Cancel')
  await verifyNetworkField(page, 'Block Explorer URL', network.explorerUrl)

  // Select Edit, chnage 'Block Explorer URL' and 'Save'
  await selectNetworkButton(page, 'Edit')
  await page.waitForXPath(xpath, { visible: true, timeout: 2000 })
  await typeNetworkField(page, 'Block Explorer URL', '/')
  await selectManualNetworkButton(page, 'Save')
  await verifyGreenMessage(page, GREEN_MSG_NETWORK_SAVED)
  await verifyNetworkField(page, 'Block Explorer URL', `${network.explorerUrl}/`)
}

export async function deletNetwork(page, network_symbol) {
  await openSettingsPage(page)
  await selectSetting(page, 'Network', 'Network details')
  const network = NETWORKS_LIST[network_symbol]
  await selectNetwork(page, network.networkName)
  await verifyNetworkField(page, 'Network Name', network.networkName)
  await clickOnElement(page, SELECTORS.removeNetworkButton)
  await page.waitForSelector(SELECTORS.removeNetworkConfirmButton, { visible: true, timeout: 3000 })
  await page.waitForTimeout(1500)
  await clickOnElement(page, SELECTORS.removeNetworkConfirmButton)
  await verifyNetwork(page, network.networkName, false)
}
