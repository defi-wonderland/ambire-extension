import React, { FC } from 'react'
import { useTranslation } from 'react-i18next'
import { View, ViewStyle } from 'react-native'
import { useModalize } from 'react-native-modalize'

import NoKeysIcon from '@common/assets/svg/NoKeysIcon'
import AccountKeysBottomSheet from '@common/components/AccountKeysBottomSheet'
import Alert from '@common/components/Alert'
import useTheme from '@common/hooks/useTheme'
import useSelectedAccountControllerState from '@web/hooks/useSelectedAccountControllerState'
import AddAccount from '@web/modules/account-select/components/AddAccount'
import { getUiType } from '@web/utils/uiType'

import BottomSheet from '../BottomSheet'

interface Props {
  style?: ViewStyle
  isTransaction?: boolean
}

const NoKeysToSignAlert: FC<Props> = ({ style, isTransaction = true }) => {
  const { account } = useSelectedAccountControllerState()
  const { ref: sheetRef, open: openBottomSheet, close: closeBottomSheet } = useModalize()
  const { ref: addAccountsRef, open: openAddAccounts, close: closeAddAccounts } = useModalize()
  const { t } = useTranslation()
  const { theme } = useTheme()

  // should never happen (selected account details are always present)
  if (!account) return null

  return (
    <View style={{ display: 'flex', alignContent: 'center', justifyContent: 'center', ...style }}>
      <Alert
        type="error"
        title={t(`No keys available to sign this ${isTransaction ? 'transaction' : 'message'}`)}
        text={t(
          "This account was imported in view-only mode, which means that there isn't an imported key that can sign for this account. \nIf you do have such a key, please re-import the account with it."
        )}
        customIcon={() => <NoKeysIcon color={theme.secondaryText} />}
        buttonProps={{
          onPress: () => openBottomSheet(),
          text: t('Import Key'),
          type: 'error'
        }}
      />
      <AccountKeysBottomSheet
        sheetRef={sheetRef}
        closeBottomSheet={closeBottomSheet}
        account={account}
        showExportImport
        openAddAccountBottomSheet={openAddAccounts}
      />
      <BottomSheet
        id="no-key-add-account"
        sheetRef={addAccountsRef}
        adjustToContentHeight={!getUiType().isPopup}
        closeBottomSheet={closeBottomSheet}
        scrollViewProps={{ showsVerticalScrollIndicator: false }}
      >
        <AddAccount handleClose={closeAddAccounts as any} />
      </BottomSheet>
    </View>
  )
}

export default React.memo(NoKeysToSignAlert)
