import React, { FC } from 'react'
import { useTranslation } from 'react-i18next'

import { Key } from '@ambire-common/interfaces/keystore'
import Alert from '@common/components/Alert'
import Label from '@common/components/Label'
import Option from '@common/components/Option'
import Text from '@common/components/Text'
import useNavigation from '@common/hooks/useNavigation'
import spacings from '@common/styles/spacings'
import useKeystoreControllerState from '@web/hooks/useKeystoreControllerState'

import { getAddKeyOptions } from './helpers/getAddKeyOptions'

interface Props {
  isSmartAccount: boolean
  importedAccountKeys: Key[]
}

const AddAccountKeys: FC<Props> = ({ isSmartAccount, importedAccountKeys }) => {
  const { t } = useTranslation()
  const { navigate } = useNavigation()
  const { isReadyToStoreKeys } = useKeystoreControllerState()

  // Since EOAs have only 1 key, if the internal key is imported,
  // we should not show the option to import another key with a private key or
  // seed phrase, since it is irrelevant for this case.
  const isBasicAccWithImportedOneInternalKey =
    !isSmartAccount &&
    importedAccountKeys.length >= 1 &&
    importedAccountKeys.some((key) => key.type === 'internal')

  const addAccountOptions = getAddKeyOptions({
    navigate,
    t,
    isKeystoreSetup: isReadyToStoreKeys
  }).filter((o) => {
    return !(
      isBasicAccWithImportedOneInternalKey &&
      (o.key === 'private-key' || o.key === 'seed-phrase')
    )
  })

  return (
    <>
      <Text fontSize={18} weight="medium" style={spacings.mbMi}>
        {isSmartAccount ? t('Add more keys') : t('Add key from more sources')}
      </Text>
      <Label
        isTypeLabelHidden
        size="sm"
        text={
          isSmartAccount
            ? t(
                'Re-import this account to add more keys or to use the same key from multiple sources. A key with the same address could originate from either a private key, seed or a hardware wallet.'
              )
            : t(
                'EOA accounts have one key, sourced from a private key, seed, or a hardware wallet. Re-import the account from a different source to use its key from multiple sources.'
              )
        }
        style={spacings.mbSm}
        customTextStyle={{ textTransform: 'none' }}
        type="info"
      />
      {addAccountOptions.map((option) => (
        <Option
          key={option.text}
          text={option.text}
          icon={option.icon}
          onPress={option.onPress}
          iconProps={option?.iconProps}
        >
          {isBasicAccWithImportedOneInternalKey && (
            <Alert
              type="warning"
              isTypeLabelHidden
              style={spacings.mtTy}
              text={t(
                "Although importing a key from a hardware wallet to this EOA account is possible - it's discouraged due to account's private key already being imported. Remember, the primary purpose of hardware wallets is to serve as cold storage, keeping your keys securely offline."
              )}
            />
          )}
        </Option>
      ))}
    </>
  )
}

export default AddAccountKeys
