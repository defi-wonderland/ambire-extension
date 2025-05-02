import { completeOnboardingSteps } from '../common-helpers/completeOnboardingSteps'
import { bootstrap } from '../common-helpers/bootstrap'
import { INVITE_STORAGE_ITEM } from '../constants/constants'

// Note: The tests are skipped temporarily while we finished the refactoring of the onboarding flow.
// TODO: Restore the tests after the refactoring is done.

describe.skip('Onboarding', () => {
  let browser
  let page
  let extensionURL
  let recorder
  let serviceWorker

  beforeEach(async () => {
    ;({ browser, extensionURL, serviceWorker, recorder, page } = await bootstrap('onboarding'))

    // Bypass the invite verification step
    await serviceWorker.evaluate(
      (invite) => chrome.storage.local.set({ invite, isE2EStorageSet: true }),
      JSON.stringify(INVITE_STORAGE_ITEM)
    )

    const getStartedPage = `${extensionURL}/tab.html#/get-started`
    await page.goto(getStartedPage)

    const href = await page.evaluate(() => window.location.href)
    expect(href).toContain('/get-started')
  })

  afterEach(async () => {
    await recorder.stop()
    await browser.close()
  })
  it('should pass through the onboarding steps and agree with the terms', async () => {
    await completeOnboardingSteps(page)

    const href = await page.evaluate(() => window.location.href)
    expect(href).toContain('/get-started')

    // Check for the text "Welcome to Ambire Wallet" on the page
    const textExists = await page.evaluate(() => {
      return document.body.innerText.includes('Welcome to Ambire Wallet')
    })

    expect(textExists).toBe(true)
  })
})
