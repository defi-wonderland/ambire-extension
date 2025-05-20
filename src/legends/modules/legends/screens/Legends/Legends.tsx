import React from 'react'

import OverachieverBanner from '@legends/components/OverachieverBanner'
import Page from '@legends/components/Page'
import Spinner from '@legends/components/Spinner'
import useLegendsContext from '@legends/hooks/useLegendsContext'
import Card from '@legends/modules/legends/components/Card'
import { CardGroup, CardGroupNameMapping } from '@legends/modules/legends/types'

import styles from './Legends.module.scss'

const GROUP_SORT = [
  CardGroup.MiniGame,
  CardGroup.Seasonal,
  CardGroup.Transactions,
  CardGroup.SwapAndBridge,
  CardGroup.GasTank,
  CardGroup.Supporter,
  CardGroup.Show
]

const Legends = () => {
  const { legends, isLoading } = useLegendsContext()

  const processedLegends = legends
    .sort((a, b) => {
      const indexA = GROUP_SORT.indexOf(a.group)
      const indexB = GROUP_SORT.indexOf(b.group)

      return indexA - indexB
    })
    .reduce((groups, card) => {
      const group = card.group || 'Ungrouped'
      return {
        ...groups,
        [group]: [...(groups[group] || []), card]
      }
    }, {} as Record<string, typeof legends>)

  return (
    <Page containerSize="lg">
      <OverachieverBanner />
      {!isLoading ? (
        <div>
          {Object.entries(processedLegends).map(([groupName, cards]) => (
            <div key={groupName} className={styles.group}>
              <h2 className={styles.groupName}>
                {CardGroupNameMapping[groupName as keyof typeof CardGroupNameMapping]}
              </h2>
              <div className={styles.cards}>
                {cards.map((card) => (
                  <Card key={card.title + card.card.type} cardData={card} action={card.action} />
                ))}
              </div>
            </div>
          ))}
        </div>
      ) : (
        <div className={styles.spinnerContainer}>
          <Spinner />
        </div>
      )}
    </Page>
  )
}

export default Legends
