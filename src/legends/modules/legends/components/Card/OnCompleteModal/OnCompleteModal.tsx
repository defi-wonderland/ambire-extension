import React, { FC } from 'react'

import CopyIcon from '@common/assets/svg/CopyIcon'
import Modal from '@legends/components/Modal'
import useToast from '@legends/hooks/useToast'
import { CARD_PREDEFINED_ID } from '@legends/modules/legends/constants'
import { CardFromResponse } from '@legends/modules/legends/types'

import styles from './OnCompleteModal.module.scss'

type Props = {
  isVisible: boolean
  handleClose: () => void
  predefinedId: string
} & Pick<CardFromResponse, 'meta'>

const OnCompleteModal: FC<Props> = ({ isVisible, handleClose, meta, predefinedId }) => {
  // All hooks and state should be up here
  const { addToast } = useToast()

  if (predefinedId === CARD_PREDEFINED_ID.inviteAccount) {
    const copyToClipboard = async () => {
      try {
        await navigator.clipboard.writeText(
          `🤑Join the biggest airdrop a WALLET has ever done! 🚀 \n \nAmbire Wallet is giving away 195M $WALLET tokens through the Ambire Rewards campaign. All activity with a Smart Account on 5 of the hottest EVM chains is rewarded. Start strong with the first 4 transactions free! \n \nHere’s what you need to do: \n1. Download the Ambire extension: https://www.ambire.com/get-extension \n2. Use my referral code so we both get XP: ${
            meta?.invitationKey || ''
          }\n3. Create a Smart Account in the extension and join Ambire Rewards at https://rewards.ambire.com/`
        )
        addToast('Text with referral code copied to clipboard', { type: 'success' })
      } catch (e: any) {
        addToast('Failed to copy referral code', { type: 'error' })
        console.error(e)
      }
    }

    const closeAndCopy = () => {
      copyToClipboard()
      handleClose()
    }

    return (
      <Modal isOpen={isVisible} handleClose={handleClose}>
        <>
          <div> 🎉 Congratulations! 🎉</div>
          <br />
          The EOA address has been successfully added to your referred friends. <br /> Now is your
          turn to invite them in a way they couldn&apos;t refuse.
          <br />
          Here is an example:
          <br />
          <div className={styles.copySectionWrapper}>
            <div className={styles.copyField}>
              <div>
                ⚠️ TRADE OFFER ⚠️ <br />
                You download Ambire, we both win 🎉 <br /> 1. Download the Ambire extension:{' '}
                <a
                  target="_blank"
                  href="https://www.ambire.com/get-extension"
                  rel="noreferrer"
                  className={styles.link}
                >
                  https://www.ambire.com/get-extension
                </a>
                <br /> 2. Use my referral code so we both get XP: {meta?.invitationKey} <br /> 3.
                Join Ambire Rewards - onchain quests by Ambire with XP and rewards:{' '}
                <a
                  target="_blank"
                  href="https://rewards.ambire.com/"
                  rel="noreferrer"
                  className={styles.link}
                >
                  https://rewards.ambire.com/{' '}
                </a>
              </div>
              <button type="button" onClick={copyToClipboard}>
                <CopyIcon className={styles.copyIcon} />
              </button>
            </div>
          </div>
          <button onClick={closeAndCopy} type="button" className={styles.button}>
            Copy and close
          </button>
        </>
      </Modal>
    )
  }

  return null
}

export default OnCompleteModal
