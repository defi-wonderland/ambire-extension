import React, { FC } from 'react'

import styles from './SectionHeading.module.scss'

type Props = {
  children: React.ReactNode
}

const SectionHeading: FC<Props> = ({ children }) => {
  return <h2 className={styles.title}>{children}</h2>
}

export default SectionHeading
