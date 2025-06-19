import React from 'react'
import Svg, { Path, SvgProps } from 'react-native-svg'

import useTheme from '@common/hooks/useTheme'

const SwapAndBridgeIcon: React.FC<SvgProps> = ({
  width = 70,
  height = 26,
  color,
  strokeWidth = '1.5',
  ...rest
}) => {
  const { theme } = useTheme()
  return (
    <Svg width={width} height={height} viewBox="0 0 64 26" {...rest}>
      <Path fill="none" d="M26 0v26H0V0z" />
      <Path
        stroke={color || theme.iconSecondary}
        strokeLinecap="round"
        strokeWidth={strokeWidth}
        fill="none"
        d="M4.453 13.944v-1.715a2 2 0 0 1 2.253-2.15h10.355l-5.002-4.814"
      />
      <Path
        stroke={color || theme.iconSecondary}
        strokeLinecap="round"
        strokeWidth={strokeWidth}
        fill="none"
        d="M21.539 12.055c0 .195.007 1.3 0 1.716a2 2 0 0 1-2.253 2.15H8.939l5 4.813"
      />
      <Path fill="none" d="M25.999 0v26h-26V0z" />
      <Path
        stroke={color || theme.iconSecondary}
        strokeLinecap="round"
        strokeWidth={strokeWidth}
        fill="none"
        d="M4.452 13.944v-1.715a2 2 0 0 1 2.253-2.15H17.06l-5.002-4.814"
      />
      <Path
        stroke={color || theme.iconSecondary}
        strokeLinecap="round"
        strokeWidth={strokeWidth}
        fill="none"
        d="M21.538 12.055c0 .195.007 1.3 0 1.716a2 2 0 0 1-2.253 2.15H8.938l5 4.813"
      />
      <Path fill="none" d="M38 26V0h26v26z" />
      <Path
        stroke={color || theme.iconSecondary}
        strokeLinecap="round"
        strokeWidth={strokeWidth}
        fill="none"
        d="M48.887 20.966v-12.2l-5.352 5.357"
      />
      <Path
        stroke={color || theme.iconSecondary}
        strokeLinecap="round"
        strokeWidth={strokeWidth}
        fill="none"
        d="M53.112 5.033v12.2l5.352-5.357"
      />
      <Path stroke={color || theme.iconSecondary} fill="none" d="M32.499 2v22" />
    </Svg>
  )
}

export default React.memo(SwapAndBridgeIcon)
