/* eslint-disable @typescript-eslint/no-floating-promises */
import React, { createContext, useEffect, useMemo, useRef } from 'react'

import { ErrorRef } from '@ambire-common/controllers/eventEmitter/eventEmitter'
import { ToastOptions } from '@common/contexts/toastContext'
import useIsScreenFocused from '@common/hooks/useIsScreenFocused'
import useNavigation from '@common/hooks/useNavigation'
import useRoute from '@common/hooks/useRoute'
import useToast from '@common/hooks/useToast'
import { isExtension } from '@web/constants/browserapi'
import {
  backgroundServiceContextDefaults,
  BackgroundServiceContextReturnType
} from '@web/contexts/backgroundServiceContext/types'
import { Action } from '@web/extension-services/background/actions'
import { closeCurrentWindow } from '@web/extension-services/background/webapi/window'
import eventBus from '@web/extension-services/event/eventBus'
import { PortMessenger } from '@web/extension-services/messengers'
import { getUiType } from '@web/utils/uiType'

let dispatch: BackgroundServiceContextReturnType['dispatch']
let pm: PortMessenger
const actionsBeforeBackgroundReady: Action[] = []
let backgroundReady: boolean
let connectPort: () => void = () => {}
// Facilitate communication between the different parts of the browser extension.
// Utilizes the PortMessenger class to establish a connection between the popup
// and background pages, and the eventBus to emit and listen for events.
// This allows the browser extension's UI to send and receive messages to and
// from the background process (needed for updating the browser extension UI
// based on the state of the background process and for sending dApps-initiated
// actions to the background for further processing.
if (isExtension) {
  connectPort = () => {
    pm = new PortMessenger()
    backgroundReady = false

    let portName = 'popup'
    if (getUiType().isTab) portName = 'tab'
    if (getUiType().isActionWindow) portName = 'action-window'

    pm.connect(portName)
    // connect to the portMessenger initialized in the background
    // @ts-ignore
    pm.addListener(pm.ports[0].id, (messageType, { method, params, forceEmit }) => {
      if (method === 'portReady') {
        backgroundReady = true
        actionsBeforeBackgroundReady.forEach((a) => dispatch(a))
        actionsBeforeBackgroundReady.length = 0
        return
      }
      if (messageType === '> ui') {
        eventBus.emit(method, params, forceEmit)
      }
      if (messageType === '> ui-error') {
        eventBus.emit('error', params)
      }
      if (messageType === '> ui-toast') {
        eventBus.emit(method, params)
      }
    })

    setTimeout(() => {
      if (!backgroundReady) connectPort()
    }, 150)
  }

  connectPort()
}

const ACTIONS_TO_DISPATCH_EVEN_WHEN_HIDDEN = ['INIT_CONTROLLER_STATE']

dispatch = (action) => {
  // Dispatch the action only when the tab or popup is focused or active.
  // Otherwise, multiple dispatches could occur if the same screen is open in multiple tabs/popup windows,
  // causing unpredictable background/controllers state behavior.
  // dispatches from action-window should not be blocked even when unfocused
  // because we can have only one instance of action-window and only one instance for the given action screen
  // (an action screen could not be opened in tab or popup window by design)
  const shouldBlockDispatch = document.hidden && !getUiType().isActionWindow
  if (shouldBlockDispatch && !ACTIONS_TO_DISPATCH_EVEN_WHEN_HIDDEN.includes(action.type)) return

  if (!backgroundReady) {
    actionsBeforeBackgroundReady.push(action)
  } else {
    pm.send('> background', action)
  }
}

const BackgroundServiceContext = createContext<BackgroundServiceContextReturnType>(
  backgroundServiceContextDefaults
)

const BackgroundServiceProvider: React.FC<any> = ({ children }) => {
  const { addToast } = useToast()
  const route = useRoute()
  const timer: any = useRef()
  const isFocused = useIsScreenFocused()
  const { navigate } = useNavigation()
  useEffect(() => {
    const url = `${window.location.origin}${route.pathname}${route.search}${route.hash}`
    dispatch({ type: 'UPDATE_PORT_URL', params: { url } })
  }, [route])

  useEffect(() => {
    if (!isExtension) return

    const keepAlive = async () => {
      try {
        await chrome.runtime.sendMessage('ping')
      } catch (error) {
        console.error(error)
      }
      timer.current = setTimeout(keepAlive, 1000)
    }

    if (isFocused) {
      keepAlive()
    } else if (timer.current) {
      clearTimeout(timer.current)
      timer.current = null
    }

    return () => {
      if (timer.current) clearTimeout(timer.current)
    }
  }, [isFocused])

  useEffect(() => {
    if (!isExtension) return

    try {
      chrome.runtime.onMessage.addListener(async (message: any) => {
        if (message.action === 'sw-started') {
          // if the sw restarts and the current window is an action window then close it
          // because the actions state has been lost after the sw restart
          if (getUiType().isActionWindow) {
            closeCurrentWindow()
          } else {
            sessionStorage.setItem('backgroundState', 'restarted')
            window.location.reload()
          }
        }
      })
    } catch (error) {
      console.error(error)
    }
  }, [])

  useEffect(() => {
    if (!isExtension) return

    const backgroundState = sessionStorage.getItem('backgroundState')

    if (backgroundState === 'restarted') {
      addToast(
        'Page was restarted because the browser put Ambire to sleep. Any transactions or operations you have started have been cleared.',
        { type: 'info', sticky: true }
      )
      sessionStorage.removeItem('backgroundState')
    }
  })

  useEffect(() => {
    const onError = (newState: { errors: ErrorRef[]; controller: string }) => {
      const lastError = newState.errors[newState.errors.length - 1]
      if (lastError) {
        if (lastError.level !== 'silent')
          // Most of the errors incoming are descriptive and tend to be long,
          // so keep a longer timeout to give the user enough time to read them.
          addToast(lastError.message, { timeout: 12000, type: 'error' })

        console.error(
          `Error in ${newState.controller} controller. Inspect background page to see the full stack trace.`
        )
      }
    }

    eventBus.addEventListener('error', onError)

    return () => eventBus.removeEventListener('error', onError)
  }, [addToast])

  useEffect(() => {
    const onAddToast = ({ text, options }: { text: string; options: ToastOptions }) =>
      addToast(text, options)

    eventBus.addEventListener('addToast', onAddToast)

    return () => eventBus.removeEventListener('addToast', onAddToast)
  }, [addToast])

  useEffect(() => {
    const onNavigate = ({ route: navRoute }: { route: string }) => navigate(navRoute)

    eventBus.addEventListener('navigate', onNavigate)

    return () => eventBus.removeEventListener('navigate', onNavigate)
  }, [addToast, navigate])

  return (
    <BackgroundServiceContext.Provider value={useMemo(() => ({ dispatch }), [])}>
      {children}
    </BackgroundServiceContext.Provider>
  )
}

export { BackgroundServiceProvider, BackgroundServiceContext }
