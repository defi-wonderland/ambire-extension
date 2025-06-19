/* eslint-disable @typescript-eslint/no-floating-promises */
import React, { useCallback, useEffect, useMemo, useState } from 'react'
import { useTranslation } from 'react-i18next'
import { StyleSheet, View } from 'react-native'

import { SignMessageAction } from '@ambire-common/controllers/actions/actions'
import { Key } from '@ambire-common/interfaces/keystore'
import { PlainTextMessage, TypedMessage } from '@ambire-common/interfaces/userRequest'
import { isSmartAccount } from '@ambire-common/libs/account/account'
import { humanizeMessage } from '@ambire-common/libs/humanizer'
import { EIP_1271_NOT_SUPPORTED_BY } from '@ambire-common/libs/signMessage/signMessage'
import NoKeysToSignAlert from '@common/components/NoKeysToSignAlert'
import Spinner from '@common/components/Spinner'
import useTheme from '@common/hooks/useTheme'
import { THEME_TYPES } from '@common/styles/themeConfig'
import flexbox from '@common/styles/utils/flexbox'
import HeaderAccountAndNetworkInfo from '@web/components/HeaderAccountAndNetworkInfo'
import SmallNotificationWindowWrapper from '@web/components/SmallNotificationWindowWrapper'
import { TabLayoutContainer } from '@web/components/TabLayoutWrapper/TabLayoutWrapper'
import useActionsControllerState from '@web/hooks/useActionsControllerState'
import useBackgroundService from '@web/hooks/useBackgroundService'
import useKeystoreControllerState from '@web/hooks/useKeystoreControllerState'
import useNetworksControllerState from '@web/hooks/useNetworksControllerState'
import useSelectedAccountControllerState from '@web/hooks/useSelectedAccountControllerState'
import useSignMessageControllerState from '@web/hooks/useSignMessageControllerState'
import ActionFooter from '@web/modules/action-requests/components/ActionFooter'
import useLedger from '@web/modules/hardware-wallet/hooks/useLedger'
import SigningKeySelect from '@web/modules/sign-message/components/SignKeySelect'

import Authorization7702 from './Contents/authorization7702'
import Main from './Contents/main'
import getStyles from './styles'

