import { StyleSheet, ViewStyle } from 'react-native'

import spacings, { SPACING_TY } from '@common/styles/spacings'
import { ThemeProps } from '@common/styles/themeConfig'
import common from '@common/styles/utils/common'
import flexbox from '@common/styles/utils/flexbox'

interface Style {
  optionsWrapper: ViewStyle
  hwOptionsContainer: ViewStyle
  hwOptionWrapper: ViewStyle
  hwOption: ViewStyle
  hwOptionHovered: ViewStyle
}

const getStyles = (theme: ThemeProps) =>
  StyleSheet.create<Style>({
    optionsWrapper: {
      backgroundColor: theme.primaryBackground,
      ...common.borderRadiusPrimary,
      ...spacings.mb
    },
    hwOptionsContainer: {
      ...flexbox.directionRow,
      flexWrap: 'wrap',
      marginRight: -SPACING_TY
    },
    hwOptionWrapper: {
      width: '33.33%',
      paddingRight: SPACING_TY
    },
    hwOption: {
      ...common.borderRadiusPrimary,
      backgroundColor: theme.secondaryBackground,
      ...spacings.pvSm,
      ...flexbox.alignCenter,
      borderWidth: 1,
      borderColor: theme.secondaryBackground
    },
    hwOptionHovered: {
      backgroundColor: `${String(theme.primaryLight)}10`,
      borderWidth: 1,
      borderColor: theme.primaryLight
    }
  })

export default getStyles
