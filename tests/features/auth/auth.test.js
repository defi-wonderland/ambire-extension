import { completeOnboardingSteps } from '../../common-helpers/completeOnboardingSteps'
import {
  URL_GET_STARTED,
  URL_ACCOUNT_SELECT,
  INVITE_STORAGE_ITEM,
  INVITE_STATUS_VERIFIED,
  TEST_ACCOUNT_NAMES,
  TEST_ID_ENTER_SEED_PHRASE_FIELD_PLACEHOLDER,
  INVALID_SEEDS_12_WORDS,
  INVALID_SEEDS_24_WORDS,
  BASIC_ACC_VIEW_ONLY_ADDRESS,
  VIEW_ONLY_LABEL,
  INVALID_PRIV_KEYS,
  INVALID_PRIVATE_KEY_ERROR_MSG,
  INVALID_ACC_ADDRESS,
  INVALID_CHECKSUM_ERROR_MSG,
  INVALID_ADDRESS_OR_UD_DOMAIN_ERROR_MSG,
  SUCCESSFULLY_ADDED_2_ACCOUNTS_MSG
} from './constants'
import { bootstrap } from '../../common-helpers/bootstrap'
import { clickOnElement } from '../../common-helpers/clickOnElement'
import { typeText } from '../../common-helpers/typeText'
import { checkStorageKeysExist } from '../../common-helpers/checkStorageKeysExist'
import {
  wait,
  importAccountsFromSeedPhrase,
  checkTextAreaHasValidInputByGivenText,
  importNewSAFromDefaultSeedAndPersonalizeIt,
  personalizeAccountName,
  createHotWalletWithSeedPhrase,
  checkAccountDetails,
  typeSeedWords,
  selectHdPathAndAddAccount
} from './functions'
import { setAmbKeyStore } from '../../common-helpers/setAmbKeyStore'
import { baPrivateKey, SEED_12_WORDS, SEED_24_WORDS } from '../../config/constants'
import { buildSelector } from '../../common-helpers/buildSelector'
import { SELECTORS, TEST_IDS } from '../../common/selectors/selectors'
import { SMART_ACC_VIEW_ONLY_ADDRESS } from '../../constants/constants'

// Note: The tests are skipped temporarily while we finished the refactoring of the onboarding flow.
// TODO: Restore the tests after the refactoring is done.

