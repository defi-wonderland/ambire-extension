import { StyleSheet, ViewStyle } from 'react-native'

import spacings from '@common/styles/spacings'
import { ThemeProps } from '@common/styles/themeConfig'
import flexbox from '@common/styles/utils/flexbox'

interface Style {
  contentContainer: ViewStyle
  informationCircle: ViewStyle
  footerContainer: ViewStyle
  footer: ViewStyle
}

const getStyles = (theme: ThemeProps) =>
  StyleSheet.create<Style>({
    contentContainer: {
      height: '100%',
      ...spacings.pbLg,
      ...spacings.ph0,
      ...spacings.ptLg,
      ...flexbox.flex1
    },
    informationCircle: {
      ...flexbox.alignSelfCenter,
      ...spacings.pbLg
    },
    footerContainer: {
      ...flexbox.flex1,
      maxHeight: 80,
      ...spacings.ph3Xl,
      backgroundColor: theme.primaryBackground,
      shadowColor: '#B8BDE080',
      shadowOffset: {
        width: 0,
        height: -2
      },
      shadowOpacity: 1,
      shadowRadius: 4,
      elevation: 7
    },
    footer: {
      ...flexbox.flex1,
      ...flexbox.justifySpaceBetween,
      ...flexbox.alignCenter,
      ...flexbox.directionRow,
      width: '100%',
      marginHorizontal: 'auto'
    }
  })

export default getStyles
