import { formatUnits } from 'ethers'
import React, { FC, useCallback, useMemo } from 'react'
import { useTranslation } from 'react-i18next'
import { View } from 'react-native'

import { getIsBridgeRoute } from '@ambire-common/libs/swapAndBridge/swapAndBridge'
import { getBenzinUrlParams } from '@ambire-common/utils/benzin'
import formatDecimals from '@ambire-common/utils/formatDecimals/formatDecimals'
import RightArrowIcon from '@common/assets/svg/RightArrowIcon'
import Text from '@common/components/Text'
import useNavigation from '@common/hooks/useNavigation'
import useTheme from '@common/hooks/useTheme'
import { WEB_ROUTES } from '@common/modules/router/constants/common'
import spacings from '@common/styles/spacings'
import flexbox from '@common/styles/utils/flexbox'
import text from '@common/styles/utils/text'
import formatTime from '@common/utils/formatTime'
import useBackgroundService from '@web/hooks/useBackgroundService'
import useSwapAndBridgeControllerState from '@web/hooks/useSwapAndBridgeControllerState'
import TrackProgressWrapper from '@web/modules/sign-account-op/components/OneClick/TrackProgress'
import Completed from '@web/modules/sign-account-op/components/OneClick/TrackProgress/ByStatus/Completed'
import Failed from '@web/modules/sign-account-op/components/OneClick/TrackProgress/ByStatus/Failed'
import InProgress from '@web/modules/sign-account-op/components/OneClick/TrackProgress/ByStatus/InProgress'
import { getUiType } from '@web/utils/uiType'

import RouteStepsToken from '../RouteStepsToken'

const { isActionWindow } = getUiType()

type Props = {
  handleClose: () => void
}

const LIFI_EXPLORER_URL = 'https://scan.li.fi'

const TrackProgress: FC<Props> = ({ handleClose }) => {
  const { t } = useTranslation()
  const { theme } = useTheme()
  const { navigate } = useNavigation()
  const { dispatch } = useBackgroundService()
  const { activeRoutes } = useSwapAndBridgeControllerState()
  const lastCompletedRoute = activeRoutes[activeRoutes.length - 1]
  const steps = lastCompletedRoute?.route?.steps
  const firstStep = steps ? steps[0] : null
  const lastStep = steps ? steps[steps.length - 1] : null
  const fromAsset = firstStep ? firstStep.fromAsset : null
  const toAsset = lastStep ? lastStep.toAsset : null
  const toAssetSymbol = steps ? steps[steps.length - 1].toAsset.symbol : null
  const isSwap = lastCompletedRoute.route && !getIsBridgeRoute(lastCompletedRoute.route)

  const onPrimaryButtonPress = useCallback(() => {
    if (isActionWindow) {
      dispatch({
        type: 'CLOSE_SIGNING_ACTION_WINDOW',
        params: {
          type: 'swapAndBridge'
        }
      })
    } else {
      navigate(WEB_ROUTES.dashboard)
    }
  }, [dispatch, navigate])

  const explorerLink = useMemo(() => {
    if (!isSwap) {
      return `${LIFI_EXPLORER_URL}/tx/${lastCompletedRoute.userTxHash}`
    }
    const toChainId = lastCompletedRoute.route?.toChainId
    if (!toChainId) return

    const { identifiedBy } = lastCompletedRoute

    if (!identifiedBy) return

    return `https://explorer.ambire.com/${getBenzinUrlParams({
      chainId: toChainId,
      txnId: lastCompletedRoute.userTxHash,
      identifiedBy
    })}`
  }, [isSwap, lastCompletedRoute])

  return (
    <TrackProgressWrapper
      title={t('Swap & Bridge')}
      onPrimaryButtonPress={onPrimaryButtonPress}
      secondaryButtonText={t('Start a new swap?')}
      handleClose={handleClose}
    >
      {(!lastCompletedRoute || lastCompletedRoute?.routeStatus === 'in-progress') && (
        <InProgress title={t('Confirming your trade')}>
          {!!fromAsset && !!toAsset && (
            <View
              style={[
                flexbox.directionRow,
                flexbox.justifySpaceBetween,
                { alignItems: 'baseline' },
                spacings.mbLg
              ]}
            >
              <RouteStepsToken
                wrapperStyle={{
                  width: 'auto'
                }}
                uri={fromAsset.icon}
                chainId={BigInt(fromAsset.chainId)}
                address={fromAsset.address}
                symbol={fromAsset.symbol}
                amount={
                  lastCompletedRoute.route?.fromAmount
                    ? formatDecimals(
                        Number(
                          formatUnits(lastCompletedRoute.route?.fromAmount, fromAsset.decimals)
                        ),
                        'amount'
                      )
                    : ''
                }
              />
              <View style={[flexbox.alignCenter, flexbox.justifyCenter]}>
                <View
                  style={{
                    width: 32,
                    height: 32,
                    borderRadius: 16,
                    backgroundColor: theme.secondaryBackground,
                    ...flexbox.alignCenter,
                    ...flexbox.justifyCenter,
                    ...spacings.mhLg,
                    ...spacings.mb2Xl
                  }}
                >
                  <RightArrowIcon />
                </View>
                {!!lastCompletedRoute.route?.serviceTime && (
                  <Text
                    fontSize={12}
                    weight="medium"
                    appearance="secondaryText"
                    style={text.center}
                  >
                    {t('Time: {{time}}', {
                      time:
                        lastCompletedRoute.route.fromChainId !== lastCompletedRoute.route.toChainId
                          ? `~ ${formatTime(lastCompletedRoute.route?.serviceTime)}`
                          : 'instant'
                    })}
                  </Text>
                )}
              </View>
              <RouteStepsToken
                wrapperStyle={{
                  width: 'auto'
                }}
                uri={toAsset.icon}
                chainId={BigInt(toAsset.chainId)}
                address={toAsset.address}
                symbol={toAsset.symbol}
                isLast
                amount={
                  lastCompletedRoute.route?.toAmount
                    ? formatDecimals(
                        Number(formatUnits(lastCompletedRoute.route?.toAmount, toAsset.decimals)),
                        'amount'
                      )
                    : ''
                }
              />
            </View>
          )}
        </InProgress>
      )}

      {lastCompletedRoute?.routeStatus === 'completed' && (
        <Completed
          title={t('Nice trade!')}
          titleSecondary={t('{{symbol}} delivered - like magic.', {
            symbol: toAssetSymbol || 'Token'
          })}
          openExplorerText={isSwap ? t('View swap') : t('View bridge')}
          explorerLink={explorerLink}
        />
      )}

      {lastCompletedRoute?.routeStatus === 'failed' && (
        <Failed
          title={t(isSwap ? 'Swap failed' : 'Bridge failed')}
          errorMessage={`Error: ${lastCompletedRoute.error!}`}
        />
      )}
    </TrackProgressWrapper>
  )
}

export default TrackProgress
