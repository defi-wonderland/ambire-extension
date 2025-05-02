/* eslint-disable react/jsx-no-useless-fragment */
import React, { useCallback, useMemo, useState } from 'react'
import { useTranslation } from 'react-i18next'
import { Pressable, View } from 'react-native'
import { useModalize } from 'react-native-modalize'

import CloseIcon from '@common/assets/svg/CloseIcon'
import DownArrowIcon from '@common/assets/svg/DownArrowIcon'
import EditPenIcon from '@common/assets/svg/EditPenIcon'
import UpArrowIcon from '@common/assets/svg/UpArrowIcon'
import BottomSheet from '@common/components/BottomSheet'
import Button from '@common/components/Button'
import Dialog from '@common/components/Dialog'
import DialogButton from '@common/components/Dialog/DialogButton'
import DialogFooter from '@common/components/Dialog/DialogFooter'
import NetworkIcon from '@common/components/NetworkIcon'
import Text from '@common/components/Text'
import useRoute from '@common/hooks/useRoute'
import useTheme from '@common/hooks/useTheme'
import useToast from '@common/hooks/useToast'
import { ROUTES } from '@common/modules/router/constants/common'
import spacings from '@common/styles/spacings'
import flexbox from '@common/styles/utils/flexbox'
import useBackgroundService from '@web/hooks/useBackgroundService'
import NetworkForm from '@web/modules/settings/screens/NetworksSettingsScreen/NetworkForm'

import getStyles from './styles'

type Props = {
  name: string
  iconUrls?: string[]
  selectedRpcUrl: string
  rpcUrls: string[]
  chainId: bigint | string
  explorerUrl: string
  nativeAssetSymbol: string
  nativeAssetName: string
  allowRemoveNetwork?: boolean
  predefined?: boolean
}

