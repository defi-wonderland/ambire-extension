import React from 'react'
import Svg, { Path, Rect, SvgProps } from 'react-native-svg'

const OptimismLogo: React.FC<SvgProps> = ({ width = 32, height = 32, ...rest }) => (
  <Svg width={width} height={height} fill="none" viewBox="0 0 32 32" {...rest}>
    <Path fill="#fff" d="M1 15.75a14.75 14.75 0 1 1 29.5 0 14.75 14.75 0 0 1-29.5 0Z" />
    <Rect
      x="1.25"
      y="1.25"
      width="30"
      height="30"
      rx="12.75"
      stroke="#6A6F86"
      strokeOpacity="0.3"
      strokeWidth="1.5"
    />
    <Path
      fill="#FF0420"
      d="M15.75 1a14.75 14.75 0 1 0 0 29.5 14.75 14.75 0 0 0 0-29.5Zm0 22.26v6.16a10.59 10.59 0 0 1 0-21.18V2.08a10.59 10.59 0 0 1 0 21.18Zm5.078-7.557v.094a10.925 10.925 0 0 0-5.03 5.031h-.095a10.927 10.927 0 0 0-5.031-5.03v-.095a10.925 10.925 0 0 0 5.03-5.031h.095a10.925 10.925 0 0 0 5.031 5.03Z"
    />
    <Path
      stroke="#191A1F"
      d="M30.5 15.75C30.5 7.604 23.896 1 15.75 1S1 7.604 1 15.75 7.604 30.5 15.75 30.5 30.5 23.896 30.5 15.75Z"
    />
  </Svg>
)

export default React.memo(OptimismLogo)
