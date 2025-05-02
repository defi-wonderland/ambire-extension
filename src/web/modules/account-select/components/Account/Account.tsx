import React, { useCallback, useEffect, useMemo } from 'react'
import { Animated, Pressable, View, ViewStyle } from 'react-native'
import { useModalize } from 'react-native-modalize'

import { Account as AccountInterface } from '@ambire-common/interfaces/account'
import { canBecomeSmarter, isSmartAccount } from '@ambire-common/libs/account/account'
import AccountAddress from '@common/components/AccountAddress'
import AccountBadges from '@common/components/AccountBadges'
import AccountKeyIcons from '@common/components/AccountKeyIcons'
import AccountKeysBottomSheet from '@common/components/AccountKeysBottomSheet'
import Avatar from '@common/components/Avatar'
import DomainBadge from '@common/components/Avatar/DomainBadge'
import Dialog from '@common/components/Dialog'
import DialogButton from '@common/components/Dialog/DialogButton'
import DialogFooter from '@common/components/Dialog/DialogFooter'
import Dropdown from '@common/components/Dropdown'
import Editable from '@common/components/Editable'
import Text from '@common/components/Text'
import { useTranslation } from '@common/config/localization'
import useNavigation from '@common/hooks/useNavigation'
import useReverseLookup from '@common/hooks/useReverseLookup'
import useTheme from '@common/hooks/useTheme'
import useToast from '@common/hooks/useToast'
import { ROUTES } from '@common/modules/router/constants/common'
import spacings from '@common/styles/spacings'
import flexbox from '@common/styles/utils/flexbox'
import useAccountsControllerState from '@web/hooks/useAccountsControllerState'
import useBackgroundService from '@web/hooks/useBackgroundService'
import useFeatureFlagsControllerState from '@web/hooks/useFeatureFlagsControllerState'
import { useCustomHover } from '@web/hooks/useHover'
import useKeystoreControllerState from '@web/hooks/useKeystoreControllerState'
import useMainControllerState from '@web/hooks/useMainControllerState'
import useSelectedAccountControllerState from '@web/hooks/useSelectedAccountControllerState'
import { getUiType } from '@web/utils/uiType'

import getStyles from './styles'
import { SUBMENU_OPTION_7702, SUBMENU_OPTIONS } from './submenuOptions'

const { isTab } = getUiType()

