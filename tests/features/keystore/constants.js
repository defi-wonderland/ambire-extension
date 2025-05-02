import { networkSort } from "@common/utils/sorting"

export const NEW_KEYSTORE_PASSWORD = 'B1234566'

// URLS
export const URL_DEVICE_PASSWORD_CHANGE = '/tab.html#/settings/device-password-change'
export const URL_SETTINGS_PAGE = '/tab.html#/settings/'
export const URL_SETTINGS_GENERAL = '/tab.html#/settings/general'
export const MANUAL_ADD_BTN = '//div[.//div[text()="RPC URL"]]//div[text()="Add"]'
export const GREEN_MSG_NETWORK_ADDED = 'Network successfully added!'
export const GREEN_MSG_NETWORK_SAVED = ' settings saved!'
export const AMBIRE_SMART_ACCOUNTS_MSG =
  '//div[.//div[text()="?"] and .//div[contains(text(), "Ambire Smart Accounts")]]'

export const NETWORKS_LIST = {
  FLR: {
    networkName: 'Flare network',
    ccySymbol: 'FLR',
    ccyName: 'Flare',
    rpcUrl: 'https://rpc.au.cc/flare',
    explorerUrl: 'https://flarescan.com'
  }
}
