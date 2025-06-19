import React, { FC, useState } from 'react'

import { ERROR_MESSAGES } from '@legends/constants/errors/messages'
import getRecentActivity from '@legends/contexts/activityContext/helpers/recentActivity'
import useAccountContext from '@legends/hooks/useAccountContext'
import useDataPollingContext from '@legends/hooks/useDataPollingContext'
import useLegendsContext from '@legends/hooks/useLegendsContext'
import useToast from '@legends/hooks/useToast'
import ActionModal from '@legends/modules/legends/components/ActionModal'
import { PREDEFINED_ACTION_LABEL_MAP } from '@legends/modules/legends/constants'
import { CardActionType, CardFromResponse, CardStatus } from '@legends/modules/legends/types'

import CardContent from './CardContent'
import OnCompleteModal from './OnCompleteModal'

type Props = {
  cardData: CardFromResponse
}

const Card: FC<Props> = ({ cardData }) => {
  const { card, action } = cardData
  const disabled = card.status === CardStatus.disabled
  const predefinedId = action.type === CardActionType.predefined ? action.predefinedId : ''
  const buttonText = PREDEFINED_ACTION_LABEL_MAP[predefinedId] || 'Proceed'
  const [isActionModalOpen, setIsActionModalOpen] = useState(false)
  const [isOnCompleteModalVisible, setIsOnCompleteModalVisible] = useState(false)
  const { onLegendComplete, treasureChestStreak } = useLegendsContext()
  const { connectedAccount, v1Account } = useAccountContext()
  const { addToast } = useToast()
  const { startPolling, stopPolling } = useDataPollingContext()
  const nonConnectedAcc = Boolean(!connectedAccount || v1Account)

  const openActionModal = () => {
    stopPolling()
    setIsActionModalOpen(true)
  }

  const closeActionModal = () => {
    startPolling()
    setIsActionModalOpen(false)
  }

  const closeCompleteModal = () => {
    setIsOnCompleteModalVisible(false)
  }

  const pollActivityUntilComplete = async (txnId: string, attempt: number) => {
    if (!connectedAccount) return

    if (attempt > 10) {
      addToast(ERROR_MESSAGES.transactionProcessingFailed, { type: 'error' })
      return
    }

    // We can't rely on state as it's not updated due to the self-invoking nature of the function
    let newActivity

    try {
      newActivity = await getRecentActivity(connectedAccount)
    } catch (error) {
      console.error("Couldn't fetch the recent activity:", error)
    }

    const foundTxn = newActivity?.transactions?.find((txn) => txn.txId === txnId)

    if (!foundTxn) {
      if (attempt === 0) {
        addToast('We are processing your transaction. Expect your reward shortly.')
      }

      setTimeout(() => pollActivityUntilComplete(txnId, attempt + 1), 1000)
      return
    }

    const latestXpReward = foundTxn.legends.totalXp

    if (latestXpReward) {
      addToast(`Transaction completed! Reward ${latestXpReward} XP`, { type: 'success' })
    } else {
      addToast('Transaction completed!', { type: 'success' })
    }

    // Update all other states
    await onLegendComplete()
  }

  const onLegendCompleteWrapped = async (txnId: string) => {
    await pollActivityUntilComplete(txnId, 0)
    // This modal is displayed for a small number of specific
    // actions. If the action isn't one of them nothing will happen.
    setIsOnCompleteModalVisible(true)
  }

  return (
    <>
      {/* Card component */}
      <CardContent
        {...cardData}
        card={card}
        action={action}
        openActionModal={openActionModal}
        disabled={disabled}
        nonConnectedAcc={nonConnectedAcc}
        treasureChestStreak={treasureChestStreak}
      />
      <ActionModal
        {...cardData}
        isOpen={isActionModalOpen}
        buttonText={buttonText}
        onLegendCompleteWrapped={onLegendCompleteWrapped}
        closeActionModal={closeActionModal}
        action={action}
        predefinedId={predefinedId}
      />
    </>
  )
}

export default React.memo(Card)
