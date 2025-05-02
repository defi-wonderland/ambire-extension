import { bootstrap } from '../../common-helpers/bootstrap'
import {
  URL_GET_STARTED,
  URL_ACCOUNT_SELECT,
  INVITE_STORAGE_ITEM,
  TEST_ACCOUNT_NAMES,
  TREZOR_EMULATOR_OPTIONS
} from './constants'
import { getController, setup, initTrezorConnect } from './trezorEmulator.setup'
import { SELECTORS } from '../../common/selectors/selectors'
import { completeOnboardingSteps } from '../../common-helpers/completeOnboardingSteps'
import { clickOnElement } from '../../common-helpers/clickOnElement'
import {
  finishStoriesAndSelectAccount,
  personalizeAccountName,
  interactWithTrezorConnectPage,
  checkAccountDetails
} from './functions'
import { SHOULD_RUN_TREZOR_TESTS } from '../../config/constants'

const controller = getController()

const skipTests = () => {
  console.warn(
    'Skipping all tests because env variable "SHOULD_RUN_TREZOR_TESTS" is set to false or never been set'
  )
  test.skip('Skipped due to condition', () => {
    console.log('Tests skipped')
  })
}

// Note: The tests are skipped temporarily while we finished the refactoring of the onboarding flow.
// TODO: Restore the tests after the refactoring is done.

describe.skip('Trezor Hardware Wallet Authentication E2E', () => {
  if (!SHOULD_RUN_TREZOR_TESTS) {
    skipTests()
    return
  }

  let browser
  let page
  let extensionURL
  let recorder
  let serviceWorker

  beforeAll(async () => {
    await setup(controller, TREZOR_EMULATOR_OPTIONS)
    await initTrezorConnect(controller)
  })

  afterAll(async () => {
    // Cleanup emulator and dispose of resources
    try {
      await controller.api.wipeEmu()
      await controller.api.stopBridge()
      await controller.api.stopEmu()
      await controller.dispose()
    } catch (error) {
      console.error('Error during cleanup:', error)
    }
  })

  beforeEach(async () => {
    ;({ browser, page, recorder, extensionURL, serviceWorker } = await bootstrap('trezorAuth'))

    // Bypass the invite verification step
    await serviceWorker.evaluate(
      (invite) => chrome.storage.local.set({ invite, isE2EStorageSet: true }),
      JSON.stringify(INVITE_STORAGE_ITEM)
    )

    await page.goto(`${extensionURL}${URL_GET_STARTED}`)
  })

  afterEach(async () => {
    if (recorder) await recorder.stop()
    if (browser) await browser.close()
  })

  it('should successfully authenticate using Trezor', async () => {
    // Complete onboarding steps
    await completeOnboardingSteps(page)

    // Click to connect Trezor hardware wallet
    await clickOnElement(page, SELECTORS.getStartedButtonConnectHwWallet)
    await clickOnElement(page, SELECTORS.selectHwOptionTrezor)

    // Wait for Trezor connect page to open
    const newTarget = await browser.waitForTarget(
      (target) => target.url().startsWith('https://connect.trezor.io/'),
      { timeout: 5000 }
    )

    const trezorConnectPage = await newTarget.page()
    await trezorConnectPage.bringToFront()

    // Handle interaction with Trezor connect page
    await interactWithTrezorConnectPage(trezorConnectPage)

    // Complete the account selection and interaction process
    const { firstSelectedAccount, secondSelectedAccount } = await finishStoriesAndSelectAccount(
      page
    )

    const [accountName1, accountName2] = TEST_ACCOUNT_NAMES
    await personalizeAccountName(page, accountName1, 0)
    await personalizeAccountName(page, accountName2, 1)

    // Click on "Save and Continue" button
    await clickOnElement(page, `${SELECTORS.saveAndContinueBtn}:not([disabled])`)

    await page.waitForFunction(() => window.location.href.includes('/dashboard'))

    await page.goto(`${extensionURL}${URL_ACCOUNT_SELECT}`, { waitUntil: 'load' })

    await checkAccountDetails(
      page,
      SELECTORS.account,
      [accountName1, accountName2],
      [firstSelectedAccount, secondSelectedAccount]
    )
  })
})
