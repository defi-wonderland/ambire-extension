import HWIcon from '@common/assets/svg/HWIcon'
import PrivateKeyIcon from '@common/assets/svg/PrivateKeyIcon'
import SeedPhraseIcon from '@common/assets/svg/SeedPhraseIcon'
import useNavigation from '@common/hooks/useNavigation'
import { StepperFlow } from '@common/modules/auth/contexts/onboardingNavigationContext/onboardingNavigationContext'
import { ROUTES } from '@common/modules/router/constants/common'
import { openInternalPageInTab } from '@web/extension-services/background/webapi/tab'
import { getUiType } from '@web/utils/uiType'

const { isActionWindow, isPopup } = getUiType()

const getAddKeyOptions = ({
  navigate,
  t,
  isKeystoreSetup
}: {
  navigate: ReturnType<typeof useNavigation>['navigate']
  t: (str: string) => string
  isKeystoreSetup: boolean
}) => {
  const navigateWrapped = (route: string, flow: StepperFlow, keystoreRequired: boolean = true) => {
    const nextRoute = keystoreRequired && !isKeystoreSetup ? ROUTES.keyStoreSetup : route

    if (isActionWindow) {
      openInternalPageInTab(`${nextRoute}?flow=${flow}`)
      return
    }
    if (isPopup) {
      navigate(`${nextRoute}?flow=${flow}`)
      return
    }
    navigate(nextRoute, { state: { flow } })
  }

  return [
    // {
    //   key: 'hw',
    //   text: t('Connect a Hardware Wallet'),
    //   icon: HWIcon,
    //   onPress: () => navigateWrapped(ROUTES.hardwareWalletSelect, 'hw', false)
    // },
    {
      key: 'private-key',
      text: t('Private Key'),
      icon: PrivateKeyIcon,
      onPress: () => navigateWrapped(ROUTES.importPrivateKey, 'private-key'),
      iconProps: {
        width: 36,
        height: 36
      }
    },
    {
      key: 'import-json',
      text: t('Import smart account json'),
      icon: PrivateKeyIcon,
      onPress: () => navigateWrapped(ROUTES.importSmartAccountJson, 'import-json'),
      iconProps: {
        width: 36,
        height: 36
      }
    },
    {
      key: 'seed-phrase',
      text: t('Seed Phrase'),
      icon: SeedPhraseIcon,
      onPress: () => navigateWrapped(ROUTES.importSeedPhrase, 'seed'),
      iconProps: {
        width: 36,
        height: 36
      }
    }
  ]
}

export { getAddKeyOptions }
