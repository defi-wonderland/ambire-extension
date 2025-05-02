import React from 'react'

import Accordion from '@legends/components/Accordion'

import SectionHeading from '../SectionHeading'
import styles from './FaqSection.module.scss'

const FaqSection = () => {
  const faqData = [
    {
      question: 'What is Ambire Rewards?',
      answer:
        'Ambire Rewards is a gamified campaign designed to help you discover the power of  Smart Accounts via an epic onchain adventure. Put your Ambire Wallet browser extension in action to earn XPs (experience points) and level up your character via a series of quests. Additionally, earn XPs for your usual onchain activity with Smart Accouns in the Ambire extension (e.g. transactions, swaps, Gas Tank top-ups, etc.).'
    },
    {
      question: 'Why should I participate?',
      answer:
        'Join Ambire Rewards to discover the potential of smart accounts and earn rewards. Collecting XP and leveling up helps you develop your character, and secure greater rewards distribution of $WALLET tokens in the future.'
    },
    {
      question: 'Can I connect with a wallet different from Ambire?',
      answer: 'You can connect to Ambire Rewards using the Ambire browser extension only.'
    },
    {
      question: 'Can I use my existing account?',
      answer: 'You can use your existing Ambire smart account or create a new one.'
    },
    {
      question: 'Is Ambire Rewards free to participate?',
      answer: 'Yes, participating in Rewards is free.'
    }
  ]

  return (
    <div className={styles.wrapper}>
      <SectionHeading>FAQ</SectionHeading>
      {faqData.map((faq) => (
        <Accordion
          key={faq.question}
          title={faq.question}
          titleClassName={styles.accordionTitle}
          wrapperClassName={styles.accordionWrapper}
        >
          <p className={styles.accordionDropdown}>{faq.answer}</p>
        </Accordion>
      ))}
    </div>
  )
}

export default FaqSection
