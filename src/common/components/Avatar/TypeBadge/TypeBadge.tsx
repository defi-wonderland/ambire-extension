import { nanoid } from 'nanoid'
import React, { FC } from 'react'
import { View } from 'react-native'

import BADGE_PRESETS from '@common/components/BadgeWithPreset/presets'
import Text from '@common/components/Text'
import Tooltip from '@common/components/Tooltip'
import useTheme from '@common/hooks/useTheme'
import { SPACING_MI } from '@common/styles/spacings'

interface Props {
  isSmart: boolean
  size?: 'big' | 'small'
  showTooltip?: boolean
}

const TypeBadge: FC<Props> = ({ isSmart, size, showTooltip = false }) => {
  const { theme } = useTheme()
  const badgePreset = BADGE_PRESETS['smart-account']
  const tooltipId = nanoid(6)

  return isSmart ? (
    <>
      <View
        // @ts-ignore
        dataSet={{ tooltipId }}
        style={{
          position: 'absolute',
          left: size === 'big' ? -SPACING_MI / 2 : -SPACING_MI,
          top: size === 'big' ? -SPACING_MI / 2 : -SPACING_MI,
          paddingHorizontal: 3,
          paddingVertical: 2,
          backgroundColor: theme.successDecorative,
          zIndex: 2,
          borderRadius: 50,
          borderWidth: size === 'big' ? 3 : 2,
          borderColor: theme.primaryBackground
        }}
      >
        <Text color="#fff" weight="semiBold" fontSize={size === 'big' ? 10 : 9}>
          SA
        </Text>
      </View>
      {showTooltip && <Tooltip id={tooltipId} content={badgePreset.tooltipText} />}
    </>
  ) : null
}

export default TypeBadge
