import { StyleSheet, TextStyle, ViewStyle } from 'react-native'

import spacings from '@common/styles/spacings'
import { ThemeProps } from '@common/styles/themeConfig'
import common from '@common/styles/utils/common'
import flexbox from '@common/styles/utils/flexbox'

interface Style {
  container: ViewStyle
  header: ViewStyle
  headerText: TextStyle
  toggleButton: ViewStyle
}

const getStyles = (theme: ThemeProps) =>
  StyleSheet.create<Style>({
    toggleButton: {
      position: 'absolute',
      alignSelf: 'flex-end'
    },
    container: {
      ...common.borderRadiusPrimary,
      backgroundColor: theme.primaryBackground,
      ...flexbox.flex1,
      minHeight: 200,
      ...spacings.pvSm,
      ...spacings.ph
    },
    header: {
      ...spacings.mb,
      flexDirection: 'row',
      alignItems: 'center'
    },
    headerText: { ...spacings.mlMi }
  })

export default getStyles
