/* eslint-disable react/no-unused-prop-types */
import React from 'react'
import { View, ViewStyle } from 'react-native'
import ToggleSwitch from 'toggle-switch-react-native'

import Text, { Props as TextProps } from '@common/components/Text'
import colors from '@common/styles/colors'
import spacings from '@common/styles/spacings'

import styles from './styles'
import { ToggleProps } from './types'

interface Props extends ToggleProps {
  labelProps?: TextProps
  toggleStyle?: ViewStyle
}

const Toggle = ({ isOn, onToggle, label, style, disabled }: Props) => {
  return (
    <View style={(styles.container, style)}>
      {!!label && (
        <Text style={spacings.mrTy} color={isOn ? colors.heliotrope : colors.chetwode}>
          {label}
        </Text>
      )}
      <ToggleSwitch
        isOn={isOn}
        disabled={disabled}
        onToggle={onToggle}
        thumbOnStyle={styles.thumbOnStyle}
        thumbOffStyle={styles.thumbOffStyle}
        trackOnStyle={styles.trackOnStyle}
        trackOffStyle={styles.trackOffStyle}
        hitSlop={{ top: 15, bottom: 15, left: 5, right: 5 }}
      />
    </View>
  )
}

export default React.memo(Toggle)