describe.skip('auth', () => {
  let browser
  let page
  let extensionURL
  let recorder
  let serviceWorker

  beforeEach(async () => {
    ;({ browser, page, recorder, extensionURL, serviceWorker } = await bootstrap('auth'))
    // Bypass the invite verification step
    await serviceWorker.evaluate(
      (invite) => chrome.storage.local.set({ invite, isE2EStorageSet: true }),
      JSON.stringify(INVITE_STORAGE_ITEM)
    )

    await page.goto(`${extensionURL}${URL_GET_STARTED}`)
  })

  afterEach(async () => {
    await recorder.stop()
    await browser.close()
  })

  //--------------------------------------------------------------------------------------------------------------
  it('should import basic account from private key', async () => {
    // Get the invite data from the storage
    const inviteFromStorage = await serviceWorker.evaluate(() => chrome.storage.local.get('invite'))
    expect(Object.keys(inviteFromStorage).length).toBe(1)

    // Expect invitation code to be verified
    const parsedInvitation = JSON.parse(inviteFromStorage.invite)
    expect(parsedInvitation.status).toBe(INVITE_STATUS_VERIFIED)

    await setAmbKeyStore(page, SELECTORS.importPrivateBtn, 'privateKey')
    await page.waitForSelector(SELECTORS.enterSeedPhraseField)

    const enterSeedPhraseFieldPlaceholder = await page.$eval(
      SELECTORS.enterSeedPhraseField,
      (el) => el.placeholder
    )
    // Expect the locator selects the right field where to enter the private key
    expect(enterSeedPhraseFieldPlaceholder).toBe(TEST_ID_ENTER_SEED_PHRASE_FIELD_PLACEHOLDER)

    // Test with invalid keys first
    // eslint-disable-next-line no-restricted-syntax
    for (const privKey of INVALID_PRIV_KEYS) {
      // eslint-disable-next-line no-await-in-loop
      await checkTextAreaHasValidInputByGivenText(
        page,
        privKey,
        SELECTORS.enterSeedPhraseField,
        SELECTORS.importBtn,
        INVALID_PRIVATE_KEY_ERROR_MSG
      )
    }

    await typeText(page, SELECTORS.enterSeedPhraseField, baPrivateKey)

    // Click on Import button.
    await clickOnElement(page, SELECTORS.importBtn)

    await page.waitForFunction(() => window.location.href.includes('/account-adder'))

    await page.waitForSelector(SELECTORS.checkbox, { visible: true })

    const selectedAccount = await page.$eval(SELECTORS.addAccountField, (element) => {
      return element.textContent
    })

    await clickOnElement(page, `${SELECTORS.buttonImportAccount}:not([disabled])`)
    await page.waitForNavigation()

    const currentUrl = page.url()
    expect(currentUrl).toContain('/account-personalize')

    // Click on "Save and Continue" button
    await clickOnElement(page, SELECTORS.saveAndContinueBtn)

    await page.waitForFunction(() => window.location.href.includes('/dashboard'))

    await page.goto(`${extensionURL}${URL_ACCOUNT_SELECT}`, { waitUntil: 'load' })

    // Wait for selector to be visible
    await page.waitForSelector(SELECTORS.account)

    // Verify that selected accounts exist on the page
    await checkAccountDetails(page, SELECTORS.account, [selectedAccount])
  })

  //--------------------------------------------------------------------------------------------------------------
  it('should import one Basic Account and one Smart Account from a 12 words seed phrase and personalize them', async () => {
    await importAccountsFromSeedPhrase(page, extensionURL, SEED_12_WORDS, INVALID_SEEDS_12_WORDS)
  })

  //--------------------------------------------------------------------------------------------------------------
  it('should import one Basic Account and one Smart Account from a 24 words seed phrase and personalize them', async () => {
    await importAccountsFromSeedPhrase(page, extensionURL, SEED_24_WORDS, INVALID_SEEDS_24_WORDS)
  })

  //--------------------------------------------------------------------------------------------------------------
  it('should import view-only accounts', async () => {
    const smartAccount = SMART_ACC_VIEW_ONLY_ADDRESS
    const basicAccount = BASIC_ACC_VIEW_ONLY_ADDRESS

    await completeOnboardingSteps(page)

    await page.waitForFunction(() => window.location.href.includes('/get-started'))

    // Select "Add"
    await clickOnElement(page, SELECTORS.getStartedBtnAdd)

    await typeText(page, buildSelector(TEST_IDS.viewOnlyAddressField, 0), smartAccount)

    // Click on "Import View-Only Accounts" button
    await clickOnElement(page, SELECTORS.viewOnlyBtnImport)

    await clickOnElement(page, SELECTORS.saveAndContinueBtn)

    await page.waitForFunction(() => window.location.href.includes('/dashboard'))

    await page.goto(`${extensionURL}${URL_ACCOUNT_SELECT}`, { waitUntil: 'load' })

    await page.waitForSelector(SELECTORS.address)

    // Verify that added account exist on the page and contains VIEW_ONLY_LABEL
    await checkAccountDetails(page, SELECTORS.account, [smartAccount], [VIEW_ONLY_LABEL])

    await clickOnElement(page, SELECTORS.buttonAddAccount)

    await clickOnElement(page, SELECTORS.watchAddress, true, 1500)
    await typeText(page, buildSelector(TEST_IDS.viewOnlyAddressField, 0), basicAccount)
    // Click on "Import View-Only Accounts" button
    await clickOnElement(page, SELECTORS.viewOnlyBtnImport)
    await clickOnElement(page, SELECTORS.saveAndContinueBtn)

    await page.waitForFunction(() => window.location.href.includes('/dashboard'))

    await page.goto(`${extensionURL}${URL_ACCOUNT_SELECT}`, { waitUntil: 'load' })

    // Verify that added accounts exist on the page and contains VIEW_ONLY_LABEL
    await checkAccountDetails(
      page,
      SELECTORS.account,
      [smartAccount, basicAccount],
      [VIEW_ONLY_LABEL, VIEW_ONLY_LABEL]
    )
  })

  //--------------------------------------------------------------------------------------------------------------
  it('should import a couple of view-only accounts (at once) and personalize some of them', async () => {
    const smartAccount = SMART_ACC_VIEW_ONLY_ADDRESS
    const basicAccount = BASIC_ACC_VIEW_ONLY_ADDRESS

    await completeOnboardingSteps(page)

    await page.waitForFunction(() => window.location.href.includes('/get-started'))

    // Select "Add"
    await clickOnElement(page, SELECTORS.getStartedBtnAdd)

    // Should not allow importing an invalid address
    // Try to add account with empty string for an address
    await checkTextAreaHasValidInputByGivenText(
      page,
      '',
      buildSelector(TEST_IDS.viewOnlyAddressField, 0),
      SELECTORS.viewOnlyBtnImport,
      INVALID_ADDRESS_OR_UD_DOMAIN_ERROR_MSG
    )

    // Try to add account with invalid address
    await checkTextAreaHasValidInputByGivenText(
      page,
      INVALID_ACC_ADDRESS,
      buildSelector(TEST_IDS.viewOnlyAddressField, 0),
      SELECTORS.viewOnlyBtnImport,
      INVALID_CHECKSUM_ERROR_MSG
    )

    // Type the first address
    await typeText(page, buildSelector(TEST_IDS.viewOnlyAddressField, 0), smartAccount)

    // Click on "add one more address"
    await clickOnElement(page, SELECTORS.addOneMoreAddress)

    // Type the second address
    await typeText(page, buildSelector(TEST_IDS.viewOnlyAddressField, 1), basicAccount)

    // Click on Import button
    await clickOnElement(page, SELECTORS.viewOnlyBtnImport)
    await page.waitForNavigation({ waitUntil: 'load' })

    const isSuccessfullyAddedTwoAccounts = await page.$$eval(
      'div[dir="auto"]',
      (elements, msg) => {
        return elements.some((item) => item.textContent === msg)
      },
      SUCCESSFULLY_ADDED_2_ACCOUNTS_MSG
    )

    expect(isSuccessfullyAddedTwoAccounts).toBe(true)

    // Personalize first account
    await personalizeAccountName(page, TEST_ACCOUNT_NAMES[0], 0)

    // Click Save and continue btn
    await clickOnElement(page, SELECTORS.saveAndContinueBtn)

    await page.waitForFunction(() => window.location.href.includes('/dashboard'))

    await page.goto(`${extensionURL}${URL_ACCOUNT_SELECT}`, { waitUntil: 'load' })

    await checkAccountDetails(
      page,
      SELECTORS.account,
      [smartAccount, basicAccount],
      [VIEW_ONLY_LABEL, VIEW_ONLY_LABEL]
    )
  })

  //--------------------------------------------------------------------------------------------------------------
  it('should create a new hot wallet (Smart Account) by setting up a default seed phrase first, and afterward create a couple of more hot wallets (Smart Accounts) out of the stored seed phrase and personalize some of them', async () => {
    await completeOnboardingSteps(page)

    const isOnboardingStateKeyPresent = await checkStorageKeysExist(
      serviceWorker,
      'onboardingState'
    )
    expect(isOnboardingStateKeyPresent).toBe(true)

    await page.waitForFunction(() => window.location.href.includes('/get-started'))

    // Create new hot wallet with seed phrase
    await createHotWalletWithSeedPhrase(page, serviceWorker, extensionURL)

    // Import one new SA from default seed
    await importNewSAFromDefaultSeedAndPersonalizeIt(page, extensionURL)

    // Get accounts from storage
    const addedAccounts = await page.$$eval(SELECTORS.account, (elements) =>
      elements.map((element) => element.innerText)
    )

    // Checks if exact 4 accounts have been added
    expect(addedAccounts.length).toBe(4)
  })
  //--------------------------------------------------------------------------------------------------------------
  it('should importing account from different HD paths', async () => {
    await setAmbKeyStore(page, SELECTORS.buttonProceedSeedPhrase)

    const firstSeedInputField = buildSelector(TEST_IDS.seedPhraseInputFieldDynamic, 1)
    await page.waitForSelector(firstSeedInputField)

    await typeSeedWords(page, SEED_12_WORDS)

    // Click on Import button.
    await clickOnElement(page, SELECTORS.importBtn)

    await page.waitForFunction(() => window.location.href.includes('/account-adder'))
    // Do the onboarding
    await clickOnElement(page, 'xpath///a[contains(text(), "Next")]', true, 1500)
    await clickOnElement(page, 'xpath///a[contains(text(), "Got it")]', true, 500)

    // Select BIP 44 Ledger Live and select import account
    await selectHdPathAndAddAccount(page, SELECTORS.optionBip44LedgerLive, { shouldSaveSeed: true })

    await clickOnElement(page, SELECTORS.pinExtensionCloseBtn)

    // Click on account select button
    // We add a delay because there is a loading animation in the header (when closing the PinExtension tooltip),
    // and Puppeteer registers the click, but it is not applied to the React state.
    await clickOnElement(page, SELECTORS.accountSelectBtn, true, 1000)

    // Wait for dashboard screen to be loaded
    await page.waitForFunction(() => window.location.href.includes('/account-select'))
    // Click on "Add Account"
    await clickOnElement(page, SELECTORS.buttonAddAccount)

    // Click on "Import a new Smart Account from the default Seed Phrase" button
    // Note: Added a delay of 500ms because of the importing process
    await clickOnElement(page, SELECTORS.importFromSavedSeed, true, 500)

    //
    await page.waitForFunction(() => window.location.href.includes('/account-adder'))
    // TODO: Investigate and replace with a proper condition instead of using a fixed wait time.
    await wait(2000)
    // Select Legacy Ledger My Ether Wallet My Crypto HD Path and select import account
    await selectHdPathAndAddAccount(page, SELECTORS.optionLegacyLedgerMyEtherWalletMyCrypto)
  })
})
