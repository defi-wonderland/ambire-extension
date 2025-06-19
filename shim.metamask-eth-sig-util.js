/**
 * Shim to force consistent ESM resolution of @metamask/eth-sig-util.
 * This prevents Webpack from bundling it multiple times (ESM vs CJS),
 * which previously caused chunk name collisions and runtime errors
 * like: ""`(0, a.boolean) is not a function`"" in the service worker for the dev build
 * and "Error: Conflict: Multiple chunks emit assets to the same filename index..cjs"
 * for the production build. Needed since v7 of the @metamask/eth-sig-util package.
 */
export * from '@metamask/eth-sig-util'
