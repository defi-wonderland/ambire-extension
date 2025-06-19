import 'dotenv/config'

import { PlaywrightTestConfig } from '@playwright/test'

const config: PlaywrightTestConfig = {
  expect: {
    timeout: 10 * 1000,
    toHaveScreenshot: {
      maxDiffPixelRatio: 1 / 100
    }
  },
  testDir: 'tests',
  testMatch: '**/*.spec.ts',
  reporter: [
    ['list'],
    ['junit', { outputFile: 'test-results/results.xml' }],
    ['html', { open: 'always' }]
  ],
  timeout: 180 * 1000, // 3min
  reportSlowTests: null,
  snapshotPathTemplate: 'data/screenshots/{projectName}/{testFilePath}/{arg}/text',
  retries: process.env.CI ? 1 : 0,
  use: {
    viewport: { width: 1920, height: 1080 },
    baseURL: process.env.APP_URL || '',
    headless: true,
    video: 'on',
    trace: 'retain-on-failure',
    screenshot: 'only-on-failure',
    ignoreHTTPSErrors: true,
    acceptDownloads: true,
    launchOptions: {
      downloadsPath: 'test-results/downloads/'
    },
    actionTimeout: 60 * 1000,
    navigationTimeout: 45 * 1000,
    permissions: ['clipboard-read', 'clipboard-write']
  }
}

export default config