const SignMessageScreen = () => {
  const { t } = useTranslation()
  const signMessageState = useSignMessageControllerState()
  const signStatus = signMessageState.statuses.sign
  const [hasReachedBottom, setHasReachedBottom] = useState<boolean | null>(null)
  const keystoreState = useKeystoreControllerState()
  const { account } = useSelectedAccountControllerState()
  const { networks } = useNetworksControllerState()
  const { dispatch } = useBackgroundService()
  const { isLedgerConnected } = useLedger()
  const [isChooseSignerShown, setIsChooseSignerShown] = useState(false)
  const [shouldDisplayLedgerConnectModal, setShouldDisplayLedgerConnectModal] = useState(false)
  const [makeItSmartConfirmed, setMakeItSmartConfirmed] = useState(false)
  const [doNotAskMeAgain, setDoNotAskMeAgain] = useState(false)
  const actionState = useActionsControllerState()
  const { styles, theme, themeType } = useTheme(getStyles)

  const signMessageAction = useMemo(() => {
    if (actionState.currentAction?.type !== 'signMessage') return undefined

    return actionState.currentAction as SignMessageAction
  }, [actionState.currentAction])

  const userRequest = useMemo(() => {
    if (!signMessageAction) return undefined
    if (
      !['typedMessage', 'message', 'authorization-7702'].includes(
        signMessageAction.userRequest.action.kind
      )
    )
      return undefined

    return signMessageAction.userRequest
  }, [signMessageAction])

  const isAuthorization = useMemo(() => {
    if (!signMessageAction) return false
    if (signMessageAction.userRequest.action.kind !== 'authorization-7702') return false
    if (!signMessageAction.userRequest.meta.show7702Info) return false

    return true
  }, [signMessageAction])

  const selectedAccountKeyStoreKeys = useMemo(
    () => keystoreState.keys.filter((key) => account?.associatedKeys.includes(key.addr)),
    [keystoreState.keys, account?.associatedKeys]
  )

  const network = useMemo(
    () =>
      networks.find((n) => {
        return signMessageState.messageToSign?.content.kind === 'typedMessage' &&
          signMessageState.messageToSign?.content.domain.chainId
          ? n.chainId.toString() === signMessageState.messageToSign?.content.domain.chainId
          : n.chainId === signMessageState.messageToSign?.chainId
      }),
    [networks, signMessageState.messageToSign]
  )
  const isViewOnly = useMemo(
    () => selectedAccountKeyStoreKeys.length === 0,
    [selectedAccountKeyStoreKeys.length]
  )
  const humanizedMessage = useMemo(() => {
    if (!signMessageState?.messageToSign) return
    return humanizeMessage(signMessageState.messageToSign)
  }, [signMessageState])

  const visualizeHumanized = useMemo(
    () =>
      humanizedMessage?.fullVisualization &&
      network &&
      signMessageState.messageToSign?.content.kind,
    [network, humanizedMessage, signMessageState.messageToSign?.content?.kind]
  )

  const isScrollToBottomForced = useMemo(
    () => typeof hasReachedBottom === 'boolean' && !hasReachedBottom && !visualizeHumanized,
    [hasReachedBottom, visualizeHumanized]
  )

  useEffect(() => {
    const isAlreadyInit = signMessageState.messageToSign?.fromActionId === signMessageAction?.id

    if (!userRequest || !signMessageAction || isAlreadyInit) return

    dispatch({
      type: 'MAIN_CONTROLLER_SIGN_MESSAGE_INIT',
      params: {
        dapp: {
          name: userRequest?.session?.name || '',
          icon: userRequest?.session?.icon || ''
        },
        messageToSign: {
          accountAddr: userRequest.meta.accountAddr,
          chainId: userRequest.meta.chainId,
          content: userRequest.action as PlainTextMessage | TypedMessage,
          fromActionId: signMessageAction.id,
          signature: null
        }
      }
    })
  }, [dispatch, userRequest, signMessageAction, signMessageState.messageToSign?.fromActionId])

  useEffect(() => {
    return () => {
      dispatch({ type: 'MAIN_CONTROLLER_SIGN_MESSAGE_RESET' })
    }
  }, [dispatch])

  const handleReject = () => {
    if (!signMessageAction || !userRequest) return

    dispatch({
      type: 'MAIN_CONTROLLER_REJECT_USER_REQUEST',
      params: {
        err: t('User rejected the request.'),
        id: userRequest.id
      }
    })
  }

  const handleSign = useCallback(
    (chosenSigningKeyAddr?: Key['addr'], chosenSigningKeyType?: Key['type']) => {
      if (isAuthorization && !makeItSmartConfirmed) {
        setMakeItSmartConfirmed(true)
        setDoNotAskMeAgain(false)
        return
      }

      // Has more than one key, should first choose the key to sign with
      const hasChosenSigningKey = chosenSigningKeyAddr && chosenSigningKeyType
      const hasMultipleKeys = selectedAccountKeyStoreKeys.length > 1
      if (hasMultipleKeys && !hasChosenSigningKey) {
        return setIsChooseSignerShown(true)
      }

      const isLedgerKeyChosen = hasMultipleKeys
        ? // Accounts with multiple keys have an additional step to choose the key first
          chosenSigningKeyType === 'ledger'
        : // Take the key type from the account key itself, no additional step to choose key
          selectedAccountKeyStoreKeys[0].type === 'ledger'
      if (isLedgerKeyChosen && !isLedgerConnected) {
        setShouldDisplayLedgerConnectModal(true)
        return
      }

      const keyAddr = chosenSigningKeyAddr || selectedAccountKeyStoreKeys[0].addr
      const keyType = chosenSigningKeyType || selectedAccountKeyStoreKeys[0].type

      dispatch({
        type: 'MAIN_CONTROLLER_HANDLE_SIGN_MESSAGE',
        params: { keyAddr, keyType }
      })
    },
    [
      dispatch,
      isLedgerConnected,
      selectedAccountKeyStoreKeys,
      makeItSmartConfirmed,
      isAuthorization
    ]
  )

  const resolveButtonText = useMemo(() => {
    if (isScrollToBottomForced) return t('Read the message')

    if (signStatus === 'LOADING') return t('Signing...')

    if (isAuthorization && !makeItSmartConfirmed) return 'Add smart features'

    return t('Sign')
  }, [isScrollToBottomForced, signStatus, t, isAuthorization, makeItSmartConfirmed])

  const rejectButtonText = useMemo(() => {
    if (isAuthorization && doNotAskMeAgain) return 'Skip'
    if (isAuthorization) return 'Skip for now'
    return 'Reject'
  }, [isAuthorization, doNotAskMeAgain])

  const handleDismissLedgerConnectModal = useCallback(() => {
    setShouldDisplayLedgerConnectModal(false)
  }, [])

  const shouldDisplayEIP1271Warning = useMemo(() => {
    const dappOrigin = userRequest?.session?.origin

    if (!dappOrigin || !isSmartAccount(account)) return false

    return EIP_1271_NOT_SUPPORTED_BY.some((origin) => dappOrigin.includes(origin))
  }, [account, userRequest?.session?.origin])

  const onDoNotAskMeAgainChange = useCallback(() => {
    setDoNotAskMeAgain(!doNotAskMeAgain)
  }, [doNotAskMeAgain])

  // In the split second when the action window opens, but the state is not yet
  // initialized, to prevent a flash of the fallback visualization, show a
  // loading spinner instead (would better be a skeleton, but whatever).
  if (!signMessageState.isInitialized || !account || !signMessageAction) {
    return (
      <View style={[StyleSheet.absoluteFill, flexbox.center]}>
        <Spinner />
      </View>
    )
  }

  return (
    <SmallNotificationWindowWrapper>
      <TabLayoutContainer
        width="full"
        header={
          <HeaderAccountAndNetworkInfo
            backgroundColor={
              themeType === THEME_TYPES.DARK
                ? (theme.secondaryBackground as string)
                : (theme.primaryBackground as string)
            }
          />
        }
        footer={
          <ActionFooter
            onReject={handleReject}
            onResolve={handleSign}
            resolveButtonText={resolveButtonText}
            resolveDisabled={signStatus === 'LOADING' || isScrollToBottomForced || isViewOnly}
            resolveButtonTestID="button-sign"
            rejectButtonText={rejectButtonText}
          />
        }
        backgroundColor={
          isAuthorization && !makeItSmartConfirmed
            ? theme.primaryBackground
            : theme.quinaryBackground
        }
      >
        <SigningKeySelect
          isVisible={isChooseSignerShown}
          isSigning={signStatus === 'LOADING'}
          selectedAccountKeyStoreKeys={selectedAccountKeyStoreKeys}
          handleChooseSigningKey={handleSign}
          handleClose={() => setIsChooseSignerShown(false)}
          account={account}
        />
        {isAuthorization && !makeItSmartConfirmed ? (
          <Authorization7702
            onDoNotAskMeAgainChange={onDoNotAskMeAgainChange}
            doNotAskMeAgain={doNotAskMeAgain}
            displayFullInformation
          />
        ) : (
          <Main
            shouldDisplayLedgerConnectModal={shouldDisplayLedgerConnectModal}
            isLedgerConnected={isLedgerConnected}
            handleDismissLedgerConnectModal={handleDismissLedgerConnectModal}
            hasReachedBottom={hasReachedBottom}
            setHasReachedBottom={setHasReachedBottom}
            shouldDisplayEIP1271Warning={shouldDisplayEIP1271Warning}
          />
        )}
        {isViewOnly && (
          <View style={styles.noKeysToSignAlert}>
            <NoKeysToSignAlert style={{ width: '100%' }} isTransaction={false} />
          </View>
        )}
      </TabLayoutContainer>
    </SmallNotificationWindowWrapper>
  )
}

export default React.memo(SignMessageScreen)