const Account = ({
  account,
  onSelect,
  maxAccountAddrLength = 42,
  withSettings = true,
  isSelectable = true,
  withKeyType = true,
  renderRightChildren,
  showExportImport = false,
  openAddAccountBottomSheet,
  containerStyle
}: {
  account: AccountInterface
  onSelect?: (addr: string) => void
  maxAccountAddrLength?: number
  withSettings?: boolean
  isSelectable?: boolean
  withKeyType?: boolean
  renderRightChildren?: () => React.ReactNode
  showExportImport?: boolean
  openAddAccountBottomSheet?: () => void
  containerStyle?: ViewStyle
}) => {
  const { addr, preferences } = account
  const { t } = useTranslation()
  const { theme, styles } = useTheme(getStyles)
  const { addToast } = useToast()
  const mainCtrlState = useMainControllerState()
  const featureFlagsState = useFeatureFlagsControllerState()
  const { statuses: accountsStatuses } = useAccountsControllerState()
  const { account: selectedAccount } = useSelectedAccountControllerState()
  const { dispatch } = useBackgroundService()
  const { ref: dialogRef, open: openDialog, close: closeDialog } = useModalize()
  const { ens, isLoading } = useReverseLookup({ address: addr })
  const { keys } = useKeystoreControllerState()
  const { navigate } = useNavigation()
  const [bindAnim, animStyle, isHovered] = useCustomHover({
    property: 'backgroundColor',
    values: {
      from: theme.primaryBackground,
      to: !showExportImport ? theme.secondaryBackground : theme.primaryBackground
    },
    forceHoveredStyle: !showExportImport && addr === selectedAccount?.addr
  })

  const { ref: sheetRef, open: openKeysBottomSheet, close: closeBottomSheet } = useModalize()

  const selectAccount = useCallback(() => {
    if (showExportImport) {
      return
    }

    if (selectedAccount?.addr !== addr) {
      dispatch({
        type: 'MAIN_CONTROLLER_SELECT_ACCOUNT',
        params: { accountAddr: addr }
      })
    }

    onSelect && onSelect(addr)
  }, [addr, dispatch, onSelect, selectedAccount, showExportImport])

  const removeAccount = useCallback(() => {
    dispatch({
      type: 'MAIN_CONTROLLER_REMOVE_ACCOUNT',
      params: {
        accountAddr: addr
      }
    })
  }, [addr, dispatch])

  const promptRemoveAccount = useCallback(() => {
    openDialog()
  }, [openDialog])

  const onSave = useCallback(
    (value: string) => {
      dispatch({
        type: 'ACCOUNTS_CONTROLLER_UPDATE_ACCOUNT_PREFERENCES',
        params: [{ addr, preferences: { label: value, pfp: preferences.pfp } }]
      })
      addToast(t('Account label updated.'))
    },
    [addToast, addr, dispatch, preferences.pfp, t]
  )

  const isRemoveAccountLoading = useMemo(
    () => mainCtrlState.statuses.removeAccount === 'LOADING',
    [mainCtrlState.statuses.removeAccount]
  )

  useEffect(() => {
    if (mainCtrlState.statuses.removeAccount === 'SUCCESS') {
      addToast(t('Account removed.'))
      closeDialog()
      return
    }

    if (mainCtrlState.statuses.removeAccount === 'ERROR') {
      closeDialog()
    }
  }, [addToast, closeDialog, mainCtrlState.statuses.removeAccount, t])

  const onDropdownSelect = (item: { label: string; value: string }) => {
    if (item.value === 'remove') {
      promptRemoveAccount()
      return
    }

    if (item.value === 'keys') {
      openKeysBottomSheet()
    }

    if (item.value === 'toSmarter') {
      navigate(`${ROUTES.basicToSmartSettingsScreen}?accountAddr=${account.addr}`)
    }
  }

  const getAccKeys = useCallback(
    (acc: any) => {
      return keys.filter((key) => acc?.associatedKeys.includes(key.addr))
    },
    [keys]
  )

  const featureFlags = useMemo(() => {
    return featureFlagsState.flags
  }, [featureFlagsState])

  const add7702option = useMemo(() => {
    return featureFlags && featureFlags.eip7702 && canBecomeSmarter(account, getAccKeys(account))
  }, [account, getAccKeys, featureFlags])

  const submenu = useMemo(() => {
    return add7702option ? [SUBMENU_OPTION_7702, ...SUBMENU_OPTIONS] : SUBMENU_OPTIONS
  }, [add7702option])

  const Container = React.memo(({ children }: any) => {
    return isSelectable ? (
      <Pressable
        disabled={accountsStatuses.selectAccount !== 'INITIAL'}
        onPress={selectAccount}
        {...bindAnim}
        testID="account"
        // @ts-ignore
        style={showExportImport ? { cursor: 'default' } : {}}
      >
        {children}
      </Pressable>
    ) : (
      <View>{children}</View>
    )
  })

  return (
    <Container>
      <Animated.View style={[styles.accountContainer, containerStyle, isSelectable && animStyle]}>
        <View style={[flexbox.flex1, flexbox.directionRow]}>
          <Avatar pfp={account.preferences.pfp} isSmart={isSmartAccount(account)} showTooltip />
          <View style={flexbox.flex1}>
            <View style={[flexbox.flex1, flexbox.directionRow, flexbox.alignCenter]}>
              {!withSettings ? (
                <>
                  <Text fontSize={isTab ? 16 : 14} weight="medium" numberOfLines={1}>
                    {account.preferences.label}
                  </Text>
                  {!!withKeyType && (
                    <View style={[spacings.mlMi]}>
                      <AccountKeyIcons isExtended account={account} />
                    </View>
                  )}

                  <AccountBadges accountData={account} />
                </>
              ) : (
                <Editable
                  initialValue={account.preferences.label}
                  onSave={onSave}
                  fontSize={isTab ? 16 : 14}
                  height={24}
                  textProps={{
                    weight: 'medium'
                  }}
                  minWidth={100}
                  maxLength={40}
                >
                  {!!withKeyType && (
                    <View style={[spacings.mlMi]}>
                      <AccountKeyIcons isExtended account={account} />
                    </View>
                  )}

                  <AccountBadges accountData={account} />
                </Editable>
              )}
            </View>
            <View style={[flexbox.directionRow, flexbox.alignCenter]}>
              <DomainBadge ens={ens} />
              <AccountAddress
                isLoading={isLoading}
                ens={ens}
                address={addr}
                plainAddressMaxLength={maxAccountAddrLength}
                skeletonAppearance={isHovered ? 'primaryBackground' : 'secondaryBackground'}
              />
            </View>
          </View>
        </View>
        <View style={[flexbox.directionRow, flexbox.alignCenter]}>
          {renderRightChildren && renderRightChildren()}
          {showExportImport && (
            <AccountKeysBottomSheet
              sheetRef={sheetRef}
              account={account}
              closeBottomSheet={closeBottomSheet}
              openAddAccountBottomSheet={openAddAccountBottomSheet}
              showExportImport={showExportImport}
            />
          )}
          {showExportImport && <Dropdown data={submenu} onSelect={onDropdownSelect} />}
        </View>
      </Animated.View>
      <Dialog
        dialogRef={dialogRef}
        id={`remove-account-${addr}`}
        title={t('Remove Account')}
        text={t('Are you sure you want to remove this account?')}
        closeDialog={closeDialog}
      >
        <DialogFooter horizontalAlignment="justifyEnd">
          <DialogButton text={t('Close')} type="secondary" onPress={() => closeDialog()} />
          <DialogButton
            disabled={isRemoveAccountLoading}
            text={t('Remove')}
            type="danger"
            onPress={removeAccount}
            style={spacings.ml}
          />
        </DialogFooter>
      </Dialog>
    </Container>
  )
}

export default React.memo(Account)
