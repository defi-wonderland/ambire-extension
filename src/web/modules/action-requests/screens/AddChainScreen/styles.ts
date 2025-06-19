import { StyleSheet, ViewStyle } from 'react-native'

import spacings from '@common/styles/spacings'
import { THEME_TYPES, ThemeProps, ThemeType } from '@common/styles/themeConfig'
import common from '@common/styles/utils/common'
import flexbox from '@common/styles/utils/flexbox'

interface Style {
  dappInfoContainer: ViewStyle
  dappInfoContent: ViewStyle
  separator: ViewStyle
  boxWrapper: ViewStyle
  backgroundShapes: ViewStyle
  animationContainer: ViewStyle
  lottieView: ViewStyle
  checkIcon: ViewStyle
}

const getStyles = (theme: ThemeProps, themeType: ThemeType) =>
  StyleSheet.create<Style>({
    dappInfoContainer: {
      ...flexbox.directionRow,
      ...flexbox.alignCenter,
      ...spacings.mbMd
    },
    dappInfoContent: {
      ...flexbox.directionRow,
      ...flexbox.alignCenter,
      ...spacings.phMd,
      ...flexbox.flex1
    },
    separator: {
      width: 1,
      maxWidth: 1,
      flex: 1,
      marginHorizontal: 10
    },
    boxWrapper: {
      ...spacings.pvMd,
      ...spacings.phMd,
      ...common.borderRadiusPrimary,
      ...(themeType === THEME_TYPES.DARK ? common.shadowTertiaryDarkMode : common.shadowTertiary),
      backgroundColor:
        themeType === THEME_TYPES.DARK ? theme.secondaryBackground : theme.primaryBackground,
      width: 421,
      height: 343
    },
    backgroundShapes: {
      position: 'absolute',
      top: 0,
      left: 0,
      right: 0,
      bottom: 0,
      width: '90%',
      height: '70%',
      zIndex: -1
    },
    animationContainer: { position: 'relative', width: 388, height: 217, alignSelf: 'center' },
    lottieView: {
      width: 388,
      height: 217,
      // @ts-ignore
      pointerEvents: 'none'
    },
    checkIcon: { position: 'absolute', top: '50%', left: '50%' }
  })

export default getStyles
