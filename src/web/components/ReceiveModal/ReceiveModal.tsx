import * as Clipboard from 'expo-clipboard'
import React, { FC, useCallback, useMemo, useRef, useState } from 'react'
import { useTranslation } from 'react-i18next'
import { View } from 'react-native'
import QRCode from 'react-native-qrcode-svg'

import { getIsViewOnly } from '@ambire-common/utils/accounts'
import Alert from '@common/components/Alert'
import AmbireLogoHorizontal from '@common/components/AmbireLogoHorizontal'
import BottomSheet from '@common/components/BottomSheet'
import ModalHeader from '@common/components/BottomSheet/ModalHeader/ModalHeader'
import NetworkIcon from '@common/components/NetworkIcon'
import Text from '@common/components/Text'
import useTheme from '@common/hooks/useTheme'
import useToast from '@common/hooks/useToast'
import spacings from '@common/styles/spacings'
import flexbox from '@common/styles/utils/flexbox'
import useHover, { AnimatedPressable } from '@web/hooks/useHover'
import useKeystoreControllerState from '@web/hooks/useKeystoreControllerState'
import useNetworksControllerState from '@web/hooks/useNetworksControllerState'
import useSelectedAccountControllerState from '@web/hooks/useSelectedAccountControllerState'
import { getUiType } from '@web/utils/uiType'

import { SelectValue } from '@common/components/Select/types'
import useSwapAndBridgeControllerState from '@web/hooks/useSwapAndBridgeControllerState'
import { getIsNetworkSupported } from '@ambire-common/libs/swapAndBridge/swapAndBridge'
import NotSupportedNetworkTooltip from '@web/modules/swap-and-bridge/components/NotSupportedNetworkTooltip'
import Select from '@common/components/Select'
import { addressToHumanInterop } from '../../../erc7930'
import getStyles from './styles'

interface Props {
  modalRef: any
  handleClose: () => void
}

const { isPopup } = getUiType()

const ReceiveModal: FC<Props> = ({ modalRef, handleClose }) => {
  const { account } = useSelectedAccountControllerState()
  const { networks } = useNetworksControllerState()
  const { keys } = useKeystoreControllerState()
  const { t } = useTranslation()
  const { styles, theme } = useTheme(getStyles)
  const [bindAnim, animStyle] = useHover({ preset: 'opacityInverted' })
  const qrCodeRef: any = useRef(null)
  const { addToast } = useToast()
  const [qrCodeError, setQrCodeError] = useState<string | boolean | null>(null)
  const isViewOnly = getIsViewOnly(keys, account?.associatedKeys || [])
  const { supportedChainIds } = useSwapAndBridgeControllerState()

  const fromNetworkOptions: SelectValue[] = useMemo(
    () =>
      networks.map((n) => {
        const tooltipId = `network-${n.chainId}-not-supported-tooltip`
        const isNetworkSupported = getIsNetworkSupported(supportedChainIds, n)

        return {
          value: String(n.chainId),
          extraSearchProps: [n.name],
          disabled: !isNetworkSupported,
          label: (
            <>
              <Text weight="medium" dataSet={{ tooltipId }} style={flexbox.flex1} numberOfLines={1}>
                {n.name}
              </Text>
              {!isNetworkSupported && (
                <NotSupportedNetworkTooltip tooltipId={tooltipId} network={n} />
              )}
            </>
          ),
          icon: (
            <NetworkIcon
              key={n.chainId.toString()}
              id={n.chainId.toString()}
              style={{ backgroundColor: theme.primaryBackground }}
              size={28}
            />
          )
        }
      }),
    [networks, supportedChainIds, theme.primaryBackground]
  )

  const [selectedChainId, setSelectedChainId] = useState<number>(
    Number(fromNetworkOptions[0].value)
  )

  const interopAddress = useMemo(() => {
    return addressToHumanInterop(account?.addr || '', {
      namespace: 'eip155',
      id: selectedChainId?.toString()
    })
  }, [account?.addr, selectedChainId])

  const handleCopyAddress = () => {
    if (!account) return

    Clipboard.setStringAsync(account.addr)
    addToast(t('Address copied to clipboard!') as string, { timeout: 2500 })
  }

  const handleSetToNetworkValue = useCallback((networkOption: SelectValue) => {
    setSelectedChainId(Number(networkOption.value))
  }, [])

  const getFromNetworkSelectValue = useMemo(() => {
    const network = networks.find((n) => Number(n.chainId) === selectedChainId)
    if (!network) return fromNetworkOptions[0]

    return fromNetworkOptions.filter((opt) => opt.value === String(network.chainId))[0]
  }, [networks, selectedChainId, fromNetworkOptions])

  return (
    <BottomSheet
      id="receive-assets-modal"
      type="modal"
      sheetRef={modalRef}
      backgroundColor="primaryBackground"
      containerInnerWrapperStyles={flexbox.alignCenter}
      closeBottomSheet={handleClose}
    >
      <ModalHeader handleClose={handleClose} withBackButton={isPopup} title="Receive Assets" />
      <View style={styles.content}>
        <View style={styles.qrCodeContainer}>
          {!!account && !qrCodeError && (
            <View style={styles.qrCode}>
              <QRCode
                value={interopAddress}
                size={160}
                quietZone={10}
                getRef={qrCodeRef}
                onError={() => setQrCodeError(t('Failed to load QR code!') as string)}
              />
            </View>
          )}
          {!!qrCodeError && (
            <Text appearance="errorText" weight="medium">
              {t('Failed to display QR code.')}
            </Text>
          )}
        </View>
        <View style={isPopup ? spacings.mb : spacings.mbXl}>
          <AnimatedPressable
            style={[styles.accountAddress, isViewOnly ? spacings.mbSm : spacings.mb0, animStyle]}
            onPress={handleCopyAddress}
            {...bindAnim}
          >
            <Text selectable numberOfLines={1} fontSize={12} ellipsizeMode="middle" weight="medium">
              {interopAddress}
            </Text>
          </AnimatedPressable>
          {isViewOnly ? (
            <Alert
              style={{
                maxWidth: 400,
                marginHorizontal: 'auto'
              }}
              type="warning"
              title={t('Selected account is view only.')}
            />
          ) : null}
        </View>

        <View style={styles.supportedNetworksContainer}>
          {/* <Text weight="regular" fontSize={14} style={styles.supportedNetworksTitle}>
            {t('Network')}
          </Text> */}
          <Select
            setValue={handleSetToNetworkValue}
            containerStyle={{ ...spacings.mb0, width: 215 }}
            options={fromNetworkOptions}
            size="sm"
            value={getFromNetworkSelectValue}
            selectStyle={{
              backgroundColor: '#54597A14',
              borderWidth: 0,
              width: '100%',
              ...spacings.pr,
              ...spacings.plTy
            }}
          />
        </View>
      </View>
      <AmbireLogoHorizontal />
    </BottomSheet>
  )
}

export default React.memo(ReceiveModal)
