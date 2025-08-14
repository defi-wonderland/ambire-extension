import { useEffect } from 'react'
import usePrivacyControllerState from '@web/hooks/usePrivacyControllerState'
import useBackgroundService from '@web/hooks/useBackgroundService'

const usePrivacyForm = () => {
  const { dispatch } = useBackgroundService()
  const { amount, seedPhrase, targetAddress, isInitialized, initialPromiseLoaded, chainData } =
    usePrivacyControllerState()

  useEffect(() => {
    // TODO: initialPromiseLoaded is probably not needed
    if (!isInitialized && initialPromiseLoaded) {
      dispatch({
        type: 'PRIVACY_CONTROLLER_INITIALIZE_SDK',
        params: {
          baseUrl: typeof window !== 'undefined' ? window.location.origin : ''
        }
      })
    }
  }, [isInitialized, initialPromiseLoaded, dispatch])

  const loadAccount = () => {
    dispatch({
      type: 'PRIVACY_CONTROLLER_LOAD_ACCOUNT',
      params: {
        seedPhrase
      }
    })
  }

  const handleUpdateForm = (params: { [key: string]: any }) => {
    dispatch({
      type: 'PRIVACY_CONTROLLER_UPDATE_FORM',
      params: { ...params }
    })
  }

  return {
    amount,
    targetAddress,
    seedPhrase,
    chainData,
    loadAccount,
    handleUpdateForm
  }
}

export default usePrivacyForm