const NetworkDetails = ({
  name,
  iconUrls = [],
  selectedRpcUrl,
  rpcUrls,
  chainId,
  explorerUrl,
  nativeAssetSymbol,
  nativeAssetName,
  allowRemoveNetwork,
  predefined
}: Props) => {
  const { t } = useTranslation()
  const { theme, styles } = useTheme(getStyles)
  const { dispatch } = useBackgroundService()
  const { addToast } = useToast()
  const { ref: dialogRef, open: openDialog, close: closeDialog } = useModalize()

  const { pathname } = useRoute()
  const { ref: sheetRef, open: openBottomSheet, close: closeBottomSheet } = useModalize()
  const [showAllRpcUrls, setShowAllRpcUrls] = useState(false)
  const isEmpty = useMemo(
    () => [name, rpcUrls[0], chainId].some((p) => p === '-'),
    [chainId, name, rpcUrls]
  )

  const shouldDisplayEditButton = useMemo(
    () => pathname?.includes(ROUTES.networksSettings) && !isEmpty,
    [pathname, isEmpty]
  )

  const shouldDisplayRemoveButton = useMemo(
    () =>
      pathname?.includes(ROUTES.networksSettings) && !isEmpty && !predefined && allowRemoveNetwork,
    [pathname, isEmpty, allowRemoveNetwork, predefined]
  )
  const promptRemoveCustomNetwork = useCallback(() => {
    openDialog()
  }, [openDialog])

  const removeCustomNetwork = useCallback(() => {
    if (chainId) {
      dispatch({
        type: 'MAIN_CONTROLLER_REMOVE_NETWORK',
        params: { chainId: chainId as bigint }
      })
      closeDialog()
    } else {
      addToast(`Unable to remove network. Network with chainID: ${chainId} not found`)
    }
  }, [dispatch, closeDialog, addToast, chainId])

  const renderInfoItem = useCallback(
    (title: string, value: string, withBottomSpacing = true) => {
      return (
        <View
          style={[flexbox.directionRow, flexbox.alignCenter, !!withBottomSpacing && spacings.mb]}
        >
          <Text fontSize={14} appearance="tertiaryText" style={[spacings.mr]} numberOfLines={1}>
            {title}
          </Text>
          <View
            style={[flexbox.directionRow, flexbox.alignCenter, flexbox.flex1, flexbox.justifyEnd]}
          >
            {title === 'Network Name' && value !== '-' && (
              <View style={spacings.mrMi}>
                <NetworkIcon
                  key={name.toLowerCase() as any}
                  id={chainId.toString()}
                  uris={iconUrls.length ? iconUrls : undefined}
                  size={32}
                />
              </View>
            )}
            <Text
              fontSize={14}
              appearance={value === 'Invalid Chain ID' ? 'errorText' : 'primaryText'}
              numberOfLines={1}
              selectable
            >
              {value}
            </Text>
          </View>
        </View>
      )
    },
    [name, iconUrls, chainId]
  )

  const renderRpcUrlsItem = useCallback(() => {
    const sortedRpcUrls = [selectedRpcUrl, ...rpcUrls.filter((u) => u !== selectedRpcUrl)]
    return (
      <View style={[flexbox.directionRow, spacings.mb]}>
        <Text fontSize={14} appearance="tertiaryText" style={[spacings.mr]} numberOfLines={1}>
          {t(`RPC URL${sortedRpcUrls.length ? '(s)' : ''}`)}
        </Text>
        <View style={[flexbox.flex1, flexbox.alignEnd]}>
          {!showAllRpcUrls ? (
            <Text fontSize={14} appearance="primaryText" numberOfLines={1} selectable>
              {sortedRpcUrls[0]}
            </Text>
          ) : (
            sortedRpcUrls.map((rpcUrl: string, i) => (
              <Text
                key={rpcUrl}
                fontSize={14}
                appearance={i === 0 ? 'primaryText' : 'secondaryText'}
                weight={i === 0 ? 'regular' : 'light'}
                numberOfLines={1}
                style={i !== sortedRpcUrls.length - 1 && spacings.mbMi}
                selectable
              >
                {rpcUrl}
              </Text>
            ))
          )}
          {sortedRpcUrls.length > 1 && (
            <Pressable
              style={[spacings.ptMi, flexbox.directionRow, flexbox.alignCenter, spacings.mbMi]}
              onPress={() => setShowAllRpcUrls((p) => !p)}
            >
              <Text style={spacings.mrMi} fontSize={12} color={theme.featureDecorative} underline>
                {!showAllRpcUrls &&
                  t('show {{number}} more', {
                    number: sortedRpcUrls.length - 1
                  })}
                {!!showAllRpcUrls &&
                  t('hide {{number}} urls', {
                    number: sortedRpcUrls.length - 1
                  })}
              </Text>
              {!!showAllRpcUrls && (
                <UpArrowIcon
                  width={12}
                  height={6}
                  color={theme.featureDecorative}
                  strokeWidth="1.7"
                />
              )}
              {!showAllRpcUrls && (
                <DownArrowIcon
                  width={12}
                  height={6}
                  color={theme.featureDecorative}
                  strokeWidth="1.7"
                />
              )}
            </Pressable>
          )}
        </View>
      </View>
    )
  }, [rpcUrls, selectedRpcUrl, showAllRpcUrls, theme, t])

  return (
    <>
      <View style={[styles.container, shouldDisplayEditButton && spacings.ptSm]}>
        <View style={[flexbox.directionRow, flexbox.alignCenter, spacings.mbMd]}>
          <Text
            fontSize={18}
            weight="medium"
            style={[flexbox.flex1, spacings.mrTy]}
            numberOfLines={1}
          >
            {t('Network details')}
          </Text>
          {!!shouldDisplayEditButton && (
            <Button
              style={[{ maxHeight: 32 }, !!shouldDisplayRemoveButton && spacings.mrTy]}
              text={t('Edit')}
              type="secondary"
              onPress={openBottomSheet as any}
              hasBottomSpacing={false}
            >
              <View style={spacings.plTy}>
                <EditPenIcon width={12} height={12} color={theme.primary} />
              </View>
            </Button>
          )}
          {!!shouldDisplayRemoveButton && (
            <Button
              style={{ maxHeight: 32 }}
              text={t('Remove')}
              testID="remove-network-btn"
              type="danger"
              onPress={() => {
                if (!chainId || !allowRemoveNetwork) return
                promptRemoveCustomNetwork()
              }}
              hasBottomSpacing={false}
            >
              <View style={spacings.plTy}>
                <CloseIcon width={12} height={12} color={theme.errorDecorative} />
              </View>
            </Button>
          )}
        </View>
        <View style={flexbox.flex1}>
          {renderInfoItem(t('Network Name'), name)}
          {renderRpcUrlsItem()}
          {renderInfoItem(t('Chain ID'), chainId.toString())}
          {renderInfoItem(t('Currency Symbol'), nativeAssetSymbol)}
          {renderInfoItem(t('Currency Name'), nativeAssetName)}
          {renderInfoItem(t('Block Explorer URL'), explorerUrl, false)}
        </View>
      </View>
      <Dialog
        dialogRef={dialogRef}
        id="remove-network"
        title={t(`Remove ${name}`)}
        text={t(
          `Are you sure you want to remove ${name} from networks? Upon removal, any tokens associated with this network will no longer be visible in your wallet.`
        )}
        closeDialog={closeDialog}
      >
        <DialogFooter horizontalAlignment="justifyEnd">
          <DialogButton text={t('Close')} type="secondary" onPress={() => closeDialog()} />
          <DialogButton
            style={spacings.ml}
            text={t('Remove')}
            testID="remove-network-confirm-btn"
            type="danger"
            onPress={removeCustomNetwork}
          />
        </DialogFooter>
      </Dialog>
      <BottomSheet
        id="edit-network-bottom-sheet"
        sheetRef={sheetRef}
        closeBottomSheet={closeBottomSheet}
        scrollViewProps={{
          scrollEnabled: false,
          contentContainerStyle: { flex: 1 }
        }}
        containerInnerWrapperStyles={{ flex: 1 }}
        backgroundColor="primaryBackground"
        style={{ ...spacings.ph0, ...spacings.pv0, overflow: 'hidden' }}
      >
        <NetworkForm
          selectedChainId={chainId.toString()}
          onCancel={closeBottomSheet}
          onSaved={closeBottomSheet}
        />
      </BottomSheet>
    </>
  )
}

export default React.memo(NetworkDetails)
