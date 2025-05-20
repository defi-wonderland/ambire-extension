import { StyleSheet, ViewStyle } from 'react-native'

import spacings from '@common/styles/spacings'
import { ThemeProps } from '@common/styles/themeConfig'

interface Style {
  footer: ViewStyle
}

const getStyles = (theme: ThemeProps) =>
  StyleSheet.create<Style>({
    footer: {
      ...spacings.pvMd,
      ...spacings.phMd,
      backgroundColor: theme.primaryBackground,
      shadowColor: '#B8BDE080',
      shadowOffset: { width: 0, height: -4 },
      shadowOpacity: 0.64,
      shadowRadius: 8,
      elevation: 5,
      borderWidth: 1,
      borderColor: theme.primary,
      borderTopLeftRadius: 12,
      borderTopRightRadius: 12
    }
  })

export default getStyles
