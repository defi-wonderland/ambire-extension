import React from 'react'
import Svg, { Path } from 'react-native-svg'

import { LegendsSvgProps } from '@legends/types/svg'

const DisconnectIcon: React.FC<LegendsSvgProps & { onClick?: () => void }> = ({
  width = 18,
  height = 16,
  ...rest
}) => (
  <Svg width={width} height={height} viewBox="0 0 20 18" fill="none" {...rest}>
    <Path
      d="M10.1837 9L18.2163 9M16.649 11.2925L19 9L16.649 6.70746M13.6122 3.74627L12.6327 2.79104C10.1837 0.402985 8.22449 0.402985 5.77551 2.79104L2.83673 5.65672C0.387755 8.04478 0.387755 9.95522 2.83673 12.3433L5.77551 15.209C8.22449 17.597 10.1837 17.597 12.6327 15.209L13.6122 14.2537"
      stroke="#54597A"
      strokeOpacity="0.5"
      strokeWidth="2"
      strokeLinecap="round"
      strokeLinejoin="round"
    />
  </Svg>
)

export default DisconnectIcon
