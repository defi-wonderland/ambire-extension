import { ImageStyle, StyleSheet, ViewStyle } from 'react-native'

import spacings from '@common/styles/spacings'
import { ThemeProps } from '@common/styles/themeConfig'
import common from '@common/styles/utils/common'

interface Style {
  container: ViewStyle
  checkIcon: ViewStyle
  pfpSelectorItem: ImageStyle
}

const getStyles = (theme: ThemeProps) =>
  StyleSheet.create<Style>({
    container: {
      backgroundColor: theme.primaryBackground,
      borderColor: theme.secondaryBorder,
      borderWidth: 1,
      ...common.borderRadiusPrimary,
      ...spacings.phTy,
      ...spacings.pvTy,
      ...spacings.mbSm,
      width: '100%',
      flex: 1
    },
    pfpSelectorItem: {
      height: 48,
      width: 48,
      ...common.borderRadiusPrimary
    },
    checkIcon: {
      position: 'absolute',
      right: 0,
      bottom: 0
    }
  })

export default getStyles
