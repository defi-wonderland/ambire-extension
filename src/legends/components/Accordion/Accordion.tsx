import React, { useState } from 'react'
import { Pressable } from 'react-native'

import { faChevronDown } from '@fortawesome/free-solid-svg-icons/faChevronDown'
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome'

import styles from './Accordion.module.scss'

interface Props {
  children: React.ReactNode
  title: string
  expandable?: boolean
  initiallyExpanded?: boolean
  titleClassName?: string
  dropdownClassName?: string
  wrapperClassName?: string
}
const Accordion = ({
  children,
  title,
  expandable = true,
  initiallyExpanded = false,
  titleClassName,
  dropdownClassName,
  wrapperClassName
}: Props) => {
  const [isOpen, setIsOpen] = useState(initiallyExpanded)

  return (
    <div className={`${styles.wrapper} ${wrapperClassName}`}>
      <Pressable onPress={() => expandable && setIsOpen(!isOpen)}>
        <div className={`${styles.heading} ${expandable ? '' : styles.nonExpandable}`}>
          <span className={`${styles.title} ${titleClassName}`}>{title}</span>
          {expandable && (
            <FontAwesomeIcon
              className={`${styles.chevronIcon} ${isOpen ? styles.open : ''}`}
              icon={faChevronDown}
            />
          )}
        </div>
      </Pressable>
      <div className={`${styles.dropdown} ${isOpen ? styles.open : ''} ${dropdownClassName}`}>
        {children}
      </div>
    </div>
  )
}

export default Accordion
