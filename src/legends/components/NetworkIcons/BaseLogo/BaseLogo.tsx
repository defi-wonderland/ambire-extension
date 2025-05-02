import React from 'react'
import Svg, { Path, Rect, SvgProps } from 'react-native-svg'

interface Props extends SvgProps {
  width?: number
  height?: number
}

const BaseLogo: React.FC<Props> = ({ width = 32, height = 32, ...rest }) => (
  <Svg width={width} height={height} viewBox="0 0 28 28" fill="none" {...rest}>
    <Rect x="2" y="2" width="24" height="24" rx="12" fill="#2151F5" />
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
      d="M14.0007 24C15.9453 23.9964 17.8469 23.4279 19.4733 22.3639C21.0998 21.2999 22.3808 19.7863 23.1602 18.0079C23.9396 16.2295 24.1836 14.263 23.8624 12.3485C23.5413 10.434 22.6689 8.65418 21.3516 7.2262C20.0344 5.79821 18.3293 4.7838 16.4443 4.30672C14.5593 3.82964 12.576 3.91052 10.7363 4.53949C8.8966 5.16846 7.28005 6.31833 6.08389 7.84881C4.88772 9.37929 4.16364 11.2242 4 13.1585H17.265V14.8415H4C4.21416 17.3413 5.36076 19.6697 7.21281 21.3658C9.06486 23.0618 11.4874 24.002 14.0007 24Z"
      fill="white"
    />
  </Svg>
)

export default React.memo(BaseLogo)
