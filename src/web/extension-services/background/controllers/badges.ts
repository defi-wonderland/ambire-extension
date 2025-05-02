import { MainController } from '@ambire-common/controllers/main/main'
import colors from '@common/styles/colors'
import { browser } from '@web/constants/browserapi'
import { setExtensionIcon } from '@web/extension-services/background/webapi/icon'

export class BadgesController {
  #mainCtrl: MainController

  #swapAndBridgeBannersCount: number = 0

  #badgesCount: number = 0

  #icon: 'default' | 'locked' | null = null

  get badgesCount() {
    return this.#badgesCount + this.swapAndBridgeBannersCount
  }

  set badgesCount(newValue: number) {
    this.#badgesCount = newValue
    this.setBadges(this.badgesCount)
  }

  get swapAndBridgeBannersCount() {
    return this.#swapAndBridgeBannersCount
  }

  set swapAndBridgeBannersCount(newValue: number) {
    this.#swapAndBridgeBannersCount = newValue
    this.setBadges(this.badgesCount)
  }

  constructor(mainCtrl: MainController) {
    this.#mainCtrl = mainCtrl

    this.#mainCtrl.onUpdate(() => {
      this.badgesCount = this.#mainCtrl.actions.visibleActionsQueue.filter(
        (a) => a.type !== 'benzin' && a.type !== 'swapAndBridge'
      ).length
      const swapAndBridgeBannersCount = this.#mainCtrl.swapAndBridge.banners.filter(
        (b) => b.category === 'bridge-ready'
      ).length

      this.swapAndBridgeBannersCount =
        this.#mainCtrl.signAccountOp && !!swapAndBridgeBannersCount
          ? swapAndBridgeBannersCount - 1
          : swapAndBridgeBannersCount
    })

    this.#mainCtrl.keystore.onUpdate(() => {
      if (
        mainCtrl.keystore.hasPasswordSecret &&
        !mainCtrl.keystore.isUnlocked &&
        (!this.#icon || this.#icon === 'default')
      ) {
        this.#icon = 'locked'
        setExtensionIcon('locked')
      }

      if (mainCtrl.keystore.isUnlocked && (!this.#icon || this.#icon === 'locked')) {
        this.#icon = 'default'
        setExtensionIcon('default')
      }
    })

    this.#mainCtrl.swapAndBridge.onUpdate(() => {
      const swapAndBridgeBannersCount = this.#mainCtrl.swapAndBridge.banners.filter(
        (b) => b.category === 'bridge-ready'
      ).length

      this.swapAndBridgeBannersCount =
        this.#mainCtrl.signAccountOp && !!swapAndBridgeBannersCount
          ? swapAndBridgeBannersCount - 1
          : swapAndBridgeBannersCount
    })
  }

  setBadges = (badgesCount: number) => {
    if (badgesCount <= 0) {
      browser.action.setBadgeText({ text: '' })
    } else {
      browser.action.setBadgeText({ text: `${badgesCount}` })
      browser.action.setBadgeBackgroundColor({ color: colors.turquoise })
    }
  }

  toJSON() {
    return {
      ...this,
      badgesCount: this.badgesCount,
      swapAndBridgeBannersCount: this.swapAndBridgeBannersCount
    }
  }
}
