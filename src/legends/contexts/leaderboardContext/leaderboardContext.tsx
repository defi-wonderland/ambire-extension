import React, { createContext, useCallback, useEffect, useMemo, useState } from 'react'

import useAccountContext from '@legends/hooks/useAccountContext'
import { LeaderboardEntry } from '@legends/modules/leaderboard/types'

import { getLeaderboard } from './helpers'

type LeaderboardContextType = {
  isLeaderboardLoading: boolean
  fullLeaderboardData: LeaderboardEntry
  season0LeaderboardData: LeaderboardEntry
  season1LeaderboardData: LeaderboardEntry
  userLeaderboardData: LeaderboardEntry['currentUser'] | null
  error: string | null
  updateLeaderboard: () => Promise<void>
}

const LeaderboardContext = createContext<LeaderboardContextType>({} as LeaderboardContextType)

const LeaderboardContextProvider = ({ children }: { children: React.ReactNode }) => {
  const [loading, setLoading] = useState(true)
  const [error, setError] = React.useState<string | null>(null)
  const [userLeaderboardData, setUserLeaderboardData] = useState<
    LeaderboardEntry['currentUser'] | null
  >(null)
  const [fullLeaderboardData, setFullLeaderboardData] = useState<LeaderboardEntry | null>(null)
  const [season0LeaderboardData, setSeason0Leaderboard] = useState<LeaderboardEntry | null>(null)
  const [season1LeaderboardData, setSeason1Leaderboard] = useState<LeaderboardEntry | null>(null)
  const { connectedAccount } = useAccountContext()

  const updateLeaderboard = useCallback(async () => {
    try {
      setError(null)
      const response = await getLeaderboard(connectedAccount ?? undefined)

      if (userLeaderboardData && userLeaderboardData?.account !== connectedAccount) {
        setLoading(true)
      }
      if (response) {
        const { fullLeaderboard, season0Leaderboard, season1Leaderboard } = response

        setFullLeaderboardData(fullLeaderboard)
        setSeason0Leaderboard(season0Leaderboard)
        setSeason1Leaderboard(season1Leaderboard)
        fullLeaderboard.currentUser && setUserLeaderboardData(fullLeaderboard.currentUser)
      } else {
        setError('Failed to fetch leaderboard')
      }
    } catch (e) {
      console.error('Failed to fetch leaderboard:', e)
      setError('Failed to fetch leaderboard')
      throw e
    } finally {
      setLoading(false)
    }
  }, [connectedAccount])

  useEffect(() => {
    updateLeaderboard()
  }, [connectedAccount, updateLeaderboard])

  const value: LeaderboardContextType = useMemo(
    () => ({
      isLeaderboardLoading: loading,
      userLeaderboardData,
      fullLeaderboardData,
      season0LeaderboardData,
      season1LeaderboardData,
      error,
      updateLeaderboard
    }),
    [
      loading,
      userLeaderboardData,
      fullLeaderboardData,
      season0LeaderboardData,
      season1LeaderboardData,
      error,
      updateLeaderboard
    ]
  )

  return <LeaderboardContext.Provider value={value}>{children}</LeaderboardContext.Provider>
}

export { LeaderboardContext, LeaderboardContextProvider }
