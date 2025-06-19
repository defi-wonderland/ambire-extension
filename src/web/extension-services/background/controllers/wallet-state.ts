/* eslint-disable @typescript-eslint/no-floating-promises */
import EventEmitter from '@ambire-common/controllers/eventEmitter/eventEmitter'
import { DEFAULT_THEME, ThemeType } from '@common/styles/themeConfig'
import { browser, isSafari } from '@web/constants/browserapi'
import { storage } from '@web/extension-services/background/webapi/storage'

export class WalletStateController extends EventEmitter {
  isReady: boolean = false

  isPinned: boolean = false

  #isPinnedTimeout: ReturnType<typeof setTimeout> | undefined = undefined

  #isSetupComplete: boolean = false

  themeType: ThemeType = DEFAULT_THEME

  get isSetupComplete() {
    return this.#isSetupComplete
  }

  set isSetupComplete(newValue: boolean) {
    this.#isSetupComplete = newValue
    storage.set('isSetupComplete', newValue)
    this.emitUpdate()
  }

  constructor() {
    super()

    this.#init()
  }

  async #init(): Promise<void> {
    this.#isSetupComplete = await storage.get('isSetupComplete', false)
    this.themeType = await storage.get('themeType', DEFAULT_THEME)
    this.isPinned = await this.#checkIsPinned()
    if (!this.isPinned) this.#initContinuousCheckIsPinned()

    this.isReady = true
    this.emitUpdate()
  }

  async #checkIsPinned() {
    if (isSafari()) return false

    try {
      const userSettings = await browser.action.getUserSettings()
      return (userSettings.isOnToolbar as boolean) || false
    } catch (error) {
      return false
    }
  }

  async #initContinuousCheckIsPinned() {
    const isPinned = await this.#checkIsPinned()

    if (isPinned) {
      this.isPinned = true
      !!this.#isPinnedTimeout && clearTimeout(this.#isPinnedTimeout)
      this.emitUpdate()

      return
    }

    this.#isPinnedTimeout = setTimeout(this.#initContinuousCheckIsPinned.bind(this), 1000)
  }

  async setThemeType(type: ThemeType) {
    this.themeType = type
    await storage.set('themeType', type)

    this.emitUpdate()
  }

  toJSON() {
    return {
      ...this,
      ...super.toJSON(),
      isPinned: this.isPinned,
      isSetupComplete: this.isSetupComplete
    }
  }
}
