import React, { FC } from 'react'

import styles from './SectionHeading.module.scss'

type Props = {
  children: React.ReactNode
  className?: string
}

const SectionHeading: FC<Props> = ({ children, className }) => {
  return <h2 className={`${styles.title} ${className || ''}`}>{children}</h2>
}

export default SectionHeading
