import React, { createContext, useCallback, useEffect, useMemo } from 'react'
import { useColorScheme } from 'react-native'

import ThemeColors, {
  DEFAULT_THEME,
  THEME_TYPES,
  ThemeProps,
  ThemeType
} from '@common/styles/themeConfig'
import useBackgroundService from '@web/hooks/useBackgroundService'
import useWalletStateController from '@web/hooks/useWalletStateController'

export interface ThemeContextReturnType {
  theme: ThemeProps
  themeType: ThemeType
  setThemeType: (item: ThemeType) => void
}

const ThemeContext = createContext<ThemeContextReturnType>({
  themeType: DEFAULT_THEME,
  setThemeType: () => {},
  theme: {} as ThemeProps
})

const ThemeProvider: React.FC<{ children: React.ReactNode; forceThemeType?: ThemeType }> = ({
  children,
  forceThemeType
}) => {
  const systemThemeType = useColorScheme()
  const { dispatch } = useBackgroundService() || {}

  const { themeType } = useWalletStateController() || {}

  useEffect(() => {
    if (themeType === THEME_TYPES.DARK) {
      document.body.classList.add('dark-scrollbar')
      document.body.classList.remove('light-scrollbar')
    } else {
      document.body.classList.add('light-scrollbar')
      document.body.classList.remove('dark-scrollbar')
    }
  }, [themeType])

  const theme = useMemo(() => {
    let type = themeType === THEME_TYPES.SYSTEM ? (systemThemeType as ThemeType) : themeType

    if (forceThemeType) {
      type = forceThemeType
    }

    const currentTheme: ThemeProps = Object.fromEntries(
      Object.entries(ThemeColors).map(([key, value]) => [
        key,
        value[type as 'dark' | 'light'] || value[DEFAULT_THEME]
      ])
    ) as ThemeProps
    return currentTheme
  }, [themeType, systemThemeType])

  const setThemeType = useCallback(
    (type: THEME_TYPES) => {
      dispatch({ type: 'SET_THEME_TYPE', params: { themeType: type } })
    },
    [dispatch]
  )

  const value = useMemo(
    () => ({ theme, themeType, setThemeType }),
    [theme, themeType, setThemeType]
  )

  return <ThemeContext.Provider value={value}>{children}</ThemeContext.Provider>
}

export { ThemeContext, ThemeProvider }
