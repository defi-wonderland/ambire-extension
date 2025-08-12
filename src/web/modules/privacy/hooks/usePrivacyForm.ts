import usePrivacyControllerState from '@web/hooks/usePrivacyControllerState'
import usePrivacySDK from './usePrivacySDK'

const usePrivacyForm = () => {
  const { sdk } = usePrivacySDK()
  const { amount, targetAddress } = usePrivacyControllerState()

  console.log('sdk', sdk)

  return {
    amount,
    targetAddress
  }
}

export default usePrivacyForm
