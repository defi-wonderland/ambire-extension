import React, { FC } from 'react'
import { G, Path, Svg, SvgProps } from 'react-native-svg'

import { iconColors } from '@common/styles/themeConfig'

const BatchIcon: FC<SvgProps> = ({
  width = 16,
  height = 16,
  style,
  color = iconColors.primary2
}) => {
  return (
    <Svg viewBox="0 0 16.944 17.555" width={width} height={height} style={style}>
      <G fill="none" stroke={color} strokeLinecap="round" strokeLinejoin="round" strokeWidth="1.5">
        <Path d="m9.339.988 5.062 2.248c1.459.644 1.459 1.707 0 2.351L9.339 7.835a2.934 2.934 0 0 1-2.094 0L2.183 5.587c-1.459-.644-1.459-1.707 0-2.351L7.245.988a2.934 2.934 0 0 1 2.094 0Z" />
        <Path d="M.75 7.921a2.2 2.2 0 0 0 1.2 1.845l5.826 2.591a1.706 1.706 0 0 0 1.39 0l5.826-2.591a2.2 2.2 0 0 0 1.202-1.845" />
        <Path d="M.75 12.211a2.022 2.022 0 0 0 1.2 1.845l5.826 2.591a1.706 1.706 0 0 0 1.39 0l5.826-2.591a2.022 2.022 0 0 0 1.202-1.845" />
      </G>
    </Svg>
  )
}

export default BatchIcon
