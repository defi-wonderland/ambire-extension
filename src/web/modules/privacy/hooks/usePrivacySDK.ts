import { useEffect, useState } from 'react'
import { PrivacyController } from '@ambire-common/controllers/privacy/privacy'
import usePrivacyControllerState from '@web/hooks/usePrivacyControllerState'

const usePrivacySDK = () => {
  const [sdk, setSdk] = useState<PrivacyController | null>(null)

  useEffect(() => {
    const controller = new PrivacyController()
    controller.initSDK()
    setSdk(controller)
  }, [])

  return {
    sdk
  }
}

export default usePrivacySDK
