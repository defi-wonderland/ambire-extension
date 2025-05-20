import React, { useCallback, useMemo } from 'react'
import { useTranslation } from 'react-i18next'
import { View } from 'react-native'

import { SigningStatus } from '@ambire-common/controllers/signAccountOp/signAccountOp'
import BottomSheet from '@common/components/BottomSheet'
import Button from '@common/components/Button'
import Text from '@common/components/Text'
import useSign from '@common/hooks/useSign'
import useTheme from '@common/hooks/useTheme'
import spacings from '@common/styles/spacings'
import flexbox from '@common/styles/utils/flexbox'
import useBackgroundService from '@web/hooks/useBackgroundService'
import useSwapAndBridgeControllerState from '@web/hooks/useSwapAndBridgeControllerState'
import Estimation from '@web/modules/sign-account-op/components/Estimation'
import Modals from '@web/modules/sign-account-op/components/Modals/Modals'
import SigningKeySelect from '@web/modules/sign-message/components/SignKeySelect'
import { getUiType } from '@web/utils/uiType'

type Props = {
  closeEstimationModal: () => void
  estimationModalRef: React.RefObject<any>
}

const { isActionWindow, isTab } = getUiType()

const SwapAndBridgeEstimation = ({ closeEstimationModal, estimationModalRef }: Props) => {
  const { t } = useTranslation()
  const { theme } = useTheme()

  const { dispatch } = useBackgroundService()
  const { signAccountOpController, hasProceeded, swapSignErrors } =
    useSwapAndBridgeControllerState()

  const signingErrors = useMemo(() => {
    const signAccountOpErrors = signAccountOpController ? signAccountOpController.errors : []
    return [...swapSignErrors, ...signAccountOpErrors]
  }, [swapSignErrors, signAccountOpController])

  /**
   * Single click broadcast
   */
  const handleBroadcastAccountOp = useCallback(() => {
    dispatch({
      type: 'MAIN_CONTROLLER_HANDLE_SIGN_AND_BROADCAST_ACCOUNT_OP',
      params: {
        isSwapAndBridge: true
      }
    })
  }, [dispatch])

  const handleUpdateStatus = useCallback(
    (status: SigningStatus) => {
      dispatch({
        type: 'SWAP_AND_BRIDGE_CONTROLLER_SIGN_ACCOUNT_OP_UPDATE_STATUS',
        params: {
          status
        }
      })
    },
    [dispatch]
  )
  const updateController = useCallback(
    (params: { signingKeyAddr?: string; signingKeyType?: string }) => {
      dispatch({
        type: 'SWAP_AND_BRIDGE_CONTROLLER_SIGN_ACCOUNT_OP_UPDATE',
        params
      })
    },
    [dispatch]
  )

  const {
    isViewOnly,
    hasEstimation,
    signingKeyType,
    feePayerKeyType,
    handleDismissLedgerConnectModal,
    shouldDisplayLedgerConnectModal,
    isChooseSignerShown,
    setIsChooseSignerShown,
    isSignLoading,
    renderedButNotNecessarilyVisibleModal,
    handleChangeSigningKey,
    onSignButtonClick,
    isSignDisabled,
    warningToPromptBeforeSign,
    warningModalRef,
    dismissWarning,
    acknowledgeWarning,
    slowPaymasterRequest
  } = useSign({
    signAccountOpState: signAccountOpController,
    handleBroadcast: handleBroadcastAccountOp,
    handleUpdate: updateController,
    handleUpdateStatus,
    isOneClickSign: true
  })

  return (
    <>
      <BottomSheet
        id="estimation-modal"
        sheetRef={estimationModalRef}
        type={isTab ? 'modal' : 'bottom-sheet'}
        backgroundColor="primaryBackground"
        // NOTE: This must be lower than SigningKeySelect's z-index
        customZIndex={5}
        autoOpen={hasProceeded || (isActionWindow && !!signAccountOpController)}
        isScrollEnabled={false}
        shouldBeClosableOnDrag={false}
      >
        {!!signAccountOpController && (
          <View>
            <SigningKeySelect
              isVisible={isChooseSignerShown}
              isSigning={isSignLoading || !signAccountOpController.readyToSign}
              handleClose={() => setIsChooseSignerShown(false)}
              selectedAccountKeyStoreKeys={signAccountOpController.accountKeyStoreKeys}
              handleChooseSigningKey={handleChangeSigningKey}
              account={signAccountOpController.account}
            />
            <Estimation
              updateType="Swap&Bridge"
              signAccountOpState={signAccountOpController}
              disabled={signAccountOpController.status?.type !== SigningStatus.ReadyToSign}
              hasEstimation={!!hasEstimation}
              // TODO<oneClickSwap>
              slowRequest={false}
              // TODO<oneClickSwap>
              isViewOnly={isViewOnly}
              isSponsored={signAccountOpController ? signAccountOpController.isSponsored : false}
              sponsor={signAccountOpController ? signAccountOpController.sponsor : undefined}
            />
            {signingErrors.length > 0 && (
              <View style={[flexbox.directionRow, flexbox.alignEnd, spacings.mt]}>
                <Text fontSize={12} appearance="errorText">
                  {t(signingErrors[0].title)}
                </Text>
              </View>
            )}
            <View
              style={{
                height: 1,
                backgroundColor: theme.secondaryBorder,
                ...spacings.mvLg
              }}
            />
            <View style={[flexbox.directionRow, flexbox.alignCenter, flexbox.justifySpaceBetween]}>
              <Button
                testID="swap-button-back"
                type="secondary"
                text={t('Back')}
                onPress={closeEstimationModal}
                hasBottomSpacing={false}
                disabled={isSignLoading}
                style={{ width: 98 }}
              />
              <Button
                text={isSignLoading ? t('Signing...') : t('Sign')}
                hasBottomSpacing={false}
                disabled={isSignDisabled || signingErrors.length > 0}
                onPress={onSignButtonClick}
                style={{ minWidth: 160 }}
              />
            </View>
          </View>
        )}
      </BottomSheet>
      <Modals
        renderedButNotNecessarilyVisibleModal={renderedButNotNecessarilyVisibleModal}
        signAccountOpState={signAccountOpController}
        warningModalRef={warningModalRef}
        feePayerKeyType={feePayerKeyType}
        signingKeyType={signingKeyType}
        slowPaymasterRequest={slowPaymasterRequest}
        shouldDisplayLedgerConnectModal={shouldDisplayLedgerConnectModal}
        handleDismissLedgerConnectModal={handleDismissLedgerConnectModal}
        warningToPromptBeforeSign={warningToPromptBeforeSign}
        acknowledgeWarning={acknowledgeWarning}
        dismissWarning={dismissWarning}
        autoOpen={
          // Display the warning automatically if the user closed
          // the extension popup while the warning modal was open.
          warningToPromptBeforeSign &&
          renderedButNotNecessarilyVisibleModal === 'warnings' &&
          isSignLoading
            ? 'warnings'
            : undefined
        }
      />
    </>
  )
}

export default SwapAndBridgeEstimation
