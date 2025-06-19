import React from 'react'
import Svg, { G, Path, SvgProps } from 'react-native-svg'

import useTheme from '@common/hooks/useTheme'

const ReceiveIcon: React.FC<SvgProps> = ({ width = 26, height = 26, color, ...rest }) => {
  const { theme } = useTheme()
  return (
    <Svg width={width} height={height} fill="none" viewBox="0 0 26 26" {...rest}>
      <G fill="none">
        <Path d="M26.299 0v26h-26V0z" />
        <G stroke={color || theme.iconSecondary} strokeLinecap="round" strokeWidth="1.5">
          <Path d="m14.713 8.532-8.815 8.815.004-7.738" />
          <Path d="m20.698 8.654-8.815 8.815 7.737-.003" />
        </G>
      </G>
    </Svg>
  )
}

export default React.memo(ReceiveIcon)
