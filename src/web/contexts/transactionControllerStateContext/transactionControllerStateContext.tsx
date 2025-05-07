/* eslint-disable @typescript-eslint/no-shadow */
import React, { createContext, useEffect } from 'react'

// TODO: change to transaction manager controller
import { SwapAndBridgeController } from '@ambire-common/controllers/swapAndBridge/swapAndBridge'
import useDeepMemo from '@common/hooks/useDeepMemo'
import useBackgroundService from '@web/hooks/useBackgroundService'
import useControllerState from '@web/hooks/useControllerState'
import useMainControllerState from '@web/hooks/useMainControllerState'

const TransactionControllerStateContext = createContext<SwapAndBridgeController>(
  {} as SwapAndBridgeController
)

const TransactionControllerStateProvider: React.FC<any> = ({ children }) => {
  // TODO: change to transaction manager controller
  const controller = 'swapAndBridge'
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
    <TransactionControllerStateContext.Provider value={memoizedState}>
      {children}
    </TransactionControllerStateContext.Provider>
  )
}

export { TransactionControllerStateProvider, TransactionControllerStateContext }
