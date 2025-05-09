import { StyleSheet, ViewStyle } from 'react-native'

import { isWeb } from '@common/config/env'
import spacings, { DEVICE_HEIGHT, SPACING, SPACING_LG } from '@common/styles/spacings'
import { ThemeProps } from '@common/styles/themeConfig'
import { BORDER_RADIUS_PRIMARY } from '@common/styles/utils/common'
import { TAB_CONTENT_WIDTH } from '@web/constants/spacings'

interface Style {
  bottomSheet: ViewStyle
  modal: ViewStyle
  portalHost: ViewStyle
  dragger: ViewStyle
  backDrop: ViewStyle
}

export const BOTTOM_SHEET_Z_INDEX = 900

const getStyles = (theme: ThemeProps) =>
  StyleSheet.create<Style>({
    bottomSheet: {
      borderTopStartRadius: BORDER_RADIUS_PRIMARY,
      borderTopEndRadius: BORDER_RADIUS_PRIMARY,
      ...spacings.pvMd,
      paddingHorizontal: isWeb ? SPACING_LG : SPACING
    },
    modal: {
      borderBottomEndRadius: BORDER_RADIUS_PRIMARY,
      borderBottomStartRadius: BORDER_RADIUS_PRIMARY,
      maxWidth: TAB_CONTENT_WIDTH,
      width: '100%',
      margin: 'auto'
    },
    dragger: {
      width: 60,
      height: 3,
      borderRadius: 4,
      backgroundColor: theme.secondaryBorder,
      top: 10
    },
    backDrop: {
      width: '100%',
      height: '100%',
      minHeight: DEVICE_HEIGHT,
      position: 'absolute',
      backgroundColor: 'transparent',
      zIndex: BOTTOM_SHEET_Z_INDEX - 1
    },
    portalHost: {
      ...StyleSheet.absoluteFillObject,
      // @ts-ignore prop is supported by react-native-web, but missing in types
      pointerEvents: 'none',
      // Lower number than the toasts' zIndex
      zIndex: BOTTOM_SHEET_Z_INDEX,
      elevation: 19
    }
  })

export default getStyles
