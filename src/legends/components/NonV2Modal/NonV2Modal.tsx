import React, { FC } from 'react'

import Modal from '@legends/components/Modal'

import styles from './NonV2Modal.module.scss'

const NonV2Modal: FC<{ isOpen: boolean }> = ({ isOpen }) => (
  <Modal isOpen={isOpen} isClosable={false} className={styles.modal}>
    <Modal.Heading>Connect a Smart Account</Modal.Heading>
    <Modal.Text className={styles.text}>
      To play Ambire Rewards, please connect a{' '}
      <strong>Smart Account created in the extension</strong>. EOAs and imported v1 accounts (Ambire
      web & mobile) are not eligible.
    </Modal.Text>
  </Modal>
)

export default NonV2Modal
