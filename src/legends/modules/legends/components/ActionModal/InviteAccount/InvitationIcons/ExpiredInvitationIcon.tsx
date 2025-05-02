import React from 'react'
import Svg, { Circle, Path, SvgProps } from 'react-native-svg'

const ExpiredInvitationIcon: React.FC<SvgProps> = ({ width = 16, height = 16, ...rest }) => (
  <Svg width={width} height={height} viewBox="0 0 16 16" fill="none" {...rest}>
    <Circle cx="8" cy="8" r="8" fill="#E65A90" />
    <Path d="M5 11L10.76 5" stroke="#191A1F" strokeWidth="2" strokeLinecap="round" />
    <Path d="M11 11L5.24 5" stroke="#191A1F" strokeWidth="2" strokeLinecap="round" />
  </Svg>
)

export default React.memo(ExpiredInvitationIcon)
