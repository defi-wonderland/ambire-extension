/* eslint-disable @typescript-eslint/no-shadow */
import React, { createContext, useEffect } from 'react'

import { PrivacyController } from '@ambire-common/controllers/privacy/privacy'
import useDeepMemo from '@common/hooks/useDeepMemo'
import useBackgroundService from '@web/hooks/useBackgroundService'
import useControllerState from '@web/hooks/useControllerState'
import useMainControllerState from '@web/hooks/useMainControllerState'

const PrivacyControllerStateContext = createContext<PrivacyController>({} as PrivacyController)

const PrivacyControllerStateProvider: React.FC<any> = ({ children }) => {
  const controller = 'privacy'
  const state = useControllerState(controller)
  const { dispatch } = useBackgroundService()
  const mainState = useMainControllerState()

  useEffect(() => {
    if (!Object.keys(state).length) {
      dispatch({ type: 'INIT_CONTROLLER_STATE', params: { controller } })
    }
  }, [dispatch, mainState.isReady, state])

  const memoizedState = useDeepMemo(state, controller)

  return (
    <PrivacyControllerStateContext.Provider value={memoizedState}>
      {children}
    </PrivacyControllerStateContext.Provider>
  )
}

export { PrivacyControllerStateProvider, PrivacyControllerStateContext }
