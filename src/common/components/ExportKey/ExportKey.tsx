import React, { useEffect, useMemo, useState } from 'react'
import { View } from 'react-native'
import { useModalize } from 'react-native-modalize'

import { Account } from '@ambire-common/interfaces/account'
import { isAmbireV1LinkedAccount, isSmartAccount } from '@ambire-common/libs/account/account'
import Alert from '@common/components/Alert'
import BottomSheet from '@common/components/BottomSheet'
import PrivateKeyExport from '@common/components/ExportKey/PrivateKeyExport'
import SmartAccountExport from '@common/components/ExportKey/SmartAccountExport'
import Text from '@common/components/Text'
import { useTranslation } from '@common/config/localization'
import spacings from '@common/styles/spacings'
import flexbox from '@common/styles/utils/flexbox'
import text from '@common/styles/utils/text'
import eventBus from '@web/extension-services/event/eventBus'
import useBackgroundService from '@web/hooks/useBackgroundService'
import useKeystoreControllerState from '@web/hooks/useKeystoreControllerState'
import PasswordConfirmation from '@web/modules/settings/components/PasswordConfirmation'
import { getUiType } from '@web/utils/uiType'

import { PanelBackButton, PanelTitle } from '../Panel/Panel'

const ExportKey = ({
  account,
  keyAddr,
  keyLabel,
  onBackButtonPress
}: {
  account: Account
  keyAddr: string
  keyLabel: string | undefined
  onBackButtonPress: () => void
}) => {
  const { t } = useTranslation()
  const { dispatch } = useBackgroundService()
  const keystoreState = useKeystoreControllerState()
  const [privateKey, setPrivateKey] = useState<string | null>(null)
  const [blurred, setBlurred] = useState<boolean>(true)

  const {
    ref: sheetRefConfirmPassword,
    open: openConfirmPassword,
    close: closeConfirmPassword
  } = useModalize()

  const isExportingV2SA =
    isSmartAccount(account) && !isAmbireV1LinkedAccount(account?.creation?.factoryAddr)

  const key = useMemo(
    () => keystoreState.keys.find((aKey) => aKey.addr === keyAddr),
    [keystoreState.keys, keyAddr]
  )

  useEffect(() => {
    const onReceiveOneTimeData = (data: any) => {
      if (!data.privateKey) return

      setPrivateKey(data.privateKey)
    }

    eventBus.addEventListener('receiveOneTimeData', onReceiveOneTimeData)

    return () => eventBus.removeEventListener('receiveOneTimeData', onReceiveOneTimeData)
  }, [])

  const onPasswordConfirmed = () => {
    dispatch({
      type: 'KEYSTORE_CONTROLLER_SEND_PRIVATE_KEY_TO_UI',
      params: { keyAddr }
    })
    if (blurred) setBlurred(false)

    closeConfirmPassword()
  }

  if (!account || !key) {
    return (
      <Alert
        type="warning"
        style={spacings.mtTy}
        text={t('Something went wrong as the account/key was not found. Please contract support')}
      />
    )
  }
  const fontSize = getUiType().isPopup ? 14 : 16

  return (
    <View style={flexbox.flex1}>
      <View style={[flexbox.directionRow, flexbox.alignCenter, spacings.mbLg]}>
        <PanelBackButton onPress={onBackButtonPress} style={spacings.mrTy} />
        <PanelTitle title={t('Private key export')} style={text.left} />
      </View>
      <Text weight="semiBold" fontSize={fontSize} numberOfLines={1} style={spacings.mb}>
        {keyLabel}
      </Text>
      {!isExportingV2SA && (
        <PrivateKeyExport
          privateKey={privateKey}
          blurred={blurred}
          setBlurred={setBlurred}
          openConfirmPassword={openConfirmPassword}
        />
      )}
      {isExportingV2SA && (
        <SmartAccountExport
          account={account}
          privateKey={privateKey}
          openConfirmPassword={openConfirmPassword}
          goBack={onBackButtonPress}
        />
      )}
      <BottomSheet
        sheetRef={sheetRefConfirmPassword}
        id="confirm-password-bottom-sheet"
        type="modal"
        backgroundColor="primaryBackground"
        closeBottomSheet={closeConfirmPassword}
        scrollViewProps={{ contentContainerStyle: { flex: 1 } }}
        containerInnerWrapperStyles={{ flex: 1 }}
        style={{ maxWidth: 432, minHeight: 432, ...spacings.pvLg }}
      >
        <PasswordConfirmation
          text={t('Please enter your extension password to reveal your recovery phrase.')}
          onPasswordConfirmed={onPasswordConfirmed}
          onBackButtonPress={closeConfirmPassword}
        />
      </BottomSheet>
    </View>
  )
}

export default React.memo(ExportKey)
