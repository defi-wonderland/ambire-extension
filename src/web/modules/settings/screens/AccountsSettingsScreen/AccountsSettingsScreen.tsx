import React, { useCallback, useContext, useEffect, useRef } from 'react'
import { useTranslation } from 'react-i18next'
import { View } from 'react-native'
import { useModalize } from 'react-native-modalize'

import BottomSheet from '@common/components/BottomSheet'
import Button from '@common/components/Button'
import ScrollableWrapper, { WRAPPER_TYPES } from '@common/components/ScrollableWrapper'
import Search from '@common/components/Search'
import Text from '@common/components/Text'
import useAccountsList from '@common/hooks/useAccountsList'
import useElementSize from '@common/hooks/useElementSize'
import useToast from '@common/hooks/useToast'
import spacings from '@common/styles/spacings'
import flexbox from '@common/styles/utils/flexbox'
import Account from '@web/modules/account-select/components/Account'
import AddAccount from '@web/modules/account-select/components/AddAccount'
import SettingsPageHeader from '@web/modules/settings/components/SettingsPageHeader'
import { getUiType } from '@web/utils/uiType'

import { SettingsRoutesContext } from '../../contexts/SettingsRoutesContext'

const AccountsSettingsScreen = () => {
  const { addToast } = useToast()
  const { t } = useTranslation()
  const { accounts, control, keyExtractor, getItemLayout } = useAccountsList()
  const { ref: sheetRef, open: openBottomSheet, close: closeBottomSheet } = useModalize()
  const accountsContainerRef = useRef(null)
  const { minElementWidthSize, maxElementWidthSize } = useElementSize(accountsContainerRef)
  const { setCurrentSettingsPage } = useContext(SettingsRoutesContext)

  useEffect(() => {
    setCurrentSettingsPage('accounts')
  }, [setCurrentSettingsPage])

  const shortenAccountAddr = useCallback(() => {
    if (maxElementWidthSize(800)) return undefined
    if (maxElementWidthSize(700) && minElementWidthSize(800)) return 32
    if (maxElementWidthSize(600) && minElementWidthSize(700)) return 24
    if (maxElementWidthSize(500) && minElementWidthSize(600)) return 16

    return 10
  }, [maxElementWidthSize, minElementWidthSize])

  const onSelectAccount = useCallback(
    (addr: string) => {
      const acc = accounts.find((a) => a.addr === addr)
      addToast(t('Selected account {{label}}', { label: acc?.preferences?.label || addr }))
    },
    [accounts, addToast, t]
  )

  const renderItem = useCallback(
    ({ item: account }: any) => {
      return (
        <Account
          onSelect={onSelectAccount}
          key={account.addr}
          account={account}
          maxAccountAddrLength={shortenAccountAddr()}
          showExportImport
          isSelectable={false}
          openAddAccountBottomSheet={openBottomSheet}
        />
      )
    },
    [onSelectAccount, shortenAccountAddr, openBottomSheet]
  )

  return (
    <>
      <SettingsPageHeader title="Accounts">
        <Search autoFocus placeholder="Search for account" control={control} />
      </SettingsPageHeader>
      <View style={flexbox.flex1} ref={accountsContainerRef}>
        <ScrollableWrapper
          type={WRAPPER_TYPES.FLAT_LIST}
          style={[spacings.mb]}
          data={accounts}
          renderItem={renderItem}
          getItemLayout={getItemLayout}
          keyExtractor={keyExtractor}
          ListEmptyComponent={<Text>{t('No accounts found')}</Text>}
        />
      </View>
      <Button
        type="secondary"
        onPress={openBottomSheet as any}
        text="+ Add account"
        hasBottomSpacing={false}
      />
      <BottomSheet
        id="account-settings-add-account"
        sheetRef={sheetRef}
        adjustToContentHeight={!getUiType().isPopup}
        closeBottomSheet={closeBottomSheet}
        scrollViewProps={{ showsVerticalScrollIndicator: false }}
      >
        <AddAccount handleClose={closeBottomSheet as any} />
      </BottomSheet>
    </>
  )
}

export default React.memo(AccountsSettingsScreen)
