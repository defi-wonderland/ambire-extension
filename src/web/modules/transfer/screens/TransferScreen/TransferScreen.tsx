import React, { useCallback, useMemo, useRef } from 'react'
import { Trans, useTranslation } from 'react-i18next'
import { Pressable, View } from 'react-native'
import { useModalize } from 'react-native-modalize'

import { FEE_COLLECTOR } from '@ambire-common/consts/addresses'
import { ActionExecutionType } from '@ambire-common/controllers/actions/actions'
import { AddressStateOptional } from '@temp/domains'
import { isSmartAccount as getIsSmartAccount } from '@ambire-common/libs/account/account'
import BatchIcon from '@common/assets/svg/BatchIcon'
import InfoIcon from '@common/assets/svg/InfoIcon'
import Alert from '@common/components/Alert'
import BackButton from '@common/components/BackButton'
import BottomSheet from '@common/components/BottomSheet'
import Button from '@common/components/Button'
import Checkbox from '@common/components/Checkbox'
import DualChoiceModal from '@common/components/DualChoiceModal'
import SkeletonLoader from '@common/components/SkeletonLoader'
import Text from '@common/components/Text'
import useAddressInput from '@common/hooks/useAddressInput'
import useNavigation from '@common/hooks/useNavigation'
import useTheme from '@common/hooks/useTheme'
import useToast from '@common/hooks/useToast'
import { ROUTES } from '@common/modules/router/constants/common'
import spacings from '@common/styles/spacings'
import flexbox from '@common/styles/utils/flexbox'
import { getAddressFromAddressState } from '@common/utils/domains'
import { Content, Form, Wrapper } from '@web/components/TransactionsScreen'
import { createTab } from '@web/extension-services/background/webapi/tab'
import useActionsControllerState from '@web/hooks/useActionsControllerState'
import useBackgroundService from '@web/hooks/useBackgroundService'
import useHasGasTank from '@web/hooks/useHasGasTank'
import useMainControllerState from '@web/hooks/useMainControllerState'
import useSelectedAccountControllerState from '@web/hooks/useSelectedAccountControllerState'
import useTransferControllerState from '@web/hooks/useTransferControllerState'
import GasTankInfoModal from '@web/modules/transfer/components/GasTankInfoModal'
import SendForm from '@web/modules/transfer/components/SendForm/SendForm'
import { getUiType } from '@web/utils/uiType'

const { isPopup } = getUiType()

