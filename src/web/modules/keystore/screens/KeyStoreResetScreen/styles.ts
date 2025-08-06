import { StyleSheet, TextStyle, ViewStyle } from 'react-native'

import spacings from '@common/styles/spacings'

interface Styles {
  logo: ViewStyle
  title: TextStyle
  currentEmailContainer: ViewStyle
  currentEmailLabel: TextStyle
  button: ViewStyle
}

const styles = StyleSheet.create<Styles>({
  logo: {
    ...spacings.mbXl
  },
  title: {
    fontSize: 20,
    fontWeight: '900'
  },
  currentEmailContainer: {
    ...spacings.pvSm,
    ...spacings.phSm,
    borderRadius: 12
  },
  currentEmailLabel: {
    textAlign: 'center'
  },
  button: {
    width: 296
  }
})

export default styles
