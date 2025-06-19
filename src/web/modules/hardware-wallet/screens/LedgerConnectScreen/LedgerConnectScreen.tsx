import React, { useEffect, useState } from 'react'
import { View } from 'react-native'

import AmbireDevice from '@common/assets/svg/AmbireDevice'
import DriveIcon from '@common/assets/svg/DriveIcon'
import LeftPointerArrowIcon from '@common/assets/svg/LeftPointerArrowIcon'
import Button from '@common/components/Button'
import Panel from '@common/components/Panel'
import Text from '@common/components/Text'
import { useTranslation } from '@common/config/localization'
import useRoute from '@common/hooks/useRoute'
import useTheme from '@common/hooks/useTheme'
import useToast from '@common/hooks/useToast'
import useOnboardingNavigation from '@common/modules/auth/hooks/useOnboardingNavigation'
import Header from '@common/modules/header/components/Header'
import spacings from '@common/styles/spacings'
import flexbox from '@common/styles/utils/flexbox'
import text from '@common/styles/utils/text'
import {
  TabLayoutContainer,
  TabLayoutWrapperMainContent
} from '@web/components/TabLayoutWrapper/TabLayoutWrapper'
import { closeCurrentWindow } from '@web/extension-services/background/webapi/window'
import useAccountPickerControllerState from '@web/hooks/useAccountPickerControllerState'
import useBackgroundService from '@web/hooks/useBackgroundService'
import useMainControllerState from '@web/hooks/useMainControllerState'
import useLedger from '@web/modules/hardware-wallet/hooks/useLedger'

export const CARD_WIDTH = 400

const LedgerConnectScreen = () => {
  const mainCtrlState = useMainControllerState()
  const { requestLedgerDeviceAccess } = useLedger()
  const { addToast } = useToast()
  const { t } = useTranslation()
  const [isGrantingPermission, setIsGrantingPermission] = useState(false)
  const { theme } = useTheme()
  const { goToPrevRoute, goToNextRoute } = useOnboardingNavigation()
  const { dispatch } = useBackgroundService()
  const { initParams, type } = useAccountPickerControllerState()
  const [authorizeButtonPressed, setAuthorizeButtonPressed] = useState(false)
  const route = useRoute()

  const onPressNext = async () => {
    setIsGrantingPermission(true)
    setAuthorizeButtonPressed(true)
    try {
      await requestLedgerDeviceAccess()

      const params = new URLSearchParams(route?.search)
      const actionId = params.get('actionId')
      if (actionId) {
        dispatch({ type: 'ACTIONS_CONTROLLER_SET_CURRENT_ACTION_BY_ID', params: { actionId } })
        closeCurrentWindow()
      } else {
        dispatch({ type: 'MAIN_CONTROLLER_ACCOUNT_PICKER_INIT_LEDGER' })
      }
    } catch (error: any) {
      addToast(error.message, { type: 'error' })
    } finally {
      // Clear the flag to allow the user to try again. For all other cases,
      // the state gets reset automatically, because the on connect success
      // the flow redirects the user to another route (and this component unmounts).
      setIsGrantingPermission(false)
    }
  }

  useEffect(() => {
    if (!!authorizeButtonPressed && initParams && type === 'ledger') {
      setAuthorizeButtonPressed(false)
      goToNextRoute()
    }
  }, [authorizeButtonPressed, goToNextRoute, dispatch, initParams, type])

  const isLoading =
    isGrantingPermission || mainCtrlState.statuses.handleAccountPickerInitLedger === 'LOADING'

  return (
    <TabLayoutContainer
      backgroundColor={theme.secondaryBackground}
      header={<Header mode="custom-inner-content" withAmbireLogo />}
    >
      <TabLayoutWrapperMainContent>
        <Panel
          spacingsSize="small"
          type="onboarding"
          withBackButton
          onBackButtonPress={goToPrevRoute}
          title={t('Connect Ledger')}
        >
          <View style={[flexbox.alignSelfCenter, spacings.mbSm, spacings.ptMd]}>
            <Text weight="regular" style={spacings.mbTy} fontSize={14}>
              {t('1. Plug in your Ledger and enter a PIN to unlock it.')}
            </Text>
            <Text weight="regular" fontSize={14} style={{ marginBottom: 40 }}>
              {t('2. Open the Ethereum app.')}
            </Text>
          </View>
          <View
            style={[
              flexbox.directionRow,
              flexbox.alignSelfCenter,
              flexbox.alignCenter,
              spacings.mb2Xl
            ]}
          >
            <DriveIcon style={spacings.mrLg} />
            <LeftPointerArrowIcon style={spacings.mrLg} color={theme.iconPrimary} />
            <AmbireDevice />
          </View>
          <Text style={[spacings.mbLg, text.center]} appearance="secondaryText">
            {t(
              'If not previously granted, Ambire will ask for permission to connect to a HID device.'
            )}
          </Text>

          <Button
            text={isLoading ? t('Connecting...') : t('Authorize & connect')}
            disabled={isLoading}
            style={{ width: 264, ...flexbox.alignSelfCenter }}
            onPress={onPressNext}
            hasBottomSpacing={false}
          />
        </Panel>
      </TabLayoutWrapperMainContent>
    </TabLayoutContainer>
  )
}

export default React.memo(LedgerConnectScreen)
