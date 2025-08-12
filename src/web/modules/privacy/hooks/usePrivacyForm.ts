import { useEffect } from 'react'
import usePrivacyControllerState from '@web/hooks/usePrivacyControllerState'
import useBackgroundService from '@web/hooks/useBackgroundService'

const usePrivacyForm = () => {
  const { amount, targetAddress, isInitialized, initialPromiseLoaded } = usePrivacyControllerState()
  const { dispatch } = useBackgroundService()

  useEffect(() => {
    if (!isInitialized && initialPromiseLoaded) {
      dispatch({
        type: 'PRIVACY_CONTROLLER_INITIALIZE_SDK',
        params: {
          baseUrl: typeof window !== 'undefined' ? window.location.origin : ''
        }
      })
    }
  }, [isInitialized, initialPromiseLoaded, dispatch])

  console.log('Ambire privacy: initialPromiseLoaded', initialPromiseLoaded)
  console.log('Ambire privacy: initialized', isInitialized)

  return {
    amount,
    targetAddress
  }
}

export default usePrivacyForm
