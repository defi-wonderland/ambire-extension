import React from 'react'
import Svg, { Path } from 'react-native-svg'

import { LegendsSvgProps } from '@legends/types/svg'

const ZapIcon: React.FC<LegendsSvgProps> = ({ width = 18, height = 31 }) => {
  return (
    <Svg width={width} height={height} viewBox="0 0 18 31" fill="none">
      <Path
        d="M0 18.5592L13.4697 0L9.30337 12.0329H18L4.48989 31L8.85843 18.5592H0Z"
        fill="#F7BA2F"
      />
    </Svg>
  )
}

export default ZapIcon
