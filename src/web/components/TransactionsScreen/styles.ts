import { StyleSheet, ViewStyle } from 'react-native'

import spacings from '@common/styles/spacings'
import { ThemeProps } from '@common/styles/themeConfig'
import flexbox from '@common/styles/utils/flexbox'
import { getUiType } from '@web/utils/uiType'

interface Style {
  form: ViewStyle
  container: ViewStyle
  nonTabButtons: ViewStyle
  headerSideContainer: ViewStyle
}

const { isActionWindow, isTab } = getUiType()

// Make the form slightly larger in action window
// so it stretches as much as the header
export const TRANSACTION_FORM_WIDTH = isActionWindow ? 656 : 600

const getStyles = (theme: ThemeProps) =>
  StyleSheet.create<Style>({
    form: {
      ...spacings.ph,
      ...spacings.pb,
      ...spacings.ptMd,
      ...spacings.mbMd,
      borderRadius: 12,
      backgroundColor: theme.primaryBackground,
      shadowColor: theme.primaryBorder,
      shadowOffset: { width: 0, height: 12 },
      shadowOpacity: 0.3,
      shadowRadius: 24,
      elevation: 10
    },
    container: {
      width: '100%',
      maxWidth: TRANSACTION_FORM_WIDTH,
      flex: 1,
      alignSelf: 'center',
      overflow: 'visible'
    },
    nonTabButtons: {
      ...flexbox.flex1,
      ...spacings.pbLg,
      ...flexbox.justifyEnd
    },
    headerSideContainer: { width: isTab ? 300 : 200, minWidth: isTab ? 300 : 200 }
  })

export default getStyles
