import { StyleSheet, ViewStyle } from 'react-native'

import spacings from '@common/styles/spacings'
import common from '@common/styles/utils/common'
import flexbox from '@common/styles/utils/flexbox'

interface Style {
  container: ViewStyle
}

const getStyles = () =>
  StyleSheet.create<Style>({
    container: {
      ...flexbox.directionRow,
      ...common.borderRadiusTertiary,
      ...flexbox.alignCenter,
      ...spacings.phTy,
      height: 20,
      backgroundColor: '#F6FBF0',
      borderColor: '#8DC63F',
      borderWidth: 1,
      borderRadius: 50
    }
  })

export default getStyles
