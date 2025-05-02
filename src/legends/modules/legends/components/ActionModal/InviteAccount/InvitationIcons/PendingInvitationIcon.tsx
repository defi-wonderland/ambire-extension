import React from 'react'
import Svg, { Circle, Path, SvgProps } from 'react-native-svg'

const PendingInvitationIcon: React.FC<SvgProps> = ({ width = 16, height = 16, ...rest }) => (
  <Svg width={width} height={height} viewBox="0 0 16 16" fill="none" {...rest}>
    <Circle cx="8" cy="8" r="8" fill="#FAD174" />
    <Path
      d="M10.9691 10.5488L8.48908 9.07184C8.26065 8.91898 8.0709 8.71509 7.93484 8.47628C7.79877 8.23747 7.72011 7.97028 7.70508 7.69584V4.40723"
      stroke="#191A1F"
      strokeWidth="2"
      strokeLinecap="round"
      strokeLinejoin="round"
    />
  </Svg>
)

export default React.memo(PendingInvitationIcon)
