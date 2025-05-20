import React, { FC, ReactNode, useEffect } from 'react'
import { createHashRouter, Navigate, RouterProvider } from 'react-router-dom'

import { DomainsContextProvider } from '@common/contexts/domainsContext'
import ErrorPage from '@legends/components/ErrorPage'
import PrivateRoute from '@legends/components/PrivateRoute'
import { ActivityContextProvider } from '@legends/contexts/activityContext'
import { DataPollingContextProvider } from '@legends/contexts/dataPollingContext'
import { LeaderboardContextProvider } from '@legends/contexts/leaderboardContext'
import { LegendsContextProvider } from '@legends/contexts/legendsContext'
import { MidnightTimerContextProvider } from '@legends/contexts/midnightTimerContext'
import { PortfolioControllerStateProvider } from '@legends/contexts/portfolioControllerStateContext'
import CharacterSelect from '@legends/modules/character/screens/CharacterSelect'
import Home from '@legends/modules/Home'
import Leaderboard from '@legends/modules/leaderboard/screens/Leaderboard'
import Legends from '@legends/modules/legends/screens/Legends'
import Wallet from '@legends/modules/wallet'

import { LEGENDS_ROUTES } from '../constants'
import { LEGENDS_LEGACY_ROUTES } from '../constants/routes'

// In LegendsInit.tsx, we've already declared some top-level contexts that all child components use.
// However, we also have private contexts/components within a `PrivateArea`
// which are only accessible if an account is connected and a character has been selected.
// To avoid adding branches in these components
// or checking within each useCallback/useEffect whether the account/character are set,
// we chose to render these contexts only when the necessary data is set at the top level.
// Here's the flow:
// LegendInit (top-level context)
//  -> Router
//      -> Private Area contexts are initialized
//         -> PrivateRoute (prevents loading child routes if no account/character is set)
//              -> child Route.
const PrivateArea: FC<{ children: ReactNode }> = ({ children }) => {
  useEffect(() => {
    document.title = 'Ambire Rewards'
  }, [])

  return (
    <LeaderboardContextProvider>
      <ActivityContextProvider>
        <LegendsContextProvider>
          <PortfolioControllerStateProvider>
            <DomainsContextProvider>
              <DataPollingContextProvider>
                <MidnightTimerContextProvider>{children}</MidnightTimerContextProvider>
              </DataPollingContextProvider>
            </DomainsContextProvider>
          </PortfolioControllerStateProvider>
        </LegendsContextProvider>
      </ActivityContextProvider>
    </LeaderboardContextProvider>
  )
}

const router = createHashRouter([
  {
    errorElement: <ErrorPage />,
    children: [
      {
        path: LEGENDS_ROUTES.characterSelect,
        element: <CharacterSelect />
      },
      {
        element: (
          <PrivateArea>
            <PrivateRoute />
          </PrivateArea>
        ),
        children: [
          {
            path: LEGENDS_ROUTES.quests,
            element: <Legends />
          },
          {
            path: LEGENDS_ROUTES.leaderboard,
            element: <Leaderboard />
          },
          {
            path: LEGENDS_ROUTES.home,
            element: <Home />
          },
          {
            path: LEGENDS_ROUTES.wallet,
            element: <Wallet />
          },
          {
            path: LEGENDS_ROUTES['/'],
            element: <Home />
          },
          {
            path: LEGENDS_LEGACY_ROUTES.legends,
            element: <Navigate to={LEGENDS_ROUTES.quests} />
          },
          {
            path: LEGENDS_LEGACY_ROUTES.character,
            element: <Navigate to={LEGENDS_ROUTES.home} />
          }
        ]
      }
    ]
  }
])

const Router = () => {
  return <RouterProvider router={router} />
}

export default Router