const TransferScreen = () => {
  const { dispatch } = useBackgroundService()
  const { addToast } = useToast()
  const { state, transferCtrl } = useTransferControllerState()
  const {
    isTopUp,
    validationFormMsgs,
    addressState,
    isRecipientHumanizerKnownTokenOrSmartContract,
    isSWWarningVisible,
    isRecipientAddressUnknown,
    isFormValid
  } = state

  const { navigate } = useNavigation()
  const { t } = useTranslation()
  const { theme } = useTheme()
  const { account, portfolio } = useSelectedAccountControllerState()
  const isSmartAccount = account ? getIsSmartAccount(account) : false
  const { ref: sheetRef, open: openBottomSheet, close: closeBottomSheet } = useModalize()
  const {
    ref: gasTankSheetRef,
    open: openGasTankInfoBottomSheet,
    close: closeGasTankInfoBottomSheet
  } = useModalize()
  const { userRequests } = useMainControllerState()
  const actionsState = useActionsControllerState()
  const { hasGasTank } = useHasGasTank({ account })
  const recipientMenuClosedAutomatically = useRef(false)

  const hasFocusedActionWindow = useMemo(
    () => actionsState.actionWindow.windowProps?.focused,
    [actionsState.actionWindow.windowProps]
  )

  // Requests filtered by the selected account only.
  // This enables the "Sign all Pending" button even if the selected token's network differs
  // from the network of active requests and the form is empty.
  // For example, on a particular network, if the user has only one token and sends its maximum amount,
  // the auto-selected token could belong to a different network.
  // In such cases, we ensure a simple way to sign the current transaction, even across networks.
  const transactionUserRequestsByAccount = useMemo(() => {
    return userRequests.filter((r) => {
      const isSelectedAccountAccountOp =
        r.action.kind === 'calls' && r.meta.accountAddr === account?.addr

      return isSelectedAccountAccountOp
    })
  }, [account?.addr, userRequests])

  // Requests filtered by current account and the selected token's network
  const transactionUserRequests = useMemo(() => {
    return transactionUserRequestsByAccount.filter((r) => {
      const isMatchingSelectedTokenNetwork = r.meta.chainId === state.selectedToken?.chainId

      return !state.selectedToken || isMatchingSelectedTokenNetwork
    })
  }, [transactionUserRequestsByAccount, state.selectedToken])

  const doesUserMeetMinimumBalanceForGasTank = useMemo(() => {
    return portfolio.totalBalance >= 10
  }, [portfolio.totalBalance])

  const hasActiveRequests = useMemo(
    () => !!transactionUserRequests.length && !hasFocusedActionWindow,
    [transactionUserRequests, hasFocusedActionWindow]
  )

  const setAddressState = useCallback(
    (newPartialAddressState: AddressStateOptional) => {
      transferCtrl.update({ addressState: newPartialAddressState })
    },
    [transferCtrl]
  )

  const handleCacheResolvedDomain = useCallback(
    (address: string, domain: string, type: 'ens') => {
      dispatch({
        type: 'DOMAINS_CONTROLLER_SAVE_RESOLVED_REVERSE_LOOKUP',
        params: {
          type,
          address,
          name: domain
        }
      })
    },
    [dispatch]
  )

  const addressInputState = useAddressInput({
    addressState,
    setAddressState,
    overwriteError:
      state?.isInitialized && !validationFormMsgs.recipientAddress.success
        ? validationFormMsgs.recipientAddress.message
        : '',
    overwriteValidLabel: validationFormMsgs?.recipientAddress.success
      ? validationFormMsgs.recipientAddress.message
      : '',
    addToast,
    handleCacheResolvedDomain
  })

  const isFormEmpty = useMemo(() => {
    return (!transferCtrl.amount && !transferCtrl.recipientAddress) || !transferCtrl.selectedToken
  }, [transferCtrl.amount, transferCtrl.recipientAddress, transferCtrl.selectedToken])

  const submitButtonText = useMemo(() => {
    if (hasFocusedActionWindow) return isTopUp ? t('Top Up') : t('Send')

    let numOfRequests = transactionUserRequests.length

    // This ensures the button count updates correctly when there are no transactionUserRequests on the selected token network,
    // but pending requests exist for the current account.
    if (!numOfRequests && isFormEmpty && transactionUserRequestsByAccount.length) {
      numOfRequests = transactionUserRequestsByAccount.length
    }

    if (numOfRequests) {
      if (isTopUp ? isFormValid : isFormValid && !addressInputState.validation.isError) {
        numOfRequests++ // the queued txns + the one from the form
      }

      if (isFormEmpty) return t('Sign All Pending ({{count}})', { count: numOfRequests })
      return isTopUp ? t('Top Up') : t('Send')
    }

    return isTopUp ? t('Top Up') : t('Send')
  }, [
    isTopUp,
    transactionUserRequests,
    transactionUserRequestsByAccount.length,
    addressInputState.validation.isError,
    isFormValid,
    isFormEmpty,
    hasFocusedActionWindow,
    t
  ])

  const isTransferFormValid = useMemo(
    () => (isTopUp ? isFormValid : isFormValid && !addressInputState.validation.isError),
    [addressInputState.validation.isError, isFormValid, isTopUp]
  )

  const isSendButtonDisabled = useMemo(() => {
    if (transactionUserRequests.length && !hasFocusedActionWindow) {
      return !isFormEmpty && !isTransferFormValid
    }

    // This ensures the button remains enabled even when there are no transactionUserRequests on the selected token network,
    // but pending requests exist for the current account.
    if (transactionUserRequestsByAccount.length && !hasFocusedActionWindow) {
      return !isFormEmpty && !isTransferFormValid
    }

    return !isTransferFormValid
  }, [
    isFormEmpty,
    isTransferFormValid,
    transactionUserRequests.length,
    transactionUserRequestsByAccount.length,
    hasFocusedActionWindow
  ])

  const onBack = useCallback(() => {
    transferCtrl.resetForm()
    navigate(ROUTES.dashboard)
  }, [navigate, transferCtrl])

  const resetTransferForm = useCallback(() => {
    transferCtrl.resetForm()
    recipientMenuClosedAutomatically.current = false
  }, [transferCtrl])

  const addTransaction = useCallback(
    (actionExecutionType: ActionExecutionType) => {
      if (isFormValid && state.selectedToken) {
        if (actionExecutionType === 'queue' && !transferCtrl.shouldSkipTransactionQueuedModal) {
          openBottomSheet()
        }

        dispatch({
          type: 'MAIN_CONTROLLER_BUILD_TRANSFER_USER_REQUEST',
          params: {
            amount: state.amount,
            selectedToken: state.selectedToken,
            recipientAddress: isTopUp ? FEE_COLLECTOR : getAddressFromAddressState(addressState),
            actionExecutionType
          }
        })

        resetTransferForm()
        return
      }

      if (
        actionExecutionType === 'open-action-window' &&
        (transactionUserRequests.length || transactionUserRequestsByAccount.length) &&
        isFormEmpty
      ) {
        const firstAccountOpAction = actionsState.visibleActionsQueue
          .reverse()
          .find((a) => a.type === 'accountOp')
        if (!firstAccountOpAction) return
        dispatch({
          type: 'ACTIONS_CONTROLLER_SET_CURRENT_ACTION_BY_ID',
          params: { actionId: firstAccountOpAction?.id }
        })
      }
    },
    [
      transferCtrl,
      addressState,
      isTopUp,
      state.amount,
      state.selectedToken,
      isFormEmpty,
      transactionUserRequests.length,
      transactionUserRequestsByAccount.length,
      actionsState,
      isFormValid,
      dispatch,
      openBottomSheet,
      resetTransferForm
    ]
  )

  const handleGasTankInfoPressed = useCallback(
    () => openGasTankInfoBottomSheet(),
    [openGasTankInfoBottomSheet]
  )

  const gasTankLabelWithInfo = useMemo(() => {
    return (
      <View style={flexbox.directionRow}>
        <Text
          fontSize={20}
          weight="medium"
          appearance="primaryText"
          numberOfLines={1}
          style={spacings.mrMi}
        >
          {t('Top Up Gas Tank')}
        </Text>
        <Pressable style={[flexbox.center]} onPress={handleGasTankInfoPressed}>
          <InfoIcon width={20} height={20} />
        </Pressable>
      </View>
    )
  }, [handleGasTankInfoPressed, t])

  // Title shown in BottomSheet header
  const headerTitle = useMemo(
    () => (state.isTopUp ? gasTankLabelWithInfo : t('Send')),
    [state.isTopUp, gasTankLabelWithInfo, t]
  )

  // Title shown before SendToken component
  const formTitle = useMemo(() => {
    if (state.isTopUp) {
      if (isPopup) {
        return t('Top Up')
      }

      return gasTankLabelWithInfo
    }

    return t('Send')
  }, [state.isTopUp, t, gasTankLabelWithInfo])

  const buttons = useMemo(() => {
    return (
      <>
        {!isPopup && <BackButton onPress={onBack} />}
        <View style={[flexbox.directionRow, !isPopup && flexbox.flex1, flexbox.justifyEnd]}>
          <Button
            testID="transfer-queue-and-add-more-button"
            type="outline"
            accentColor={theme.primary}
            text={
              hasActiveRequests
                ? t('Add to batch ({{count}})', { count: transactionUserRequests.length })
                : t('Start a batch')
            }
            onPress={() => addTransaction('queue')}
            disabled={!isFormValid || (!isTopUp && addressInputState.validation.isError)}
            hasBottomSpacing={false}
            style={{ minWidth: 160, ...spacings.phMd }}
          >
            <BatchIcon style={spacings.mlTy} />
          </Button>
          <Button
            testID="transfer-button-confirm"
            type="primary"
            text={submitButtonText}
            onPress={() => addTransaction('open-action-window')}
            hasBottomSpacing={false}
            style={{ minWidth: 160, ...spacings.ph, ...spacings.mlLg }}
            disabled={isSendButtonDisabled}
          />
        </View>
      </>
    )
  }, [
    addTransaction,
    addressInputState.validation.isError,
    hasActiveRequests,
    isFormValid,
    isSendButtonDisabled,
    isTopUp,
    onBack,
    submitButtonText,
    t,
    theme.primary,
    transactionUserRequests.length
  ])

  const handleGoBackPress = useCallback(() => {
    transferCtrl.resetForm()
    navigate(ROUTES.dashboard)
  }, [navigate, transferCtrl])

  return (
    <Wrapper title={headerTitle} handleGoBack={handleGoBackPress} buttons={buttons}>
      <Content buttons={buttons}>
        {state?.isInitialized ? (
          <Form>
            <SendForm
              addressInputState={addressInputState}
              isSmartAccount={isSmartAccount}
              hasGasTank={hasGasTank}
              amountErrorMessage={validationFormMsgs.amount.message || ''}
              isRecipientAddressUnknown={isRecipientAddressUnknown}
              isRecipientHumanizerKnownTokenOrSmartContract={
                isRecipientHumanizerKnownTokenOrSmartContract
              }
              isSWWarningVisible={isSWWarningVisible}
              recipientMenuClosedAutomaticallyRef={recipientMenuClosedAutomatically}
              formTitle={formTitle}
            />
            {isTopUp && !hasGasTank && (
              <View style={spacings.ptLg}>
                <Alert
                  type="warning"
                  title={
                    <Trans>
                      The Gas Tank is exclusively available for Smart Accounts. It lets you pre-pay
                      for network fees using stable coins and other tokens and use the funds on any
                      chain.{' '}
                      <Pressable
                        onPress={async () => {
                          try {
                            await createTab(
                              'https://help.ambire.com/hc/en-us/articles/5397969913884-What-is-the-Gas-Tank'
                            )
                          } catch {
                            addToast("Couldn't open link", { type: 'error' })
                          }
                        }}
                      >
                        <Text appearance="warningText" underline>
                          {t('Learn more')}
                        </Text>
                      </Pressable>
                      .
                    </Trans>
                  }
                  isTypeLabelHidden
                />
              </View>
            )}
            {isTopUp && hasGasTank && (
              <View style={spacings.ptLg}>
                <Alert
                  type="warning"
                  title={t('Gas Tank deposits cannot be withdrawn')}
                  text={
                    !doesUserMeetMinimumBalanceForGasTank
                      ? t(
                          'Note: A minimum overall balance of $10 is required to pay for gas via the Gas Tank'
                        )
                      : false
                  }
                  isTypeLabelHidden
                />
              </View>
            )}
          </Form>
        ) : (
          <SkeletonLoader
            width={640}
            height={420}
            appearance="primaryBackground"
            style={{ marginLeft: 'auto', marginRight: 'auto' }}
          />
        )}
      </Content>
      <BottomSheet
        id="import-seed-phrase"
        sheetRef={sheetRef}
        closeBottomSheet={closeBottomSheet}
        backgroundColor="secondaryBackground"
        style={{ overflow: 'hidden', width: 496, ...spacings.ph0, ...spacings.pv0 }}
        type="modal"
      >
        <DualChoiceModal
          title={t('Transaction added to batch')}
          description={
            <View>
              <Text style={spacings.mbTy} appearance="secondaryText">
                {t(
                  'You can now add more transactions on this network and send them batched all together for signing.'
                )}
              </Text>
              <Text appearance="secondaryText" style={spacings.mbLg}>
                {t('All pending batch transactions are available on your Dashboard.')}
              </Text>
              <Checkbox
                value={transferCtrl.shouldSkipTransactionQueuedModal}
                onValueChange={() => {
                  transferCtrl.shouldSkipTransactionQueuedModal =
                    !transferCtrl.shouldSkipTransactionQueuedModal
                }}
                uncheckedBorderColor={theme.secondaryText}
                label={t("Don't show this modal again")}
                labelProps={{
                  style: {
                    color: theme.secondaryText
                  },
                  weight: 'medium'
                }}
                style={spacings.mb0}
              />
            </View>
          }
          onPrimaryButtonPress={closeBottomSheet}
          primaryButtonText={t('Got it')}
          primaryButtonTestID="queue-modal-got-it-button"
        />
      </BottomSheet>
      <GasTankInfoModal
        id="gas-tank-info"
        sheetRef={gasTankSheetRef}
        closeBottomSheet={closeGasTankInfoBottomSheet}
        onPrimaryButtonPress={closeGasTankInfoBottomSheet}
        portfolio={portfolio}
        account={account}
      />
    </Wrapper>
  )
}

export default React.memo(TransferScreen)
