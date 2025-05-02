import React, { useEffect, useMemo, useRef } from 'react'
import { View } from 'react-native'

import { Account } from '@ambire-common/interfaces/account'
import { SelectedAccountPortfolio } from '@ambire-common/interfaces/selectedAccount'
import formatDecimals from '@ambire-common/utils/formatDecimals/formatDecimals'
import GasTankIcon from '@common/assets/svg/GasTankIcon'
import Text from '@common/components/Text'
import Tooltip from '@common/components/Tooltip'
import { useTranslation } from '@common/config/localization'
import useTheme from '@common/hooks/useTheme'
import spacings from '@common/styles/spacings'
import common from '@common/styles/utils/common'
import flexbox from '@common/styles/utils/flexbox'
import { calculateGasTankBalance } from '@common/utils/calculateGasTankBalance'
import { AnimatedPressable, useCustomHover } from '@web/hooks/useHover'

import { NEUTRAL_BACKGROUND_HOVERED } from '../../screens/styles'

type Props = {
  onPress: () => void
  onPosition: (position: { x: number; y: number; width: number; height: number }) => void
  portfolio: SelectedAccountPortfolio
  account: Account | null
  hasGasTank: boolean
}

const GasTankButton = ({ onPress, onPosition, portfolio, account, hasGasTank }: Props) => {
  const { t } = useTranslation()
  const buttonRef = useRef(null)
  const { theme } = useTheme()

  const [bindGasTankBtnAim, removeTankBtnStyle] = useCustomHover({
    property: 'backgroundColor',
    values: { from: NEUTRAL_BACKGROUND_HOVERED, to: '#14183380' } // TODO: Remove hardcoded hex
  })

  const gasTankTotalBalanceInUsd = useMemo(
    () => calculateGasTankBalance(portfolio, account, hasGasTank, 'usd'),
    [account, hasGasTank, portfolio]
  )

  useEffect(() => {
    const measureButton = () => {
      if (buttonRef.current) {
        // @ts-ignore
        buttonRef.current.measure(
          (fx: number, fy: number, width: number, height: number, px: number, py: number) => {
            onPosition({ x: px, y: py, width, height })
          }
        )
      }
    }

    measureButton()

    const handleResize = () => {
      measureButton()
    }

    window.addEventListener('resize', handleResize)

    return () => {
      window.removeEventListener('resize', handleResize)
    }
  }, [onPosition])

  return (
    <View>
      <AnimatedPressable
        ref={buttonRef}
        onPress={hasGasTank ? onPress : () => {}}
        style={{
          ...flexbox.directionRow,
          ...flexbox.center,
          ...spacings.phTy,
          ...common.borderRadiusPrimary,
          ...removeTankBtnStyle,
          ...(gasTankTotalBalanceInUsd === 0 && {
            borderWidth: 1,
            borderColor: theme.primaryLight
          }),
          ...{ cursor: !hasGasTank ? 'default' : 'pointer' }
        }}
        {...bindGasTankBtnAim}
        testID="dashboard-gas-tank-button"
      >
        <GasTankIcon width={20} color="white" />
        {hasGasTank ? (
          gasTankTotalBalanceInUsd !== 0 ? (
            <>
              <Text style={[spacings.mlTy]} color="white" weight="number_bold" fontSize={12}>
                {formatDecimals(gasTankTotalBalanceInUsd, 'value')}
              </Text>
              <Text style={[spacings.mlTy, { opacity: 0.57 }]} fontSize={12} color="white">
                {t('on Gas Tank')}
              </Text>
            </>
          ) : (
            <Text style={[spacings.mhTy]} color="white" weight="number_bold" fontSize={12}>
              {t('Top up Gas Tank')}
            </Text>
          )
        ) : (
          // @ts-ignore
          <View dataSet={{ tooltipId: 'gas-tank-soon' }}>
            <Text style={[spacings.mhTy]} color="white" weight="number_bold" fontSize={12}>
              {t('Gas Tank Soon')}
            </Text>
          </View>
        )}
      </AnimatedPressable>
      <Tooltip content="Not available for hardware wallets yet" id="gas-tank-soon" />
    </View>
  )
}

export default React.memo(GasTankButton)
