import React, { useCallback, useEffect, useMemo, useState } from 'react'
import { View } from 'react-native'

import { KeystoreSeed } from '@ambire-common/interfaces/keystore'
import CopyIcon from '@common/assets/svg/CopyIcon'
import Button from '@common/components/Button'
import Panel from '@common/components/Panel'
import Spinner from '@common/components/Spinner'
import Text from '@common/components/Text'
import { useTranslation } from '@common/config/localization'
import useTheme from '@common/hooks/useTheme'
import useToast from '@common/hooks/useToast'
import useOnboardingNavigation from '@common/modules/auth/hooks/useOnboardingNavigation'
import Header from '@common/modules/header/components/Header'
import spacings from '@common/styles/spacings'
import common from '@common/styles/utils/common'
import flexbox from '@common/styles/utils/flexbox'
import { setStringAsync } from '@common/utils/clipboard'
import {
  TabLayoutContainer,
  TabLayoutWrapperMainContent
} from '@web/components/TabLayoutWrapper/TabLayoutWrapper'
import eventBus from '@web/extension-services/event/eventBus'
import useAccountPickerControllerState from '@web/hooks/useAccountPickerControllerState'
import useBackgroundService from '@web/hooks/useBackgroundService'
import useKeystoreControllerState from '@web/hooks/useKeystoreControllerState'

const CreateSeedPhraseWriteScreen = () => {
  const { goToNextRoute, goToPrevRoute } = useOnboardingNavigation()
  const { t } = useTranslation()
  const { theme } = useTheme()
  const { addToast } = useToast()
  const { dispatch } = useBackgroundService()
  const { hasTempSeed } = useKeystoreControllerState()
  const [tempSeed, setTempSeed] = useState<KeystoreSeed | null>(null)
  const { initParams, subType } = useAccountPickerControllerState()
  const [submitButtonPressed, setSubmitButtonPressed] = useState(false)

  useEffect(() => {
    if (!tempSeed && hasTempSeed) {
      dispatch({ type: 'KEYSTORE_CONTROLLER_SEND_TEMP_SEED_TO_UI' })
    }
  }, [dispatch, tempSeed, hasTempSeed])

  useEffect(() => {
    const onReceiveOneTimeData = (data: any) => {
      if (!data.tempSeed) return

      setTempSeed(data.tempSeed)
    }

    eventBus.addEventListener('receiveOneTimeData', onReceiveOneTimeData)

    return () => eventBus.removeEventListener('receiveOneTimeData', onReceiveOneTimeData)
  }, [])

  const handleSubmit = useCallback(async () => {
    if (!tempSeed) return

    setSubmitButtonPressed(true)
    dispatch({
      type: 'MAIN_CONTROLLER_ACCOUNT_PICKER_INIT_PRIVATE_KEY_OR_SEED_PHRASE',
      params: { privKeyOrSeed: tempSeed.seed, hdPathTemplate: tempSeed.hdPathTemplate }
    })
  }, [dispatch, tempSeed])

  useEffect(() => {
    if (!tempSeed) return
    if (!!submitButtonPressed && initParams && subType === 'seed') {
      setSubmitButtonPressed(false)
      goToNextRoute()
    }
  }, [goToNextRoute, dispatch, tempSeed, initParams, submitButtonPressed, subType])

  const handleCopyToClipboard = useCallback(async () => {
    try {
      if (!tempSeed) return

      await setStringAsync(tempSeed.seed)
      addToast(t('Recovery phrase copied to clipboard'))
    } catch {
      addToast(t('Failed to copy recovery phrase'))
    }
  }, [addToast, tempSeed, t])

  const seedArray = useMemo(() => {
    if (!tempSeed) return []

    return tempSeed.seed.split(' ')
  }, [tempSeed])

  return (
    <TabLayoutContainer
      backgroundColor={theme.secondaryBackground}
      header={<Header mode="custom-inner-content" withAmbireLogo />}
    >
      <TabLayoutWrapperMainContent>
        <Panel
          type="onboarding"
          spacingsSize="small"
          step={1}
          totalSteps={2}
          title="Back up recovery phrase"
          withBackButton
          onBackButtonPress={() => {
            goToPrevRoute()
          }}
        >
          {!!seedArray.length && (
            <View>
              <Text
                weight="medium"
                appearance="secondaryText"
                style={[spacings.mbXl, spacings.phSm, { textAlign: 'center' }]}
              >
                {t('Write down and secure the recovery phrase for your account.')}
              </Text>
              <View
                style={{
                  ...flexbox.directionRow,
                  ...flexbox.wrap,
                  ...flexbox.justifyCenter,
                  borderWidth: 1,
                  borderColor: theme.secondaryBorder,
                  ...common.borderRadiusPrimary,
                  overflow: 'hidden'
                }}
              >
                {seedArray.map((word, index) => (
                  <View
                    key={`${word}-${index.toString()}`}
                    style={{
                      width: '33.33%',
                      borderRightWidth: (index + 1) % 3 === 0 ? 0 : 1,
                      borderBottomWidth: index < 9 ? 1 : 0,
                      borderColor: theme.secondaryBorder,
                      ...spacings.ptMi,
                      ...spacings.pbMi,
                      ...spacings.phMi,
                      ...flexbox.alignCenter,
                      ...flexbox.justifyCenter
                    }}
                  >
                    <View style={[flexbox.directionRow, flexbox.alignCenter, { width: '100%' }]}>
                      <Text
                        fontSize={12}
                        appearance="tertiaryText"
                        weight="medium"
                        style={{ lineHeight: 14 }}
                      >
                        {index + 1}.
                      </Text>
                    </View>
                    <Text fontSize={14} weight="medium" style={{ lineHeight: 19 }}>
                      {word}
                    </Text>
                    <Text fontSize={12} style={{ lineHeight: 14 }}>
                      {' '}
                    </Text>
                  </View>
                ))}
              </View>
              <View
                style={[
                  flexbox.directionRow,
                  flexbox.justifyCenter,
                  flexbox.alignCenter,
                  spacings.ptTy,
                  common.borderRadiusPrimary,
                  spacings.mbXl
                ]}
              >
                <Button
                  type="ghost"
                  text={t('Copy recovery phrase')}
                  hasBottomSpacing={false}
                  size="small"
                  testID="copy-recovery-phrase"
                  onPress={handleCopyToClipboard}
                >
                  <CopyIcon style={spacings.mlTy} />
                </Button>
              </View>
              <Button
                testID="create-seed-phrase-write-continue-btn"
                accessibilityRole="button"
                text={t("I've saved the phrase")}
                size="large"
                hasBottomSpacing={false}
                onPress={handleSubmit}
              />
            </View>
          )}
          {!seedArray.length && (
            <View style={[flexbox.flex1, flexbox.alignCenter, flexbox.justifyCenter]}>
              <Spinner style={{ width: 16, height: 16 }} />
            </View>
          )}
        </Panel>
      </TabLayoutWrapperMainContent>
    </TabLayoutContainer>
  )
}

export default CreateSeedPhraseWriteScreen
