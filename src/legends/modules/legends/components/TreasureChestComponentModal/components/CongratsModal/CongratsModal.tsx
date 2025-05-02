import React, { useEffect } from 'react'

import { preloadImages } from '@common/utils/images'
import CoinIcon from '@legends/common/assets/svg/CoinIcon'
import Modal from '@legends/components/Modal'

import chestImageOpened from '../../assets/chest-opened.png'
import starImage from '../../assets/star.png'
import styles from './CongratsModal.module.scss'

interface CongratsModalProps {
  isOpen: boolean
  setIsOpen: React.Dispatch<React.SetStateAction<boolean>>
  prizeNumber: number | null
  onButtonClick: () => Promise<void>
}

const CongratsModal: React.FC<CongratsModalProps> = ({
  isOpen,
  setIsOpen,
  prizeNumber,
  onButtonClick
}) => {
  // Load the modal in the dom but don't show it immediately
  // This is done to preload all images
  useEffect(() => {
    preloadImages([chestImageOpened, starImage])
  }, [])

  return (
    <Modal isOpen={isOpen} handleClose={() => setIsOpen(false)} className={styles.modal}>
      <div className={styles.congratsModal}>
        <Modal.Heading className={styles.title}>Congrats!</Modal.Heading>
        <Modal.Text className={styles.text}>You Collected +{prizeNumber} XP today!</Modal.Text>
        <div className={styles.openedChestWrapper}>
          <div className={styles.prize}>+{prizeNumber}</div>
          <img src={starImage} alt="star" className={styles.star} />
          <img src={chestImageOpened} alt="chest-opened" className={styles.chestOpenedImage} />
        </div>
        <button type="button" className={styles.button} onClick={onButtonClick}>
          Cha-ching
        </button>
      </div>
    </Modal>
  )
}

export default CongratsModal
