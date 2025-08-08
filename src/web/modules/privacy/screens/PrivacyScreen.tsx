import React, { useCallback } from 'react'

import BackButton from '@common/components/BackButton'
import useNavigation from '@common/hooks/useNavigation'
import { ROUTES } from '@common/modules/router/constants/common'

import usePrivacyForm from '../hooks'

const PrivacyScreen = () => {
  const { navigate } = useNavigation()
  const { sdkState } = usePrivacyForm()

  const onBack = useCallback(() => {
    navigate(ROUTES.dashboard)
  }, [navigate])

  return (
    <div>
      <BackButton onPress={onBack} />
      <h1>Privacy</h1>
    </div>
  )
}

export default React.memo(PrivacyScreen)
