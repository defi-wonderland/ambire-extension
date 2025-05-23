import React from 'react'
import { Pressable, View } from 'react-native'

import { Account } from '@ambire-common/interfaces/account'
import { Key } from '@ambire-common/interfaces/keystore'
import AccountKey from '@common/components/AccountKey'
import Spinner from '@common/components/Spinner'
import Text from '@common/components/Text'
import useTheme from '@common/hooks/useTheme'
import { SPACING_LG } from '@common/styles/spacings'
import { Portal } from '@gorhom/portal'
import useKeystoreControllerState from '@web/hooks/useKeystoreControllerState'

import getStyles from './styles'

type Props = {
  selectedAccountKeyStoreKeys: Key[]
  handleChooseSigningKey: (keyAddr: Key['addr'], keyType: Key['type']) => void
  isVisible: boolean
  isSigning: boolean
  handleClose: () => void
  account: Account
}

const SigningKeySelect = ({
  selectedAccountKeyStoreKeys,
  handleChooseSigningKey,
  isVisible,
  isSigning,
  handleClose,
  account
}: Props) => {
  const { theme, styles } = useTheme(getStyles)
  const { keys } = useKeystoreControllerState()

  if (!isVisible) return null

  return (
    <Portal hostName="global">
      <Pressable onPress={handleClose} style={styles.overlay} />
      <View
        style={[
          styles.container,
          {
            right: SPACING_LG
          }
        ]}
      >
        <Text style={styles.title} fontSize={16} weight="medium" appearance="secondaryText">
          Select a signing key
        </Text>
        <View>
          {selectedAccountKeyStoreKeys.map((key, i) => {
            const isImported = keys.some((k) => k.addr === key.addr && k.type === key.type)

            return (
              <Pressable
                key={`${key.addr}-${key.type}`}
                onPress={() => handleChooseSigningKey(key.addr, key.type)}
                style={({ hovered }: any) => ({
                  backgroundColor: hovered ? theme.secondaryBackground : 'transparent'
                })}
                disabled={isSigning}
              >
                <AccountKey
                  addr={key.addr}
                  type={key.type}
                  dedicatedToOneSA={key.dedicatedToOneSA}
                  label={key.label || `Key ${i + 1}`}
                  isLast={i === selectedAccountKeyStoreKeys.length - 1}
                  isImported={isImported}
                  enableEditing={false}
                  account={account}
                  keyIconColor="#000"
                />
              </Pressable>
            )
          })}
          {isSigning && (
            <View style={styles.spinner}>
              <Spinner />
            </View>
          )}
        </View>
      </View>
    </Portal>
  )
}

export default SigningKeySelect
