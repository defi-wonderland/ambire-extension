import React, { useContext, useEffect } from 'react'
import { View } from 'react-native'

import SettingsPageHeader from '@web/modules/settings/components/SettingsPageHeader'
import { SettingsRoutesContext } from '@web/modules/settings/contexts/SettingsRoutesContext'

import AutoLockDeviceControlOption from './components/AutoLockDeviceControlOption'
import LockAmbireControlOption from './components/LockAmbireControlOption'
import ThemeControlOption from './components/ThemeControlOption'

const GeneralSettingsScreen = () => {
  const { setCurrentSettingsPage } = useContext(SettingsRoutesContext)

  useEffect(() => {
    setCurrentSettingsPage('general')
  }, [setCurrentSettingsPage])

  return (
    <>
      <SettingsPageHeader title="General settings" />
      <View>
        <LockAmbireControlOption />
        <AutoLockDeviceControlOption />
        <ThemeControlOption />
      </View>
    </>
  )
}

export default GeneralSettingsScreen
