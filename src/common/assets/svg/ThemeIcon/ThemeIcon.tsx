import React from 'react'
import Svg, { G, Path, SvgProps } from 'react-native-svg'

import useTheme from '@common/hooks/useTheme'

const ThemeIcon: React.FC<SvgProps> = ({ width = 26, height = 26, color, ...rest }) => {
  const { theme } = useTheme()
  return (
    <Svg width={width} height={height} viewBox="0 0 25.75 25.751" {...rest}>
      <G transform="translate(749.284 595.751) rotate(-180)">
        <Path
          d="M9.7,13.26h0A10.494,10.494,0,0,1,2.851,9.951,10.286,10.286,0,0,1,.15,1.09,7.8,7.8,0,0,1,11.93,7.8,7.757,7.757,0,0,1,9.7,13.26Z"
          transform="translate(732.155 575.201)"
          fill="none"
          stroke={color || theme.primaryBackgroundInverted}
          strokeLinecap="round"
          strokeLinejoin="round"
          strokeWidth="1.5"
        />
        <Path
          d="M17.587,6.4l.982-.97ZM10,3.4v0ZM22,14h0Z"
          transform="translate(726.284 569)"
          fill="none"
          stroke={color || theme.primaryBackgroundInverted}
          strokeLinecap="round"
          strokeLinejoin="round"
          strokeWidth="2"
        />
        <Path
          d="M12,0A12,12,0,1,1,0,12C0,8.851,8.52,0,12,0Z"
          transform="translate(724.284 571)"
          fill="none"
        />
        <Path
          d="M2.035,93.838a11.829,11.829,0,0,0,21.353,6.021c.925-1.261.429-2.1-1.117-1.818a10.518,10.518,0,0,1-12.4-10.2,10.167,10.167,0,0,1,.846-4.146c.609-1.409-.124-2.079-1.534-1.477A11.708,11.708,0,0,0,2.035,93.838Z"
          transform="translate(722.282 490.277)"
          fill="none"
          stroke={color || theme.primaryBackgroundInverted}
          strokeLinecap="round"
          strokeLinejoin="round"
          strokeWidth="1.5"
        />
      </G>
    </Svg>
  )
}

export default React.memo(ThemeIcon)
