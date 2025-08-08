import usePrivacyControllerState from '@web/hooks/usePrivacyControllerState'
import usePrivacySDK from './usePrivacySDK'

const usePrivacyForm = () => {
  const { sdkState } = usePrivacySDK()
  const { selectedPool, amount, targetAddress } = usePrivacyControllerState()

  // TODO: implement form logic here

  return {
    sdkState,
    selectedPool,
    amount,
    targetAddress
  }
}

export default usePrivacyForm
