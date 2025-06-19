import { EventEmitter } from 'events'

import { WindowProps } from '@ambire-common/interfaces/window'
import { SPACING } from '@common/styles/spacings'
import { browser, engine, isExtension, isSafari } from '@web/constants/browserapi'
import { IS_FIREFOX, IS_WINDOWS } from '@web/constants/common'
import {
  MIN_NOTIFICATION_WINDOW_HEIGHT,
  NOTIFICATION_WINDOW_HEIGHT,
  NOTIFICATION_WINDOW_WIDTH,
  TAB_WIDE_CONTENT_WIDTH
} from '@web/constants/spacings'
import { PortMessenger } from '@web/extension-services/messengers'

type CustomSize = {
  width: number
  height: number
}

const event = new EventEmitter()

if (isExtension) {
  // if focus other windows, then reject the notification request
  browser.windows.onFocusChanged.addListener((winId: any) => {
    event.emit('windowFocusChange', winId)
  })

  browser.windows.onRemoved.addListener((winId: any) => {
    event.emit('windowRemoved', winId)
  })
}

export const WINDOW_SIZE = {
  width: NOTIFICATION_WINDOW_WIDTH + (IS_WINDOWS ? 14 : 0), // idk why windows cut the width.
  height: NOTIFICATION_WINDOW_HEIGHT
}

const formatScreenHeight = (h: number) => {
  try {
    const height = h > MIN_NOTIFICATION_WINDOW_HEIGHT ? h : MIN_NOTIFICATION_WINDOW_HEIGHT

    return Math.round(height)
  } catch (error) {
    return Math.round(MIN_NOTIFICATION_WINDOW_HEIGHT)
  }
}

const formatScreenWidth = (w: number) => {
  try {
    if (w < NOTIFICATION_WINDOW_WIDTH) {
      return Math.round(NOTIFICATION_WINDOW_WIDTH)
    }
    if (w > TAB_WIDE_CONTENT_WIDTH) {
      return Math.round(TAB_WIDE_CONTENT_WIDTH)
    }

    return Math.round(w)
  } catch (error) {
    return Math.round(NOTIFICATION_WINDOW_WIDTH)
  }
}

const calculateWindowSizeAndPosition = async (
  customSize?: CustomSize,
  windowId?: number
): Promise<{ width: number; height: number; left: number; top: number }> => {
  // In CI (headless: true), the calculated window position is always outside the visible screen, causing window.open() to fail with:
  // "Invalid value for bounds. Bounds must be at least 50% within visible screen space".
  // To fix this, we return hardcoded position values to ensure it works.
  if (process.env.IS_TESTING === 'true') {
    return {
      width: 1100,
      height: 800,
      left: 0,
      top: 0
    }
  }

  let screenWidth = 0
  let screenHeight = 0

  if (isSafari()) {
    screenWidth = formatScreenWidth(NOTIFICATION_WINDOW_WIDTH)
    screenHeight = formatScreenHeight(NOTIFICATION_WINDOW_HEIGHT)
  } else if (engine === 'webkit') {
    const displayInfo = await chrome.system.display.getInfo()
    screenWidth = formatScreenWidth(displayInfo?.[0]?.workArea?.width)
    screenHeight = formatScreenHeight(displayInfo?.[0]?.workArea?.height)
  } else {
    screenWidth = formatScreenWidth(window.screen.width)
    screenHeight = formatScreenHeight(window.screen.height)
  }

  const ratio = 0.9 // 90% of the screen/tab size

  // By default the desired window dimensions should be 720x800
  // or if the screen height is smaller 800 make the window height 90% of the screen height
  let desiredWidth = 720
  let desiredHeight = Math.min(800, screenHeight * ratio)

  if (customSize) {
    desiredWidth = customSize.width
    desiredHeight = Math.min(customSize.height, screenHeight * ratio)
  }

  let leftPosition = (screenWidth - desiredWidth) / 2
  let topPosition = (screenHeight - desiredHeight) / 2

  const baseWindow = windowId
    ? await chrome.windows.get(windowId, { populate: true })
    : await chrome.windows.getCurrent({ populate: true, windowTypes: ['normal', 'panel', 'app'] })

  const queryParams = windowId ? { active: true, windowId } : { active: true, currentWindow: true }

  const [activeTab] =
    [(baseWindow.tabs || []).find((t) => t.active)] || (await chrome.tabs.query(queryParams))

  let leftOffset = 0
  let topOffset = 0

  if (baseWindow && baseWindow.left !== undefined && baseWindow.top !== undefined) {
    leftOffset = baseWindow.left
    topOffset = baseWindow.top
  }

  if (activeTab && activeTab.width && activeTab.height) {
    if (customSize) desiredWidth = customSize.width
    leftPosition = (activeTab.width - desiredWidth) / 2 + leftOffset
    // Pass customSize height to the helper as the height may be lower than the minimum height
    desiredHeight = formatScreenHeight(
      customSize?.height
        ? Math.min(customSize.height, activeTab.height * ratio)
        : Math.min(desiredHeight, activeTab.height * ratio)
    )
    topPosition =
      (activeTab.height - desiredHeight) / 2 + topOffset + baseWindow.height! - activeTab.height
  }

  return {
    width: desiredWidth,
    height: desiredHeight,
    left: leftPosition <= SPACING ? Math.round(SPACING) : Math.round(leftPosition),
    top: topPosition <= SPACING ? Math.round(SPACING) : Math.round(topPosition)
  }
}

