import { PuppeteerScreenRecorder } from 'puppeteer-screen-recorder'
import { clickOnElement } from './clickOnElement'
import { getRecordingName } from './utils'

export async function triggerTransaction(
  page,
  extensionURL,
  browser,
  triggerTransactionSelector,
  shouldClick = true
) {
  if (shouldClick) {
    await clickOnElement(page, triggerTransactionSelector)
  }

  const newTarget = await browser.waitForTarget((target) =>
    target.url().startsWith(`${extensionURL}/action-window.html#`)
  )
  const actionWindowPage = await newTarget.page()
  actionWindowPage.setDefaultTimeout(120000)
  actionWindowPage.setViewport({ width: 800, height: 800 })

  // Start the screen recorder
  const transactionRecorder = new PuppeteerScreenRecorder(actionWindowPage, { followNewTab: true })
  await transactionRecorder.start(getRecordingName('txn_action_window'))

  return { actionWindowPage, transactionRecorder }
}
