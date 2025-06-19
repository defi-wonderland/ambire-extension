import React from 'react'
import Svg, { G, Path, SvgProps } from 'react-native-svg'

const AmountIcon: React.FC<SvgProps> = ({
  width = 22,
  height = 14,
  color = '#767dad',
  ...rest
}) => (
  <Svg width={width} height={height} viewBox="0 0 22 14" {...rest}>
    <G transform="translate(-0.939 -6.027)">
      <Path
        d="M10.962,11.981h1.991a1.991,1.991,0,1,0,0-3.981H9.967a1.67,1.67,0,0,0-1.393.6L3,13.972"
        transform="translate(-0.005 -0.005)"
        fill="none"
        stroke={color}
        strokeLinecap="round"
        strokeLinejoin="round"
        strokeWidth="1.5"
      />
      <Path
        d="M7,17.948l1.592-1.393a1.67,1.67,0,0,1,1.393-.6h3.981a3.614,3.614,0,0,0,2.787-1.194l4.578-4.379a1.992,1.992,0,0,0-2.737-2.9l-4.18,3.882"
        transform="translate(-0.024)"
        fill="none"
        stroke={color}
        strokeLinecap="round"
        strokeLinejoin="round"
        strokeWidth="1.5"
      />
      <Path
        d="M2,13l5.972,5.972"
        transform="translate(0 -0.029)"
        fill="none"
        stroke={color}
        strokeLinecap="round"
        strokeLinejoin="round"
        strokeWidth="1.5"
      />
    </G>
  </Svg>
)

export default React.memo(AmountIcon)
