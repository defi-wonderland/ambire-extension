import React from 'react'
import Svg, { Path, Rect, SvgProps } from 'react-native-svg'

interface Props extends SvgProps {
  width?: number
  height?: number
}

const CloseIcon: React.FC<Props> = ({ width = 32, height = 32, ...rest }) => (
  <Svg width={width} height={height} viewBox="0 0 32 32" fill="none" {...rest}>
    <Rect x="0.5" y="0.5" width={31} height={31} rx="15.5" fill="#6A6F864D" />
    <Path
      d="M11.1733 21L15.24 15.3733L11.4667 10.2H13.56L16.36 14.0933H16.4267L19.2133 10.2H21.24L17.4667 15.3467L21.5333 21H19.3867L16.3467 16.7067H16.2933L13.2267 21H11.1733Z"
      fill="#FFFFFFCC"
    />
  </Svg>
)

export default React.memo(CloseIcon)
