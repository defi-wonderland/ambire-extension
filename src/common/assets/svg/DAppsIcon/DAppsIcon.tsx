import React from 'react'
import Svg, { G, Path, Rect, SvgProps } from 'react-native-svg'

import useTheme from '@common/hooks/useTheme'

const DAppsIcon: React.FC<SvgProps> = ({ width = 26, height = 26, color, ...rest }) => {
  const { theme } = useTheme()
  return (
    <Svg width={width} height={height} viewBox="0 0 26 26" {...rest}>
      <G fill="none">
        <G stroke={color || theme.iconSecondary} strokeWidth="1.5">
          <G transform="translate(3.667 3.667)">
            <Rect width="8.784" height="8.784" stroke="none" rx="3" />
            <Rect width="7.284" height="7.284" x=".75" y=".75" rx="2.25" />
          </G>
          <G transform="translate(3.667 13.549)">
            <Rect width="8.784" height="8.784" stroke="none" rx="3" />
            <Rect width="7.284" height="7.284" x=".75" y=".75" rx="2.25" />
          </G>
          <G transform="translate(13.549 3.667)">
            <Rect width="8.784" height="8.784" stroke="none" rx="3" />
            <Rect width="7.284" height="7.284" x=".75" y=".75" rx="2.25" />
          </G>
          <G transform="translate(13.549 13.549)">
            <Rect width="8.784" height="8.784" stroke="none" rx="3" />
            <Rect width="7.284" height="7.284" x=".75" y=".75" rx="2.25" />
          </G>
        </G>
        <Path d="M0 26V0h26v26z" />
      </G>
    </Svg>
  )
}

export default React.memo(DAppsIcon)
