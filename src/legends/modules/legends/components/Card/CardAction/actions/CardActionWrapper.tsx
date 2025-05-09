import React from 'react'

import styles from './Action.module.scss'
import CardActionButton, { ButtonProps } from './CardActionButton'

type WrapperProps = {
  children?: React.ReactNode
} & ButtonProps

const CardActionWrapper = ({ children, ...buttonProps }: WrapperProps) => {
  return (
    <div style={{ position: 'relative' }}>
      <div className={styles.modalAction}>{children}</div>
      <CardActionButton {...buttonProps} />
    </div>
  )
}

export default CardActionWrapper
