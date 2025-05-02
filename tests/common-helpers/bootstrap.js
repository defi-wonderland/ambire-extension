import { PuppeteerScreenRecorder } from 'puppeteer-screen-recorder'
import { serviceWorkerLogger } from './serviceWorkerLogger'
import { getRecordingName } from './utils'

const puppeteer = require('puppeteer')

const buildPath = `build/${process.env.WEBPACK_BUILD_OUTPUT_PATH || 'webkit-prod'}`

const puppeteerArgs = [
  `--disable-extensions-except=${__dirname}/../../${buildPath}/`,
  `--load-extension=${__dirname}/../${buildPath}/`,
  '--disable-features=DialMediaRouteProvider',

  // '--disable-features=ClipboardContentSetting',

  '--clipboard-write: granted',
  '--clipboard-read: prompt',
  '--detectOpenHandles',
  '--start-maximized',

  // We need this for running Puppeteer in Github Actions
  '--no-sandbox',
  '--disable-setuid-sandbox',
  '--font-render-hinting=none',
  '--ignore-certificate-errors',
  '--window-size=1920,1080'
]

export async function bootstrap(namespace) {
  const browser = await puppeteer.launch({
    // devtools: true,
    slowMo: 10,
    headless: false,
    args: puppeteerArgs,
    defaultViewport: null,
    // DISPLAY variable is being set in tests.yml, and it's needed only for running the tests in Github actions.
    // It configures the display server and make the tests working in headfull mode in Github actions.
    ...(process.env.DISPLAY && {
      env: { DISPLAY: process.env.DISPLAY }
    }),
    ignoreHTTPSErrors: true
  })

  const backgroundTarget = await browser.waitForTarget(
    (target) => target.type() === 'service_worker' && target.url().endsWith('background.js')
  )

  const partialExtensionUrl = backgroundTarget.url() || ''
  const [, , extensionId] = partialExtensionUrl.split('/')
  const extensionURL = `chrome-extension://${extensionId}`

  const serviceWorker = await backgroundTarget.worker()

  // Wait for the service worker to be activated.
  // Otherwise, the tests fail randomly, and we can't set the storage in `bootstrapWithStorage`,
  // as the storage in `serviceWorker.evaluate(() => chrome.storage)` hasn't initialized yet.
  // Before migrating to Manifest v3, it worked because the background page was always active (in contrast to service_worker).
  await serviceWorker.evaluate(() => {
    return new Promise((resolve) => {
      // eslint-disable-next-line no-restricted-globals
      if (self.registration.active) {
        resolve()
      } else {
        // eslint-disable-next-line no-restricted-globals
        self.addEventListener('activate', resolve)
      }
    })
  })

  // If env.E2E_DEBUG is set to 'true', we log all controllers' state updates from the background page
  await serviceWorkerLogger(serviceWorker)

  const page = await browser.newPage()
  page.setDefaultTimeout(120000)
  // Make the extension tab active in the browser
  await page.bringToFront()

  const recorder = new PuppeteerScreenRecorder(page, {
    followNewTab: true
  })
  await recorder.start(getRecordingName(namespace))

  return {
    browser,
    page,
    recorder,
    extensionURL,
    serviceWorker
  }
}
