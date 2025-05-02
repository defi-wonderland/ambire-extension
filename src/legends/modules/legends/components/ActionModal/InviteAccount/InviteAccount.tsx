import React, { FC } from 'react'

import Address from '@legends/components/Address'
import { CardFromResponse } from '@legends/modules/legends/types'

import InvitationIcon from './InvitationIcons'
import styles from './InviteAccount.module.scss'

type Props = Pick<CardFromResponse, 'meta'>

const getTimeAgo = (date: string, status: string): string => {
  // since we do not store the time of the accept actions
  // and we only have the invitation creation time
  // we should not display the actual `date` value
  // instead we can show 'today' if it was today
  // else display X days/weeks ago
  const dateAsMs = new Date(date).getTime()
  const msAgo = new Date().getTime() - dateAsMs
  const HOUR = 1000 * 60 * 60
  if (
    status === 'accepted' &&
    new Date(date).toISOString().slice(0, 10) === new Date().toISOString().slice(0, 10)
  ) {
    return 'today'
  }
  if (
    status === 'accepted' &&
    new Date(dateAsMs + 24 * HOUR).toISOString().slice(0, 10) ===
      new Date().toISOString().slice(0, 10)
  ) {
    return 'yesterday'
  }

  if (msAgo < HOUR / 60) return 'just now'
  if (msAgo < HOUR) return `${Math.floor(msAgo / 1000 / 60)} minutes ago`
  if (msAgo < HOUR * 2) return '1 hour ago'
  if (msAgo < 24 * HOUR) return `${Math.floor(msAgo / HOUR)} hours ago`
  if (msAgo < 24 * HOUR * 2) return 'yesterday'
  if (msAgo < 24 * HOUR * 7 * 2) return `${Math.floor(msAgo / (HOUR * 24))} days ago`
  return `${Math.floor(msAgo / (HOUR * 24 * 7))} weeks ago`
}

const InviteAccount: FC<Props> = ({ meta }) => {
  return (
    <div className={`${styles.historyWrapper}`}>
      <div className={`${styles.heading}`}>Invitations history</div>
      <div className={`${styles.scrollableHistory}`}>
        {meta?.usersInvitationHistory?.length ? (
          (meta?.usersInvitationHistory || []).map(({ status, invitee, date }) => (
            <div className={`${styles.invitationItem} ${styles[status]}`} key={invitee + date}>
              <div className={`${styles.invitationStatus}`}>
                {status[0].toUpperCase() + status.slice(1)}
              </div>
              <div className={`${styles.mr}`}>{getTimeAgo(date, status)}</div>(
              <Address className={`${styles[status]}`} maxAddressLength={12} address={invitee} />)
              <div className={`${styles.ml}`}>
                <InvitationIcon status={status} />{' '}
              </div>
            </div>
          ))
        ) : (
          <div>You haven&apos;t invited anyone yet.</div>
        )}
      </div>
    </div>
  )
}

export default InviteAccount