const create = async (url: string, customSize?: CustomSize): Promise<WindowProps> => {
  const window = await chrome.windows.getCurrent({ windowTypes: ['normal', 'panel', 'app'] })
  const { width, height, left, top } = await calculateWindowSizeAndPosition(customSize, window.id)

  const win = await chrome.windows.create({
    focused: true,
    url,
    type: 'popup',
    width,
    height,
    left,
    top,
    state: 'normal'
  })

  return win && win.id
    ? {
        id: win.id,
        width,
        height,
        left,
        top,
        focused: true,
        createdFromWindowId: window.id
      }
    : null
}

const remove = async (winId: number, pm: PortMessenger) => {
  // In Firefox, closing a browser window (e.g., the action window) can also close the extension popup in the main window.
  // As a workaround, we first unfocus the window, then change the route. On the next chrome.windows.create call,
  // if a blank window exists, we close it before opening a new one. This prevents stacking multiple blank windows in the background.
  if (IS_FIREFOX) {
    const windows = await chrome.windows.getAll()
    const windowToRemove = windows.find((w) => w.id === winId)

    if (
      windowToRemove &&
      windowToRemove.type === 'popup' && // if an action window is opened
      pm.ports.some((p) => p.name === 'popup') // if the extension popup is opened
    ) {
      // eslint-disable-next-line @typescript-eslint/no-floating-promises
      chrome.windows.update(winId, { focused: false, top: 0, left: 0, width: 0, height: 0 })
      const tabs = await chrome.tabs.query({ windowId: winId })
      if (tabs[0].id) await chrome.tabs.update(tabs[0].id, { url: 'about:blank' })
      event.emit('windowRemoved', winId)
      return
    }
  }

  await chrome.windows.remove(winId)
}

const open = async (
  options: { route?: string; customSize?: CustomSize } = {}
): Promise<WindowProps> => {
  const { route, customSize } = options

  const url = `action-window.html${route ? `#/${route}` : ''}`
  return create(url, customSize)
}

const focus = async (windowProps: WindowProps): Promise<WindowProps> => {
  if (windowProps) {
    const { id, width, height, createdFromWindowId } = windowProps
    const { left, top } = await calculateWindowSizeAndPosition(
      { width: windowProps.width, height: windowProps.height },
      createdFromWindowId
    )

    const newWindowProps = { width, height, left, top, focused: true }

    await chrome.windows.update(id, newWindowProps)

    return { id, createdFromWindowId, ...newWindowProps }
  }

  throw new Error('windowProps is undefined')
}

const closeCurrentWindow = async () => {
  let windowObj: Window | undefined

  try {
    windowObj = window
  } catch (error) {
    // silent fail
  }

  if (isSafari() || !windowObj) {
    try {
      const win = await chrome.windows.getCurrent()
      await chrome.windows.remove(win.id!)
    } catch (error) {
      // silent fail
    }
  } else {
    windowObj.close()
  }
}

const closePopupWithUrl = async (url: string) => {
  const windows = await chrome.windows.getAll({ populate: true, windowTypes: ['popup'] })

  const matchingWindowId = windows.find((w) => {
    return w.tabs?.some((t) => t.url?.includes(url))
  })?.id

  if (!matchingWindowId) {
    throw new Error(`No matching window found for URL: ${url}`)
  }

  await chrome.windows.remove(matchingWindowId)
}

export default { open, focus, closePopupWithUrl, remove, event }

export { closeCurrentWindow }
