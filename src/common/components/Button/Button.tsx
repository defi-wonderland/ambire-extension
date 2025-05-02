import React, { useMemo } from 'react'
import { ColorValue, PressableProps, TextStyle, ViewStyle } from 'react-native'

import Text from '@common/components/Text'
import useTheme from '@common/hooks/useTheme'
import spacings from '@common/styles/spacings'
import textStyles from '@common/styles/utils/text'
import { AnimatedPressable, useMultiHover } from '@web/hooks/useHover'
import { AnimationValues } from '@web/hooks/useHover/useMultiHover'
import useOnEnterKeyPress from '@web/hooks/useOnEnterKeyPress'

import getStyles from './styles'

type ButtonTypes =
  | 'primary'
  | 'secondary'
  | 'danger'
  | 'outline'
  | 'ghost'
  | 'error'
  | 'warning'
  | 'info'
  | 'info2'
  | 'success'
  | 'gray'

type ButtonSizes = 'regular' | 'small' | 'large' | 'tiny'
export interface Props extends PressableProps {
  text?: string
  type?: ButtonTypes
  size?: ButtonSizes
  textStyle?: any
  textUnderline?: boolean
  accentColor?: ColorValue
  hasBottomSpacing?: boolean
  containerStyle?: PressableProps['style']
  disabledStyle?: ViewStyle
  forceHoveredStyle?: boolean
  children?: React.ReactNode
  childrenPosition?: 'left' | 'right'
  testID?: string
  submitOnEnter?: boolean
}

const OPACITY_ANIMATION = {
  property: 'opacity' as keyof ViewStyle,
  from: 1,
  to: 0.7
}

const Button = ({
  type = 'primary',
  size = 'regular',
  accentColor,
  text,
  style = {},
  textStyle = {},
  textUnderline,
  disabled = false,
  hasBottomSpacing = true,
  children,
  disabledStyle,
  forceHoveredStyle = false,
  childrenPosition = 'right',
  testID,
  submitOnEnter: _submitOnEnter,
  ...rest
}: Props) => {
  const { styles, theme } = useTheme(getStyles)
  const submitOnEnter = _submitOnEnter ?? type === 'primary'

  useOnEnterKeyPress({
    action: rest.onPress,
    disabled: !!disabled || !submitOnEnter
  })

  const buttonColors: {
    [key in ButtonTypes]: AnimationValues[]
  } = useMemo(
    () => ({
      primary: [
        {
          property: 'backgroundColor',
          from: theme.primary,
          to: theme.primaryLight
        }
      ],
      secondary: [
        {
          property: 'backgroundColor',
          from: `${String(theme.infoBackground)}00`,
          to: theme.infoBackground
        }
      ],
      danger: [
        {
          property: 'backgroundColor',
          from: `${String(theme.errorBackground)}00`,
          to: theme.errorBackground
        }
      ],
      outline: [OPACITY_ANIMATION],
      ghost: [OPACITY_ANIMATION],
      error: [OPACITY_ANIMATION],
      warning: [OPACITY_ANIMATION],
      info: [OPACITY_ANIMATION],
      info2: [OPACITY_ANIMATION],
      success: [OPACITY_ANIMATION],
      gray: [
        {
          property: 'backgroundColor',
          from: theme.quaternaryBackground,
          to: `${String(theme.primaryLight)}10`
        },
        {
          property: 'borderWidth',
          from: 0,
          to: 1
        },
        {
          property: 'borderColor',
          from: theme.quaternaryBackground,
          to: theme.primaryLight
        }
      ]
    }),
    [
      theme.primary,
      theme.primaryLight,
      theme.infoBackground,
      theme.errorBackground,
      theme.quaternaryBackground
    ]
  )

  const [bind, animatedStyle] = useMultiHover({
    values: buttonColors[type],
    forceHoveredStyle
  })

  const containerStyles: { [key in ButtonTypes]: ViewStyle } = {
    primary: styles.buttonContainerPrimary,
    secondary: styles.buttonContainerSecondary,
    danger: styles.buttonContainerDanger,
    outline: styles.buttonContainerOutline,
    ghost: styles.buttonContainerGhost,
    error: {
      backgroundColor: theme.errorText,
      borderWidth: 0
    },
    warning: {
      backgroundColor: theme.warningText,
      borderWidth: 0
    },
    info: {
      backgroundColor: theme.infoText,
      borderWidth: 0
    },
    info2: {
      backgroundColor: theme.info2Text,
      borderWidth: 0
    },
    success: {
      backgroundColor: theme.successText,
      borderWidth: 0
    },
    gray: {
      backgroundColor: theme.quaternaryBackground,
      borderWidth: 0
    }
  }

  const containerStylesSizes: { [key in ButtonSizes]: ViewStyle } = {
    large: styles.buttonContainerStylesSizeLarge,
    regular: styles.buttonContainerStylesSizeRegular,
    small: styles.buttonContainerStylesSizeSmall,
    tiny: styles.buttonContainerStylesSizeTiny
  }

  const buttonTextStyles: { [key in ButtonTypes]: TextStyle } = {
    primary: styles.buttonTextPrimary,
    secondary: styles.buttonTextSecondary,
    danger: styles.buttonTextDanger,
    outline: styles.buttonTextOutline,
    ghost: styles.buttonTextGhost,
    error: styles.buttonTextPrimary,
    warning: styles.buttonTextPrimary,
    info: styles.buttonTextPrimary,
    info2: styles.buttonTextPrimary,
    success: styles.buttonTextPrimary,
    gray: styles.buttonTextGray
  }

  const buttonTextStylesSizes: { [key in ButtonSizes]: TextStyle } = {
    large: styles.buttonTextStylesSizeLarge,
    regular: styles.buttonTextStylesSizeRegular,
    small: styles.buttonTextStylesSizeSmall,
    tiny: styles.buttonTextStylesSizeTiny
  }
  return (
    <AnimatedPressable
      testID={testID}
      disabled={disabled}
      style={
        [
          containerStylesSizes[size],
          styles.buttonContainer,
          containerStyles[type],
          style,
          !!accentColor && { borderColor: accentColor },
          !hasBottomSpacing && spacings.mb0,
          animatedStyle,
          disabled && disabledStyle ? disabledStyle : {},
          disabled && !disabledStyle ? styles.disabled : {}
        ] as ViewStyle
      }
      {...rest}
      onHoverIn={(e) => {
        bind.onHoverIn(e)

        rest?.onHoverIn && rest.onHoverIn(e)
      }}
      onHoverOut={(e) => {
        bind.onHoverOut(e)

        rest?.onHoverOut && rest.onHoverOut(e)
      }}
      onPressIn={(e) => {
        bind.onPressIn(e)

        rest?.onPressIn && rest.onPressIn(e)
      }}
      onPressOut={(e) => {
        bind.onPressOut(e)

        rest?.onPressOut && rest.onPressOut(e)
      }}
    >
      {childrenPosition === 'left' && children}
      {!!text && (
        <Text
          selectable={false}
          underline={textUnderline}
          weight="medium"
          style={[
            textStyles.center,
            buttonTextStyles[type],
            buttonTextStylesSizes[size],
            !!accentColor && { color: accentColor },
            textStyle
          ]}
        >
          {text}
        </Text>
      )}
      {childrenPosition === 'right' && children}
    </AnimatedPressable>
  )
}

export default React.memo(Button)
