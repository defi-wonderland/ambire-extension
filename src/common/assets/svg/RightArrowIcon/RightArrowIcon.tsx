import React from 'react'
import Svg, { Path } from 'react-native-svg'

import { iconColors } from '@common/styles/themeConfig'
import { LegendsSvgProps } from '@legends/types/svg'

interface Props extends LegendsSvgProps {
  width?: number
  height?: number
  weight?: string
}

const RightArrowIcon: React.FC<Props> = ({
  width = 8,
  height = 15,
  color = iconColors.primary,
  weight = '1.5',
  ...rest
}) => (
  <Svg width={width} height={height} viewBox="0 0 8.467 14.879" {...rest}>
    <Path
      d="M-5813.015-21729.285l-6.348,6.373,6.348,6.385"
      transform="translate(-5811.954 -21715.467) rotate(180)"
      fill="none"
      stroke={color}
      strokeLinecap="round"
      strokeWidth={weight}
    />
  </Svg>
)

export default RightArrowIcon
