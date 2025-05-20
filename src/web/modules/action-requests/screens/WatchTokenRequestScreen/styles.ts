import { StyleSheet, ViewStyle } from 'react-native'

import spacings, { SPACING_SM } from '@common/styles/spacings'
import { ThemeProps } from '@common/styles/themeConfig'
import common, { BORDER_RADIUS_PRIMARY } from '@common/styles/utils/common'
import flexbox from '@common/styles/utils/flexbox'

interface Styles {
  container: ViewStyle
  content: ViewStyle
  contentHeader: ViewStyle
  contentBody: ViewStyle
  tokenInfoContainer: ViewStyle
  tokenInfoIconWrapper: ViewStyle
}

const getStyles = (theme: ThemeProps) =>
  StyleSheet.create<Styles>({
    container: {
      ...flexbox.alignCenter,
      marginHorizontal: 'auto',
      ...flexbox.flex1,
      maxWidth: 422
    },
    content: {
      ...common.fullWidth,
      borderRadius: BORDER_RADIUS_PRIMARY,
      overflow: 'hidden',
      shadowColor: '#6770B3',
      shadowOffset: { width: 0, height: SPACING_SM },
      shadowOpacity: 0.3,
      shadowRadius: SPACING_SM,
      elevation: SPACING_SM,
      backgroundColor: theme.tertiaryBackground
    },
    contentHeader: {
      ...flexbox.flex1,
      ...flexbox.alignCenter,
      ...spacings.pvMd,
      ...spacings.phMd
    },
    contentBody: {
      backgroundColor: theme.primaryBackground,
      ...spacings.pvMd,
      ...spacings.phMd
    },
    tokenInfoContainer: {
      backgroundColor: theme.quaternaryBackground,
      height: 36,
      ...spacings.phTy,
      ...flexbox.directionRow,
      ...flexbox.alignCenter,
      borderRadius: BORDER_RADIUS_PRIMARY,
      ...flexbox.justifySpaceBetween
    },
    tokenInfoIconWrapper: {
      width: 32,
      height: 32,
      ...flexbox.alignCenter,
      ...flexbox.justifyCenter,
      ...spacings.mrMi
    }
  })

export default getStyles
