import React, { useEffect, useLayoutEffect, useRef, useState } from 'react'

import InfoIcon from '@common/assets/svg/InfoIcon'
import Tooltip from '@common/components/Tooltip'
import Alert from '@legends/components/Alert'
import Page from '@legends/components/Page'
import Spinner from '@legends/components/Spinner'
import useLeaderboardContext from '@legends/hooks/useLeaderboardContext'

import Podium from './components/Podium'
import Row from './components/Row'
import styles from './Leaderboard.module.scss'
import smokeAndLights from './Smoke-and-lights.png'

const LeaderboardContainer: React.FC = () => {
  const {
    leaderboardData,
    userLeaderboardData,
    isLeaderboardLoading: loading,
    error,
    updateLeaderboard
  } = useLeaderboardContext()

  const tableRef = useRef<HTMLDivElement>(null)
  const pageRef = useRef<HTMLDivElement>(null)
  const currentUserRef = useRef<HTMLDivElement>(null)

  const [stickyPosition, setStickyPosition] = useState<'top' | 'bottom' | null>(null)

  useLayoutEffect(() => {
    const handleScroll = () => {
      if (!userLeaderboardData || !currentUserRef.current) return

      const userRect = currentUserRef.current.getBoundingClientRect()
      const windowHeight = window.innerHeight
      // Check if the current user's row is above the viewport (scrolling down)
      if (userRect.top < 0) {
        // If the user is above the viewport, pin to the top
        setStickyPosition('top')
      } else if (userRect.bottom > windowHeight) {
        // If the user is below the viewport, pin to the bottom
        setStickyPosition('bottom')
      }
    }

    const pageElement = pageRef.current
    if (pageElement) {
      // Attach the scroll event listener
      pageElement.addEventListener('scroll', handleScroll)

      // Trigger the handleScroll function immediately after component mount
      handleScroll()
    }

    return () => {
      if (pageElement) {
        // Clean up the event listener on component unmount
        pageElement.removeEventListener('scroll', handleScroll)
      }
    }
  }, [currentUserRef, leaderboardData, userLeaderboardData])

  useEffect(() => {
    if (loading) return

    updateLeaderboard()
  }, [updateLeaderboard])

  return (
    <Page
      pageRef={pageRef}
      style={{
        backgroundImage: `url(${smokeAndLights})`,
        backgroundPosition: 'top right',
        backgroundRepeat: 'no-repeat',
        backgroundSize: 'cover'
      }}
    >
      <div className={styles.wrapper}>
        <div className={styles.heading}>
          <h1 className={styles.title}>Leaderboard</h1>
          <p className={styles.subtitle}>
            Complete quests, earn XP and climb the leaderboard to secure Ambire rewards.
          </p>
        </div>
        {loading && <Spinner />}
        {error && <Alert type="error" title={error} />}
        {leaderboardData && leaderboardData.length ? (
          <>
            <Podium data={leaderboardData.slice(0, 3)} />
            <div ref={tableRef} className={styles.table}>
              <div className={styles.header}>
                <div className={styles.cell}>
                  <h5>#</h5>
                  <h5 className={styles.playerCell}>player</h5>
                </div>
                <h5 className={styles.cell}>Level</h5>
                <div className={styles.cell}>
                  <h5 className={styles.weightText}>Weight</h5>
                  <InfoIcon
                    width={10}
                    height={10}
                    color="currentColor"
                    className={styles.infoIcon}
                    data-tooltip-id="weight-info"
                  />
                  <Tooltip
                    style={{
                      backgroundColor: '#101114',
                      color: '#F4F4F7',
                      fontFamily: 'FunnelDisplay',
                      fontSize: 11,
                      lineHeight: '16px',
                      fontWeight: 300,
                      maxWidth: 244,
                      boxShadow: '0px 0px 12.1px 0px #191B20'
                    }}
                    place="bottom"
                    id="weight-info"
                    content="Projected weight based on last week's balance snapshot. End results might vary."
                  />
                </div>
                <h5 className={styles.cell}>XP</h5>
              </div>
              {leaderboardData.map((item) => (
                <Row
                  key={item.account}
                  {...item}
                  stickyPosition={stickyPosition}
                  currentUserRef={currentUserRef}
                />
              ))}
              {userLeaderboardData &&
                !leaderboardData.some(
                  ({ account }) => account === userLeaderboardData?.account
                ) && (
                  <Row
                    key={userLeaderboardData.account}
                    {...userLeaderboardData}
                    stickyPosition={stickyPosition}
                    currentUserRef={currentUserRef}
                  />
                )}
            </div>
          </>
        ) : null}
      </div>
    </Page>
  )
}

export default LeaderboardContainer
