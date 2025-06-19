import React from 'react'
import Svg, { G, Path, SvgProps } from 'react-native-svg'

const ValueIcon: React.FC<SvgProps> = ({ width = 14, height = 20, color = '#767dad', ...rest }) => (
  <Svg width={width} height={height} viewBox="0 0 13.5 19.962" {...rest}>
    <G transform="translate(-4.75 -1.303)">
      <Path
        d="M17.5,12.7v3.415c0,2.88-2.686,5.215-6,5.215s-6-2.335-6-5.215V12.7c0,2.88,2.686,4.938,6,4.938S17.5,15.583,17.5,12.7Z"
        transform="translate(0 -0.819)"
        fill="none"
        stroke={color}
        strokeLinecap="round"
        strokeLinejoin="round"
        strokeWidth="1.5"
      />
      <Path
        d="M17.5,7.268a4.342,4.342,0,0,1-.637,2.28A6.169,6.169,0,0,1,11.5,12.207,6.169,6.169,0,0,1,6.137,9.548,4.342,4.342,0,0,1,5.5,7.268,4.887,4.887,0,0,1,7.254,3.585,6.436,6.436,0,0,1,11.5,2.053a6.478,6.478,0,0,1,4.246,1.523A4.921,4.921,0,0,1,17.5,7.268Z"
        fill="none"
        stroke={color}
        strokeLinecap="round"
        strokeLinejoin="round"
        strokeWidth="1.5"
      />
      <Path
        d="M17.5,7.268v4.615c0,2.88-2.686,4.938-6,4.938s-6-2.058-6-4.938V7.268c0-2.88,2.686-5.215,6-5.215a6.478,6.478,0,0,1,4.246,1.523A4.921,4.921,0,0,1,17.5,7.268Z"
        fill="none"
        stroke={color}
        strokeLinecap="round"
        strokeLinejoin="round"
        strokeWidth="1.5"
      />
    </G>
  </Svg>
)

export default React.memo(ValueIcon)
