import CONFIG, { APP_VERSION, isDev } from '@common/config/env'
import * as Sentry from '@sentry/react'

export const CRASH_ANALYTICS_WEB_CONFIG = {
  dsn: CONFIG.SENTRY_DSN_BROWSER_EXTENSION,
  environment: CONFIG.APP_ENV as string,
  release: `extension-${process.env.WEB_ENGINE}@${APP_VERSION}`,
  // Disables sending personally identifiable information
  sendDefaultPii: false,
  integrations: []
}

export const captureException = Sentry.captureException
export const captureMessage = Sentry.captureMessage
export const setExtraContext = Sentry.setExtra
export const setUserContext = Sentry.setUser
export const ErrorBoundary = Sentry.ErrorBoundary

/**
 * Since v5.15.0, we enable anonymous crash reporting by default,
 * because that's part of our privacy policy now.
 * Except in development. Even tho we tag errors with the environment,
 * we don't want to spam Sentry with errors that occur during development.
 */
export const CRASH_ANALYTICS_ENABLED_DEFAULT = !isDev
