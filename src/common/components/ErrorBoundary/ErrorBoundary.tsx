import React, { useCallback } from 'react'
import { Trans } from 'react-i18next'
import { Pressable, TouchableOpacity, View } from 'react-native'
import { useModalize } from 'react-native-modalize'

import CopyIcon from '@common/assets/svg/CopyIcon'
import BottomSheet from '@common/components/BottomSheet'
import ScrollableWrapper from '@common/components/ScrollableWrapper'
import { useTranslation } from '@common/config/localization'
import useTheme from '@common/hooks/useTheme'
import useToast from '@common/hooks/useToast'
import spacings from '@common/styles/spacings'
import common from '@common/styles/utils/common'
import flexbox from '@common/styles/utils/flexbox'
import text from '@common/styles/utils/text'
import { setStringAsync } from '@common/utils/clipboard'
import { PortalHost } from '@gorhom/portal'
import { openInTab } from '@web/extension-services/background/webapi/tab'
import { getUiType } from '@web/utils/uiType'

import AmbireLogoHorizontal from '../AmbireLogoHorizontal'
import Button from '../Button'
import Text from '../Text'

const { isPopup } = getUiType()

interface Props {
  error: Error
}

const ErrorBoundary = ({ error }: Props) => {
  const { theme } = useTheme()
  const { t } = useTranslation()
  const { ref: sheetRef, open: openBottomSheet, close: closeBottomSheet } = useModalize()
  const { addToast } = useToast()

  const handleCopyError = useCallback(async () => {
    try {
      await setStringAsync(error.stack!)
      addToast(t('Error copied to clipboard!') as string, { timeout: 2500 })
    } catch {
      addToast(t('Failed to copy error to clipboard!') as string, {
        timeout: 2500,
        type: 'error'
      })
    }
  }, [addToast, error.stack, t])

  // Please note that we also need to render `<PortalHost name="global" />` here.
  // If an error occurs, AppInit -> PortalHost will not be rendered because `ErrorBoundary` is a top-level component,
  // which prevents PortalHost from being rendered as well.
  // We attempted to render PortalHost as a top-level component, but this approach does not work.
  // Therefore, we need to render it in two places: here and in AppInit.
  // This is not an issue, as either ErrorBoundary or the remaining components will be mounted,
  // ensuring that PortalHost is only rendered once.
  return (
    <>
      <PortalHost name="global" />
      <BottomSheet
        id="error-boundary-bottom-sheet"
        sheetRef={sheetRef}
        closeBottomSheet={closeBottomSheet}
        type="modal"
        shouldBeClosableOnDrag={false}
        style={{
          overflow: 'hidden',
          width: isPopup ? 512 : 712
        }}
        scrollViewProps={{
          contentContainerStyle: { flex: 1 },
          scrollEnabled: false
        }}
        containerInnerWrapperStyles={flexbox.flex1}
      >
        <Text
          fontSize={20}
          weight="semiBold"
          numberOfLines={1}
          style={{ ...spacings.mbLg, textAlign: 'center' }}
        >
          {t('Error Details')}
        </Text>

        <Text style={{ ...spacings.mbTy, textAlign: 'center' }}>
          {t('This report provides technical details.')}
        </Text>

        <Text style={{ ...spacings.mbTy, textAlign: 'center' }}>
          <Trans i18nKey="errorBoundaryHeading">
            Please share it with{' '}
            <TouchableOpacity onPress={() => openInTab('https://help.ambire.com/hc')}>
              <Text weight="medium" color={theme.primary}>
                our support team
              </Text>
            </TouchableOpacity>{' '}
            for faster assistance.
          </Trans>
        </Text>

        <Pressable
          onPress={handleCopyError}
          style={[flexbox.directionRow, flexbox.alignSelfEnd, spacings.mbTy]}
        >
          <Text fontSize={12} weight="medium" color={theme.secondaryText}>
            {t('Copy')}
          </Text>
          <CopyIcon color={theme.secondaryText} style={spacings.mlTy} width={18} height={18} />
        </Pressable>

        <ScrollableWrapper>
          <Text
            fontSize={12}
            selectable
            style={[
              common.borderRadiusPrimary,
              spacings.pvMd,
              spacings.phMd,
              {
                backgroundColor: theme.warningBackground,
                borderColor: theme.warningDecorative,
                borderWidth: 1
              }
            ]}
          >
            {error.stack}
          </Text>
        </ScrollableWrapper>

        <View style={[spacings.ptMd, flexbox.alignCenter]}>
          <Button
            text={t('Close')}
            type="secondary"
            size="small"
            onPress={() => closeBottomSheet()}
            hasBottomSpacing={false}
          />
        </View>
      </BottomSheet>

      <View
        style={[
          flexbox.flex1,
          flexbox.center,
          {
            backgroundColor: theme.secondaryBackground
          }
        ]}
      >
        <View
          style={[
            spacings.pvXl,
            spacings.ph2Xl,
            flexbox.alignCenter,
            common.borderRadiusPrimary,
            {
              backgroundColor: theme.primaryBackground,
              borderColor: theme.secondaryBorder,
              borderWidth: 1
            }
          ]}
        >
          <AmbireLogoHorizontal width={124} height={43} style={spacings.mbXl} />
          <Text
            fontSize={20}
            weight="medium"
            style={[text.center, spacings.mbSm, { maxWidth: 360 }]}
          >
            {t('Something went wrong, but your funds are safe!')}
          </Text>
          <View
            style={{
              maxWidth: 360,
              ...spacings.mb,
              marginHorizontal: 'auto'
            }}
          >
            <Text fontSize={14} style={text.center}>
              {t('Try reloading the page. If the issue persists, restart your browser or ')}
              <TouchableOpacity onPress={() => openInTab('https://help.ambire.com/hc')}>
                <Text fontSize={14} weight="medium" color={theme.primary}>
                  {t('contact Support')}
                </Text>
              </TouchableOpacity>
              {t(' for assistance.')}
            </Text>
          </View>
          <TouchableOpacity
            style={{
              ...spacings.mbXl
            }}
            onPress={() => openBottomSheet()}
          >
            <Text fontSize={12} underline>
              {t('Show Details')}
            </Text>
          </TouchableOpacity>

          <Button
            style={{
              width: 200
            }}
            text={t('Reload')}
            onPress={() => window.location.reload()}
            hasBottomSpacing={false}
          />
        </View>
      </View>
    </>
  )
}

export default React.memo(ErrorBoundary)
