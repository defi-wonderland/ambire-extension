import { StyleSheet, ViewStyle } from 'react-native'

import spacings from '@common/styles/spacings'
import { ThemeProps } from '@common/styles/themeConfig'
import common from '@common/styles/utils/common'

interface Style {
  container: ViewStyle
}

const getStyles = (theme: ThemeProps) =>
  StyleSheet.create<Style>({
    container: {
      backgroundColor: theme.tertiaryBackground,
      ...common.borderRadiusPrimary,
      ...spacings.pvMd,
      ...spacings.phMd
    }
  })

export default getStyles
