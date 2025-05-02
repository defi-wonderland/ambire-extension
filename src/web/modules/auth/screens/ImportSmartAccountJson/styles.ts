import { StyleSheet, ViewStyle } from 'react-native'

import spacings from '@common/styles/spacings'
import { ThemeProps } from '@common/styles/themeConfig'
import common, { BORDER_RADIUS_PRIMARY } from '@common/styles/utils/common'
import flexbox from '@common/styles/utils/flexbox'

interface Styles {
  dropAreaContainer: ViewStyle
  dropArea: ViewStyle
}

const getStyles = (theme: ThemeProps) =>
  StyleSheet.create<Styles>({
    dropAreaContainer: {
      ...common.borderRadiusPrimary,
      borderWidth: 1,
      borderColor: theme.tertiaryBackground,
      ...spacings.phMi,
      ...spacings.pvMi,
      shadowColor: '#767DAD29',
      shadowOpacity: 1,
      shadowOffset: {
        width: 0,
        height: 3
      },
      shadowRadius: 6,
      // @ts-ignore
      cursor: 'pointer',
      ...flexbox.flex1,
      ...spacings.mbLg
    },
    dropArea: {
      borderRadius: BORDER_RADIUS_PRIMARY,
      ...flexbox.flex1,
      borderWidth: 1,
      borderStyle: 'dashed',
      borderColor: theme.tertiaryBackground,
      ...flexbox.alignCenter,
      ...flexbox.justifyCenter,
      ...spacings.phTy
    }
  })

export default getStyles
