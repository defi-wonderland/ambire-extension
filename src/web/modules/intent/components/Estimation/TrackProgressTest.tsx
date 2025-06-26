import React, { FC, useCallback, useMemo } from 'react'
import { useTranslation } from 'react-i18next'
import { Pressable, View } from 'react-native'

import { getIsBridgeRoute } from '@ambire-common/libs/swapAndBridge/swapAndBridge'
import { getBenzinUrlParams } from '@ambire-common/utils/benzin'
import CheckIcon2 from '@common/assets/svg/CheckIcon2'
import OpenIcon from '@common/assets/svg/OpenIcon'
import RightArrowIcon from '@common/assets/svg/RightArrowIcon'
import AlertVertical from '@common/components/AlertVertical'
import Button from '@common/components/Button'
import Spinner from '@common/components/Spinner'
import Text from '@common/components/Text'
import useNavigation from '@common/hooks/useNavigation'
import useTheme from '@common/hooks/useTheme'
import useToast from '@common/hooks/useToast'
import useWindowSize from '@common/hooks/useWindowSize'
import Header from '@common/modules/header/components/Header'
import { WEB_ROUTES } from '@common/modules/router/constants/common'
import spacings from '@common/styles/spacings'
import flexbox from '@common/styles/utils/flexbox'
import text from '@common/styles/utils/text'
import { TabLayoutContainer, TabLayoutWrapperMainContent } from '@web/components/TabLayoutWrapper'
import { getTabLayoutPadding } from '@web/components/TabLayoutWrapper/TabLayoutWrapper'
import { openInTab } from '@web/extension-services/background/webapi/tab'
import useBackgroundService from '@web/hooks/useBackgroundService'
import useSwapAndBridgeControllerState from '@web/hooks/useSwapAndBridgeControllerState'
import { getUiType } from '@web/utils/uiType'
import useTransactionControllerState from '@web/hooks/useTransactionStatecontroller'
import useMainControllerState from '@web/hooks/useMainControllerState'
import formatDecimals from '@ambire-common/utils/formatDecimals/formatDecimals'
import formatTime from '@common/utils/formatTime'
import { formatUnits } from 'ethers'
import RouteStepsToken from '../../../swap-and-bridge/components/RouteStepsToken'
import BackgroundShapes from '../../../swap-and-bridge/components/Estimation/BackgroundShapes'
import useSelectedAccountControllerState from '@web/hooks/useSelectedAccountControllerState'

const { isActionWindow } = getUiType()

type Props = {
  handleClose: () => void
}

const mockQuote = {
  protocol: 'across',
  action: 'crossChainTransfer',
  fee: {
    total: '0.000767',
    percent: '0.767744091431996'
  },
  isAmountTooLow: false,
  output: {
    inputTokenAddress: '0x1c7D4B196Cb0C7B01d743Fbc6116a902379C7238',
    outputTokenAddress: '0x036CbD53842c5426634e7929541eC2318f3dCF7e',
    inputAmount: '1000000',
    outputAmount: '999232000000000000' // por ejemplo: 0.999232 DAI en 18 decimales
  },
  openParams: {
    action: 'crossChainTransfer',
    params: {
      inputChainId: 11155111,
      outputChainId: 84532,
      inputTokenAddress: '0x1c7D4B196Cb0C7B01d743Fbc6116a902379C7238',
      outputTokenAddress: '0x036CbD53842c5426634e7929541eC2318f3dCF7e',
      inputAmount: '1000000',
      outputAmount: '999232000000000000',
      sender: '0xd119cF21B75D4834c2c21584DB03eA465c14cc74',
      recipient: '0x63BF6DcBd66F7843050B8BA781C2B978C9797B92',
      fillDeadline: 1750914982,
      orderData: '0x0000000000000000000000000000000000000000000000000000000000000020...',
      orderDataType: '0x9df4b782e7bbc178b3b93bfe8aafb909e84e39484d7f3c59f400f1b4691f85e2'
    }
  }
}

