import './styles.css'

import React from 'react'

import Text, { Props as TextProps } from '@common/components/Text'

import { ToggleProps } from './types'

interface Props extends ToggleProps {
  labelProps?: TextProps
  toggleStyle?: React.CSSProperties
}

const Toggle: React.FC<Props> = ({
  id,
  isOn,
  onToggle,
  label,
  labelProps,
  toggleStyle,
  disabled,
  testID
}) => {
  const handleOnToggle: React.ChangeEventHandler<HTMLInputElement> = (e) => {
    onToggle(e.target.checked)
  }

  return (
    <label
      className="toggle"
      htmlFor={id}
      // @ts-ignore it exists for the React Native Web component
      testID={testID}
      style={{ opacity: disabled ? 0.4 : 1 }}
    >
      <input
        className="toggle__input"
        type="checkbox"
        checked={isOn}
        id={id}
        onChange={handleOnToggle}
        disabled={disabled}
      />
      <div className="toggle__fill" style={toggleStyle} />
      <Text fontSize={12} weight="medium" {...labelProps}>
        {label}
      </Text>
    </label>
  )
}

export default React.memo(Toggle)
