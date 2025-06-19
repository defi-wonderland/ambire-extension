/* eslint-disable import/no-mutable-exports */
let browser: any = null
let engine: 'webkit' | 'gecko' | null = null
let platform: 'browser-webkit' | 'browser-gecko' | 'default' = 'default'
let isExtension: boolean = false

try {
  if (process.env.WEB_ENGINE?.startsWith('webkit')) {
    engine = 'webkit'
    platform = 'browser-webkit'
  }

  if (process.env.WEB_ENGINE === 'gecko') {
    engine = 'gecko'
    platform = 'browser-gecko'
  }

  if (['webkit-safari', 'webkit', 'gecko'].includes(process.env.WEB_ENGINE || '')) {
    // eslint-disable-next-line
    browser = require('webextension-polyfill')
    // Code running in a Chrome extension (content script, background page, etc.)
    // {@link https://stackoverflow.com/a/22563123/1333836}
    if (browser?.runtime?.id) isExtension = true
  }
} catch (error) {
  // Silent fail
}

const getFirefoxVersion = () => {
  const ua = navigator.userAgent
  if (!ua) return undefined

  try {
    const match = ua.match(/Firefox\/(\d+\.\d+)/)

    if (match) return parseInt(match[1], 10)

    return undefined
  } catch (error) {
    return undefined
  }
}

const isOpera = () => {
  try {
    const userAgent = navigator.userAgent
    return userAgent.includes('Opera') || userAgent.includes('OPR')
  } catch (error) {
    return false
  }
}

const isSafari = () => {
  try {
    return navigator.userAgent.includes('Safari') && !navigator.userAgent.includes('Chrome')
  } catch (error) {
    return false
  }
}

export { engine, platform, isExtension, browser, getFirefoxVersion, isOpera, isSafari }
