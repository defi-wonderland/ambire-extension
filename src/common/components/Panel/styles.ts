import { StyleSheet, ViewStyle } from 'react-native'

import { ThemeProps } from '@common/styles/themeConfig'
import common from '@common/styles/utils/common'
import flexbox from '@common/styles/utils/flexbox'

interface Style {
  container: ViewStyle
  onboardingContainer: ViewStyle
  innerContainer: ViewStyle
  progress: ViewStyle
  backBtnWrapper: ViewStyle
}

const getStyles = (theme: ThemeProps) =>
  StyleSheet.create<Style>({
    container: {
      ...common.borderRadiusPrimary,
      borderWidth: 1,
      borderColor: theme.secondaryBorder,
      backgroundColor: theme.primaryBackground
    },
    // Overridden when type === 'onboarding'
    onboardingContainer: {
      ...common.borderRadiusSecondary,
      backgroundColor: theme.primaryBackground,
      ...common.shadowTertiary,
      ...flexbox.alignSelfCenter,
      minHeight: 486,
      overflow: 'hidden'
    },
    innerContainer: {
      ...flexbox.alignSelfCenter,
      ...flexbox.flex1
    },
    progress: {
      ...flexbox.flex1,
      height: 4
    },
    backBtnWrapper: {
      ...flexbox.alignCenter,
      ...flexbox.center,
      ...common.borderRadiusPrimary,
      width: 28,
      height: 28
    }
  })

export default getStyles
