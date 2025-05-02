import React, { FC } from 'react'

import CopyIcon from '@common/assets/svg/CopyIcon'
import useToast from '@legends/hooks/useToast'
import { CardFromResponse } from '@legends/modules/legends/types'

import styles from './Referral.module.scss'

type Props = Pick<CardFromResponse, 'meta'>

const Referral: FC<Props> = ({ meta }) => {
  const { addToast } = useToast()

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

  return (
    <div className={styles.copySection}>
      <p>
        You have three wishes... No! Better yet, you have five invitations! Send them to friends,
        but choose wisely how to invite them.
      </p>
      <br />
      <p>Here is an example:</p>

      <div className={styles.copySectionWrapper}>
        <div className={styles.copyField}>
          <div>
            <div className={styles.copyHeader}>
              <div>
                🤑Join the biggest airdrop a WALLET <br />
                has ever done! 🚀{' '}
              </div>
              <button type="button" onClick={copyToClipboard}>
                <CopyIcon className={styles.copyIcon} color="currentColor" />
              </button>
            </div>
            <br />
            Ambire Wallet is giving away 195M $WALLET tokens through the Ambire Rewards campaign.
            All activity with a Smart Account on 5 of the hottest EVM chains is rewarded. Start
            strong with the first 4 transactions free! <br /> <br />
            Here’s what you need to do:
            <br /> 1. Download the Ambire extension{' '}
            <a
              target="_blank"
              href="https://www.ambire.com/get-extension"
              rel="noreferrer"
              className={styles.link}
            >
              here
            </a>
            <br /> 2. Use my referral code so we both get XP:{' '}
            <span className={styles.boldText}>{meta?.invitationKey}</span>
            <br /> 3. Create a Smart Account in the extension and join{' '}
            <a
              target="_blank"
              href="https://rewards.ambire.com/"
              rel="noreferrer"
              className={styles.link}
            >
              Ambire Rewards
            </a>
          </div>
        </div>
      </div>
    </div>
  )
}

export default Referral
