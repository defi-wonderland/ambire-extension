import React, { useEffect, useRef } from 'react'
import { useTranslation } from 'react-i18next'
import { Animated, Easing } from 'react-native'

import ThemeIcon from '@common/assets/svg/ThemeIcon'
import ControlOption from '@common/components/ControlOption'
import useTheme from '@common/hooks/useTheme'
import spacings from '@common/styles/spacings'
import { THEME_TYPES } from '@common/styles/themeConfig'
import ThemeToggle from '@web/components/ThemeToggle'

const ThemeControlOption = () => {
  const { t } = useTranslation()
  const { themeType } = useTheme()

  const rotateAnim = useRef(new Animated.Value(themeType === THEME_TYPES.DARK ? 1 : 0)).current

  useEffect(() => {
    Animated.timing(rotateAnim, {
      toValue: themeType === THEME_TYPES.LIGHT ? 1 : 0,
      duration: 300,
      easing: Easing.inOut(Easing.ease),
      useNativeDriver: true
    }).start()
  }, [themeType, rotateAnim])

  const rotateInterpolate = rotateAnim.interpolate({
    inputRange: [0, 1],
    outputRange: ['0deg', '180deg']
  })

  return (
    <ControlOption
      style={spacings.mbTy}
      title={t('Theme mode')}
      description={t('Choose between light or dark mode')}
      renderIcon={
        <Animated.View style={{ transform: [{ rotateZ: rotateInterpolate }] }}>
          <ThemeIcon />
        </Animated.View>
      }
    >
      <ThemeToggle />
    </ControlOption>
  )
}

export default React.memo(ThemeControlOption)
