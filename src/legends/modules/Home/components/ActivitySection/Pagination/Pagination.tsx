import React, { FC } from 'react'

import LeftArrowIcon from '@common/assets/svg/LeftArrowIcon'
import RightArrowIcon from '@common/assets/svg/RightArrowIcon'
import usePagination, { DOTS } from '@common/hooks/usePagination'
import { ActivityResponse } from '@legends/contexts/activityContext/types'

import styles from './Pagination.module.scss'

type Props = {
  activity: ActivityResponse
  page: number
  setPage: (page: number) => void
}

const getVisibleTransactionsText = (
  currentPage: number,
  totalPages: number,
  totalTransactionCount: number
) => {
  if (totalPages > 1) {
    const visibleRangeStart = currentPage * 20 + 1
    const visibleRangeEnd = Math.min((currentPage + 1) * 20, totalTransactionCount)

    return `${visibleRangeStart}-${visibleRangeEnd} of ${totalTransactionCount} transactions`
  }

  return `1-${totalTransactionCount} of ${totalTransactionCount} transactions`
}

const PaginationItem = ({
  page,
  setPage,
  isActive,
  noNumber
}: {
  page?: number
  isActive?: boolean
  setPage?: (page: number) => void
  noNumber?: boolean
}) => (
  <button
    type="button"
    className={`${styles.pageButton} ${isActive ? styles.active : ''} ${
      noNumber ? styles.dots : ''
    }`}
    onClick={() => {
      if (isActive) return // No need to change page if it's already active
      if (page !== undefined && setPage) {
        setPage(page - 1)
      }
    }}
  >
    {page || '...'}
  </button>
)

const Pagination: FC<Props> = ({ activity, page, setPage }) => {
  const { totalPages, totalTransactionCount } = activity
  const paginationRange = usePagination({
    currentPage: page,
    maxPages: totalPages,
    siblingCount: 1
  })

  return (
    <div className={styles.paginationWrapper}>
      <div className={styles.pagination}>
        <button
          type="button"
          className={styles.button}
          disabled={page === 0}
          onClick={() => setPage(page - 1)}
        >
          <LeftArrowIcon color="currentColor" width={8} height={14} className={styles.icon} />
        </button>
        <div className={styles.pages}>
          {paginationRange.map((pageNumber) => {
            if (typeof pageNumber !== 'number' || String(pageNumber).includes(DOTS)) {
              return <PaginationItem key={pageNumber} noNumber />
            }

            return (
              <PaginationItem
                key={pageNumber}
                page={pageNumber}
                setPage={setPage}
                isActive={pageNumber === page + 1}
              />
            )
          })}
        </div>
        <button
          type="button"
          className={styles.button}
          disabled={page + 1 === totalPages}
          onClick={() => setPage(page + 1)}
        >
          <RightArrowIcon color="currentColor" width={8} height={14} className={styles.icon} />
        </button>
      </div>
      <p className={styles.visibleTransactionsText}>
        {getVisibleTransactionsText(page, totalPages, totalTransactionCount)}
      </p>
    </div>
  )
}

export default Pagination