const TrackProgressTest: FC<Props> = ({ handleClose }) => {
  const { theme } = useTheme()
  const { t } = useTranslation()
  const { addToast } = useToast()
  const { navigate } = useNavigation()
  const { dispatch } = useBackgroundService()

  const { portfolio } = useSelectedAccountControllerState()
  const { maxWidthSize } = useWindowSize()
  const paddingHorizontalStyle = useMemo(() => getTabLayoutPadding(maxWidthSize), [maxWidthSize])
  const { transactionType, intent } = useTransactionControllerState()
  const { quote: quotes, transactions } = intent
  // Quotes and transactions at this time were already cleared, so they are empty

  const quote = mockQuote
  const { inputTokenAddress, outputTokenAddress, inputAmount, outputAmount } = quote.output

  const fromChainId = quote.openParams.params.inputChainId
  const toChainId = quote.openParams.params.outputChainId

  const getTokenByAddress = (tokenAddress: string, chainId: string) => {
    if (!tokenAddress || !chainId) return

    return portfolio?.tokens?.find(
      (token) => token.address.toLowerCase() === tokenAddress.toLowerCase()
    )
  }

  const fromToken = getTokenByAddress(inputTokenAddress, String(fromChainId)) || {}
  const toToken = getTokenByAddress(outputTokenAddress, String(toChainId)) || {}

  const onPrimaryButtonPress = useCallback(() => {
    if (isActionWindow) {
      dispatch({
        type: 'SWAP_AND_BRIDGE_CONTROLLER_CLOSE_SIGNING_ACTION_WINDOW'
      })
    } else {
      navigate(WEB_ROUTES.dashboard)
    }
  }, [dispatch, navigate])

  const handleOpenExplorer = useCallback(async () => {
    try {
      await openInTab('https://benzin.ambire.com/', false)
    } catch {
      addToast('Error opening explorer', { type: 'error' })
    }
  }, [addToast])

  return (
    <TabLayoutContainer
      backgroundColor={theme.primaryBackground}
      header={
        <Header
          backgroundColor="primaryBackground"
          displayBackButtonIn="never"
          mode="title"
          customTitle={
            <Text fontSize={20} weight="medium">
              {t(`${transactionType}`)}
            </Text>
          }
          withAmbireLogo
        />
      }
      withHorizontalPadding={false}
      footer={null}
      style={{ ...flexbox.alignEnd, ...spacings.pb }}
    >
      <TabLayoutWrapperMainContent
        contentContainerStyle={{
          ...spacings.pv0,
          ...paddingHorizontalStyle,
          ...flexbox.flex1
        }}
        withScroll={false}
      >
        <View style={[flexbox.flex1, flexbox.justifyCenter]}>
          <View
            style={[
              flexbox.alignCenter,
              flexbox.justifyCenter,
              isActionWindow ? {} : flexbox.flex1,
              isActionWindow ? spacings.pt0 : spacings.pt2Xl
            ]}
          >
            <RouteStepsToken
              uri={fromToken.icon}
              chainId={BigInt(fromChainId)}
              address={inputTokenAddress}
              symbol={fromToken.symbol}
              amount={formatDecimals(Number(inputAmount), 'amount')}
            />

            <RightArrowIcon />

            <RouteStepsToken
              uri={toToken.icon}
              chainId={BigInt(toChainId)}
              address={outputTokenAddress}
              symbol={toToken.symbol}
              amount={formatDecimals(Number(outputAmount), 'amount')}
              isLast
            />
          </View>
          {!isActionWindow && (
            <View
              style={{
                height: 1,
                backgroundColor: theme.secondaryBorder,
                ...spacings.mvLg
              }}
            />
          )}
          <View
            style={[
              flexbox.directionRow,
              flexbox.alignCenter,
              !isActionWindow ? flexbox.justifySpaceBetween : flexbox.justifyCenter,
              isActionWindow && spacings.pt2Xl
            ]}
          >
            {!isActionWindow ? (
              <Button
                onPress={handleClose}
                hasBottomSpacing={false}
                type="secondary"
                text={t('Start a new swap?')}
              />
            ) : (
              <View />
            )}
            <Button
              onPress={onPrimaryButtonPress}
              hasBottomSpacing={false}
              style={{ width: isActionWindow ? 240 : 160 }}
              text={t('Close')}
            />
          </View>
        </View>
      </TabLayoutWrapperMainContent>
    </TabLayoutContainer>
  )
}

export default TrackProgressTest
