import React, { useCallback } from 'react'
import { View } from 'react-native'

import DarkModeIcon from '@common/assets/svg/DarkModeIcon'
import LightModeIcon from '@common/assets/svg/LightModeIcon'
import Toggle from '@common/components/Toggle'
import useTheme from '@common/hooks/useTheme'
import spacings from '@common/styles/spacings'
import { THEME_TYPES } from '@common/styles/themeConfig'
import useBackgroundService from '@web/hooks/useBackgroundService'

const ThemeToggle = () => {
  const { theme, themeType } = useTheme()
  const { dispatch } = useBackgroundService()

  const handleSetTheme = useCallback(() => {
    dispatch({
      type: 'SET_THEME_TYPE',
      params: { themeType: themeType === THEME_TYPES.DARK ? THEME_TYPES.LIGHT : THEME_TYPES.DARK }
    })
  }, [dispatch, themeType])

  return (
    <Toggle
      isOn={themeType === THEME_TYPES.DARK}
      onToggle={handleSetTheme}
      trackStyle={{
        width: 52,
        height: 28,
        backgroundColor: themeType === THEME_TYPES.DARK ? '#FFFFFF14' : '#14183314',
        borderRadius: 16
      }}
      toggleStyle={{
        top: 2,
        width: 24,
        height: 24,
        transform: (themeType === THEME_TYPES.DARK ? 'translateX(26px)' : 'translateX(2px)') as any,
        backgroundColor:
          themeType === THEME_TYPES.DARK ? theme.tertiaryBackground : theme.primaryBackground,
        // @ts-ignore
        border: `1px solid ${theme.secondaryBorder as string}`
      }}
    >
      <View
        style={{
          width: 52,
          height: 28,
          ...spacings.phMi,
          flexDirection: 'row',
          alignItems: 'center',
          justifyContent: themeType === THEME_TYPES.DARK ? 'flex-start' : 'flex-end'
        }}
      >
        {themeType === THEME_TYPES.DARK ? <LightModeIcon /> : <DarkModeIcon />}
      </View>
    </Toggle>
  )
}

export default React.memo(ThemeToggle)
