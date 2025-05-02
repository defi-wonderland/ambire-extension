import React, { useCallback, useContext, useEffect } from 'react'
import { View } from 'react-native'

import Text from '@common/components/Text'
import { useTranslation } from '@common/config/localization'
import useNavigation from '@common/hooks/useNavigation'
import useRoute from '@common/hooks/useRoute'
import { WEB_ROUTES } from '@common/modules/router/constants/common'
import spacings from '@common/styles/spacings'
import flexbox from '@common/styles/utils/flexbox'
import useKeystoreControllerState from '@web/hooks/useKeystoreControllerState'
import KeyStoreSetupForm from '@web/modules/keystore/components/KeyStoreSetupForm'
import useKeyStoreSetup from '@web/modules/keystore/components/KeyStoreSetupForm/hooks/useKeyStoreSetup/useKeyStoreSetup'
import { SettingsRoutesContext } from '@web/modules/settings/contexts/SettingsRoutesContext'

const DevicePasswordSetSettingsScreen = () => {
  const { setCurrentSettingsPage } = useContext(SettingsRoutesContext)
  const { t } = useTranslation()
  const { navigate } = useNavigation()
  const { params } = useRoute()
  const keyStoreSetup = useKeyStoreSetup()
  const keystoreState = useKeystoreControllerState()

  useEffect(() => {
    setCurrentSettingsPage('device-password-set')
  }, [setCurrentSettingsPage])

  useEffect(() => {
    // If the keystore password is already set,
    // load DevicePassword->Change password screen instead of DevicePassword->Set new password screen
    if (keystoreState.hasPasswordSecret) navigate(WEB_ROUTES.devicePasswordChange)

    // We omit passing `keystoreState` dep on a purpose, as we aim to run this hook on component mount only.
    // On any other `keystoreState.hasPasswordSecret` changes `useKeyStoreSetup` hook is responsible for.
    // For instance: when a new password is being set, `useKeyStoreSetup` hook will show a success modal.
    // If we pass the dep here, the user will be automatically navigated to `devicePasswordChange`
    // and the success modal won't be shown.
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [navigate])

  const onKeyStoreCreation = useCallback(() => {
    if (params?.flow === 'password-recovery') {
      navigate(WEB_ROUTES.devicePasswordRecovery)
    } else {
      navigate(WEB_ROUTES.devicePasswordChange)
    }
  }, [params?.flow, navigate])

  return (
    <View style={{ ...flexbox.flex1, maxWidth: 440 }}>
      <Text weight="medium" fontSize={20} style={[spacings.mtTy, spacings.mb2Xl]}>
        {t('Extension password')}
      </Text>
      <KeyStoreSetupForm showSubmitButton onContinue={onKeyStoreCreation} {...keyStoreSetup} />
    </View>
  )
}

export default React.memo(DevicePasswordSetSettingsScreen)
