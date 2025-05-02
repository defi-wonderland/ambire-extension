import React from 'react'
import { ColorValue, View } from 'react-native'
import { SvgProps } from 'react-native-svg'

import Text from '@common/components/Text'
import { useTranslation } from '@common/config/localization'
import spacings from '@common/styles/spacings'
import { BORDER_RADIUS_PRIMARY } from '@common/styles/utils/common'
import flexboxStyles from '@common/styles/utils/flexbox'

const PendingBadge = ({
  amount,
  amountFormatted,
  label,
  Icon,
  backgroundColor,
  textColor
}: {
  amount: bigint
  amountFormatted: string
  label: string
  Icon: React.ComponentType<SvgProps>
  backgroundColor: ColorValue
  textColor: ColorValue
}) => {
  const { t } = useTranslation()

  return (
    <View
      style={[
        spacings.pvMi,
        spacings.phTy,
        spacings.mbMi,
        flexboxStyles.alignSelfStart,
        flexboxStyles.alignCenter,
        flexboxStyles.directionRow,
        {
          borderRadius: BORDER_RADIUS_PRIMARY,
          backgroundColor
        }
      ]}
    >
      <Text selectable color={textColor} fontSize={13} numberOfLines={1} style={[spacings.mrTy]}>
        {t(`${amount > 0n ? '+' : ''}${amountFormatted} ${label}`)}
      </Text>
      <Icon color={textColor} width={13} height={13} />
    </View>
  )
}

export default React.memo(PendingBadge)
