import React from 'react'
import Svg, { Path, Rect, SvgProps } from 'react-native-svg'

interface Props extends SvgProps {
  width?: number
  height?: number
}

const EthereumLogo: React.FC<Props> = ({ width = 32, height = 32, ...rest }) => (
  <Svg width={width} height={height} viewBox="0 0 28 28" fill="none" {...rest}>
    <Rect x="2" y="2" width="24" height="24" rx="12" fill="#191A1F" />
    <Rect
      x="1.25"
      y="1.25"
      width="25.5"
      height="25.5"
      rx="12.75"
      stroke="#6A6F86"
      strokeOpacity="0.3"
      strokeWidth="1.5"
    />
    <Path
      fillRule="evenodd"
      clipRule="evenodd"
      d="M14.0122 4L7.83984 14.1855L14.0127 17.8244L20.1437 14.1994L14.0122 4Z"
      fill="#62688F"
    />
    <Path
      fillRule="evenodd"
      clipRule="evenodd"
      d="M14.0127 4V17.824L20.1436 14.199L14.0127 4Z"
      fill="#454A75"
    />
    <Path
      fillRule="evenodd"
      clipRule="evenodd"
      d="M14.0122 4L7.83984 14.1855L14.0127 11.3863L20.1437 14.1994L14.0122 4Z"
      fill="#8A92B2"
    />
    <Path
      fillRule="evenodd"
      clipRule="evenodd"
      d="M14.0127 4V11.3863L20.1436 14.1994L14.0127 4Z"
      fill="#62688F"
    />
    <Path
      fillRule="evenodd"
      clipRule="evenodd"
      d="M7.86719 15.3521L14.0117 24L20.1598 15.3513L14.0121 18.9802L7.86719 15.3521Z"
      fill="#8A92B2"
    />
    <Path
      fillRule="evenodd"
      clipRule="evenodd"
      d="M14.0127 24L20.1608 15.3513L14.0131 18.9802L14.0127 24Z"
      fill="#62688F"
    />
  </Svg>
)

export default React.memo(EthereumLogo)
