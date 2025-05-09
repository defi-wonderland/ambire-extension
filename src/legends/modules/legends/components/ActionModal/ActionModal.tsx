import React, {
  createContext,
  FC,
  useCallback,
  useContext,
  useEffect,
  useMemo,
  useState
} from 'react'
import { createPortal } from 'react-dom'

import Modal from '@legends/components/Modal'
import MobileDisclaimerModal from '@legends/modules/Home/components/MobileDisclaimerModal'
import CardActionComponent from '@legends/modules/legends/components/Card/CardAction'
import { CardActionComponentProps } from '@legends/modules/legends/components/Card/CardAction/CardAction'
import Rewards from '@legends/modules/legends/components/Card/CardContent/Rewards'
import HowTo from '@legends/modules/legends/components/Card/HowTo'
import { HowToProps } from '@legends/modules/legends/components/Card/HowTo/HowTo'
import ClaimRewards from '@legends/modules/legends/components/ClaimRewardsModal/ClaimRewardsModal'
import TreasureChestComponentModal from '@legends/modules/legends/components/TreasureChestComponentModal'
import { CARD_PREDEFINED_ID } from '@legends/modules/legends/constants'
import { CardFromResponse } from '@legends/modules/legends/types'

import MigrateRewardsModal from '../MigrateRewardsModal'
import WheelComponentModal from '../WheelComponentModal'
import styles from './ActionModal.module.scss'
import InviteAccount from './InviteAccount/InviteAccount'
import Referral from './Referral/Referral'

type CardActionContextType = {
  onComplete: (txnId: string) => Promise<void>
  handleClose: () => void
  activeStep: null | number
  setActiveStep: React.Dispatch<React.SetStateAction<null | number>>
}

const cardActionContext = createContext<CardActionContextType>({} as CardActionContextType)

export const useCardActionContext = () => {
  const context = useContext(cardActionContext)
  if (context === undefined) {
    throw new Error('useCardActionContext must be used within a CardActionContextProvider')
  }
  return context
}

type ActionModalProps = {
  isOpen: boolean
  onLegendCompleteWrapped: (txnId: string) => Promise<void>
  closeActionModal: () => void
  predefinedId?: string
  buttonText: string
} & Partial<HowToProps> &
  Partial<CardActionComponentProps> &
  Pick<
    CardFromResponse,
    | 'meta'
    | 'xp'
    | 'card'
    | 'contentImageV2'
    | 'contentSteps'
    | 'contentVideoV2'
    | 'title'
    | 'action'
  >

const ActionModal: FC<ActionModalProps> = ({
  isOpen,
  title,
  xp,
  contentImageV2,
  buttonText,
  onLegendCompleteWrapped,
  closeActionModal,
  contentSteps,
  contentVideoV2,
  meta,
  card,
  action,
  predefinedId
}) => {
  const [activeStep, setActiveStep] = useState<null | number>(null)
  const [isMobile, setIsMobile] = React.useState(false)

  useEffect(() => {
    const checkIfMobile = () => {
      setIsMobile(window.innerWidth <= 600)
    }

    checkIfMobile()
    window.addEventListener('resize', checkIfMobile)

    return () => window.removeEventListener('resize', checkIfMobile)
  }, [])

  const closeActionModalWrapped = useCallback(() => {
    closeActionModal()
    setActiveStep(null)
  }, [closeActionModal])

  const cardActionContextValue = useMemo(
    () => ({
      onComplete: onLegendCompleteWrapped,
      handleClose: closeActionModalWrapped,
      activeStep,
      setActiveStep
    }),
    [activeStep, closeActionModalWrapped, onLegendCompleteWrapped]
  )

  if (isMobile) {
    return createPortal(
      <MobileDisclaimerModal
        shouldClose
        modalOpened={isOpen}
        closeModal={closeActionModalWrapped}
      />,
      document.getElementById('modal-root') as HTMLElement
    )
  }

  if (predefinedId === CARD_PREDEFINED_ID.claimRewards) {
    return (
      <ClaimRewards
        isOpen={isOpen}
        handleClose={closeActionModalWrapped}
        action={action}
        meta={meta}
        card={card}
      />
    )
  }

  if (predefinedId === CARD_PREDEFINED_ID.migrateToStk) {
    return (
      <MigrateRewardsModal
        isOpen={isOpen}
        handleClose={closeActionModalWrapped}
        action={action}
        meta={meta}
        card={card}
      />
    )
  }

  if (predefinedId === CARD_PREDEFINED_ID.wheelOfFortune) {
    return <WheelComponentModal isOpen={isOpen} handleClose={closeActionModalWrapped} />
  }

  if (predefinedId === CARD_PREDEFINED_ID.chest) {
    return <TreasureChestComponentModal isOpen={isOpen} handleClose={closeActionModalWrapped} />
  }

  return (
    <Modal isOpen={isOpen} handleClose={closeActionModalWrapped} className={styles.modal}>
      <Modal.Heading className={styles.modalHeading}>
        <div className={styles.modalHeadingTitle}>{title}</div>
        {xp && <Rewards xp={xp} size="lg" />}
      </Modal.Heading>

      {contentSteps && (
        <HowTo
          steps={contentSteps}
          activeStep={activeStep}
          image={contentImageV2}
          imageAlt={title}
          video={contentVideoV2}
        >
          {(predefinedId === CARD_PREDEFINED_ID.referral && <Referral meta={meta} />) ||
            (predefinedId === CARD_PREDEFINED_ID.inviteAccount && <InviteAccount meta={meta} />)}
        </HowTo>
      )}
      {!!action && (
        <cardActionContext.Provider value={cardActionContextValue}>
          <CardActionComponent meta={meta} buttonText={buttonText} action={action} />
        </cardActionContext.Provider>
      )}
    </Modal>
  )
}

export default ActionModal
