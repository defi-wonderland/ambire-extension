import React from 'react'
import Svg, { G, Path, SvgProps } from 'react-native-svg'

import useTheme from '@common/hooks/useTheme'

const SendIcon: React.FC<SvgProps> = ({
  width = 26,
  height = 26,
  color,
  strokeWidth = '1.5',
  ...rest
}) => {
  const { theme } = useTheme()
  return (
    <Svg width={width} height={height} fill="none" viewBox="0 0 26 26" {...rest}>
      <G fill="none">
        <Path d="M0 26V0h26v26z" />
        <G stroke={color || theme.iconSecondary} strokeLinecap="round" strokeWidth={strokeWidth}>
          <Path d="M11.585 17.467 20.4 8.652l-.004 7.738" />
          <Path d="m5.6 17.345 8.815-8.815-7.737.003" />
        </G>
      </G>
    </Svg>
  )
}

export default React.memo(SendIcon)
