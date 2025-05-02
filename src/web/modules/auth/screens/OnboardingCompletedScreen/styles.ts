import { StyleSheet, ViewStyle } from 'react-native'

import { BOTTOM_SHEET_Z_INDEX } from '@common/components/BottomSheet/styles'
import { SPACING_4XL } from '@common/styles/spacings'

interface Style {
  pinExtensionIcon: ViewStyle
}

const getStyles = () =>
  StyleSheet.create<Style>({
    pinExtensionIcon: {
      position: 'absolute',
      right: SPACING_4XL,
      zIndex: BOTTOM_SHEET_Z_INDEX
    }
  })

export default getStyles
