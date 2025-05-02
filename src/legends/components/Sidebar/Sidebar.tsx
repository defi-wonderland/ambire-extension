import React, { FC, useRef, useState } from 'react'
import { useLocation } from 'react-router-dom'

import CopyIcon from '@common/assets/svg/CopyIcon'
import { faChevronLeft } from '@fortawesome/free-solid-svg-icons/faChevronLeft'
import { faCircleUser } from '@fortawesome/free-solid-svg-icons/faCircleUser'
import { faFileLines } from '@fortawesome/free-solid-svg-icons/faFileLines'
import { faMedal } from '@fortawesome/free-solid-svg-icons/faMedal'
import { faPiggyBank } from '@fortawesome/free-solid-svg-icons/faPiggyBank'
import { faTrophy } from '@fortawesome/free-solid-svg-icons/faTrophy'
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome'
import Leader from '@legends/common/assets/svg/Leader'
import useAccountContext from '@legends/hooks/useAccountContext'
import useDataPollingContext from '@legends/hooks/useDataPollingContext'
import useLegendsContext from '@legends/hooks/useLegendsContext'
import useToast from '@legends/hooks/useToast'
import LeaderModal from '@legends/modules/legends/components/LeaderModal'
import { LEGENDS_ROUTES } from '@legends/modules/router/constants'

import Link from './components/Link'
import Socials from './components/Socials'
import styles from './Sidebar.module.scss'

type Props = {
  isOpen: boolean
  handleClose: () => void
}

const NAVIGATION_LINKS = [
  { to: LEGENDS_ROUTES.home, text: 'Home', icon: faCircleUser },
  { to: LEGENDS_ROUTES.quests, text: 'Quests', icon: faMedal },
  { to: LEGENDS_ROUTES.leaderboard, text: 'Leaderboard', icon: faTrophy },
  // { to: LEGENDS_ROUTES.staking, text: 'Staking', icon: faPiggyBank },
  {
    to: 'https://codex.ambire.com/',
    text: 'FAQ',
    icon: faFileLines,
    newTab: true,
    isExternalLink: true
  }
]

const Sidebar: FC<Props> = ({ isOpen, handleClose }) => {
  const { addToast } = useToast()
  const { pathname } = useLocation()
  const { legends } = useLegendsContext()
  const containerRef = useRef(null)
  const { connectedAccount } = useAccountContext()

  const legendLeader = connectedAccount && legends.find((legend) => legend.id === 'referral')
  const [isLeaderModalOpen, setIsLeaderModalOpen] = useState(false)
  const { startPolling, stopPolling } = useDataPollingContext()

  const handleLeaderOpen = () => {
    stopPolling()
    setIsLeaderModalOpen(true)
  }
  const handleLeaderClose = () => {
    startPolling()
    setIsLeaderModalOpen(false)
  }

  const copyInvitationKey = () => {
    if (!legendLeader?.meta?.invitationKey) {
      addToast('No invitation key to copy', { type: 'error' })
      return
    }
    navigator.clipboard.writeText(legendLeader?.meta?.invitationKey)
    addToast('Copied to clipboard')
  }

  return (
    <div className={`${styles.wrapper} ${isOpen ? styles.open : ''}`}>
      <div className={styles.top} ref={containerRef}>
        <button type="button" onClick={handleClose} className={styles.closeButton}>
          <FontAwesomeIcon icon={faChevronLeft} />
        </button>
        <img className={styles.logo} src="/images/logo.png" alt="Ambire Rewards" />
        {/* {connectedAccount && <AccountInfo />} */}
        <LeaderModal handleClose={handleLeaderClose} isLeaderModalOpen={isLeaderModalOpen} />

        <div className={styles.links}>
          {NAVIGATION_LINKS.map((link) => (
            <Link
              isActive={
                pathname === link.to || (pathname === '/' && link.to === LEGENDS_ROUTES.home)
              }
              key={link.to}
              to={link.to}
              text={link.text}
              icon={link.icon}
              newTab={link.newTab}
            />
          ))}
        </div>
      </div>
      <div>
        {legendLeader && legendLeader?.meta && (
          <div className={styles.leaderSection}>
            <div className={styles.leaderHeader}>
              <button type="button" className={styles.inviteTitle} onClick={handleLeaderOpen}>
                Invite a friend
              </button>
              <div>
                {[...Array(legendLeader?.meta?.timesUsed || 0)].map((_, index) => (
                  // eslint-disable-next-line react/no-array-index-key
                  <Leader key={`filled-${index}`} variant="filled" />
                ))}
                {[
                  ...Array(
                    (legendLeader?.meta?.maxHits || 0) - (legendLeader?.meta?.timesUsed || 0)
                  )
                ].map((_, index) => (
                  // eslint-disable-next-line react/no-array-index-key
                  <Leader key={`empty-${index}`} />
                ))}
              </div>
            </div>
            <div className={styles.leaderInvitationKey}>
              {legendLeader?.meta?.timesUsed === legendLeader?.meta?.maxHits ? (
                'You are a Leader'
              ) : (
                <>
                  {legendLeader?.meta?.invitationKey}{' '}
                  <button type="button" onClick={copyInvitationKey}>
                    <CopyIcon color="currentColor" className={styles.leaderCopyButton} />
                  </button>
                </>
              )}
            </div>
          </div>
        )}
        <Socials />
      </div>
    </div>
  )
}

export default Sidebar
