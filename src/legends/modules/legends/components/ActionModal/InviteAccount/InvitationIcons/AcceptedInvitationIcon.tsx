import React from 'react'
import Svg, { Circle, Path, SvgProps } from 'react-native-svg'

const AcceptedInvitationIcon: React.FC<SvgProps> = ({ width = 16, height = 16, ...rest }) => (
  <Svg width={width} height={height} viewBox="0 0 16 16" fill="none" {...rest}>
    <Circle cx="8" cy="8" r="8" fill="#54D1B6" />
    <Path
      d="M5 8.35102L7.43243 10.8L12.2 6"
      stroke="#191A1F"
      strokeWidth="2"
      strokeLinecap="round"
    />
  </Svg>
)

export default React.memo(AcceptedInvitationIcon)
