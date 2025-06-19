import { DashboardPage } from 'pages/dashboardPage'
import { GasTankPage } from 'pages/gasTankPage'
import { TransferPage } from 'pages/transferPage'

import { test as testBase } from '@playwright/test'

import { AuthPage } from '../pages/authPage'
import { SwapAndBridgePage } from '../pages/swapAndBridgePage'

type PageObjects = {
  authPage: AuthPage
  swapAndBridgePage: SwapAndBridgePage
  dashboardPage: DashboardPage
  transferPage: TransferPage
  gasTankPage: GasTankPage
}

export const test = testBase.extend<PageObjects>({
  authPage: async ({}, use) => {
    await use(new AuthPage() as AuthPage)
  },
  swapAndBridgePage: async ({}, use) => {
    await use(new SwapAndBridgePage() as SwapAndBridgePage)
  },
  dashboardPage: async ({}, use) => {
    await use(new DashboardPage() as DashboardPage)
  },
  transferPage: async ({}, use) => {
    await use(new TransferPage() as TransferPage)
  },
  gasTankPage: async ({}, use) => {
    await use(new GasTankPage() as GasTankPage)
  }
})
