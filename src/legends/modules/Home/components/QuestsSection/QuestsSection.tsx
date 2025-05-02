// import Swiper and modules styles
import 'swiper/css'
import 'swiper/css/virtual'
import 'swiper/css/effect-coverflow'
import 'swiper/css/free-mode'

import React, { useRef } from 'react'
import { Link } from 'react-router-dom'
import { FreeMode, Mousewheel, Navigation } from 'swiper/modules'
import { Swiper, SwiperSlide } from 'swiper/react'

import LeftArrowIcon from '@common/assets/svg/LeftArrowIcon'
import RightArrowIcon from '@common/assets/svg/RightArrowIcon'
import Alert from '@legends/components/Alert'
import useLegendsContext from '@legends/hooks/useLegendsContext'
import Card from '@legends/modules/legends/components/Card'
import { CardStatus, CardType } from '@legends/modules/legends/types'

import SectionHeading from '../SectionHeading'
import styles from './QuestsSection.module.scss'

const QuestsSection = () => {
  const { legends, isLoading, error } = useLegendsContext()
  const sliderRef = useRef(null)

  const sortedLegends =
    legends &&
    legends.sort((a, b) => {
      if (a.card.type === CardType.daily && b.card.type !== CardType.daily) return -1
      if (a.card.type !== CardType.daily && b.card.type === CardType.daily) return 1

      if (a.card.status === CardStatus.active && b.card.status !== CardStatus.active) return -1
      if (a.card.status !== CardStatus.active && b.card.status === CardStatus.active) return 1

      return 0
    })

  // Handler to go to the next character
  const handleNext = () => {
    if (!sliderRef.current) return
    sliderRef.current.swiper.slideNext()
  }

  // Handler to go to the previous character
  const handlePrevious = () => {
    if (!sliderRef.current) return

    sliderRef.current.swiper.slidePrev()
  }

  if (isLoading || !legends) return null
  return (
    <div className={styles.wrapper}>
      <div className={styles.titleAndButtons}>
        <SectionHeading>Quests</SectionHeading>
        <div className={styles.buttons}>
          <Link className={styles.button} to="/quests" type="button">
            See all
          </Link>

          <button className={styles.arrowButton} type="button" onClick={handlePrevious}>
            <LeftArrowIcon color="currentColor" />
          </button>
          <button className={styles.arrowButton} type="button" onClick={handleNext}>
            <RightArrowIcon color="currentColor" />
          </button>
        </div>
        {error && <Alert type="error" title={error} className={styles.error} />}
      </div>
      <Swiper
        ref={sliderRef}
        slidesPerView="auto"
        spaceBetween={16}
        navigation
        modules={[FreeMode, Navigation, Mousewheel]}
        scrollbar={{ draggable: true }}
        freeMode={{
          enabled: true,
          momentumVelocityRatio: 0.5,
          momentumRatio: 2
        }}
        mousewheel={{
          enabled: true,
          sensitivity: 10,
          sticky: true,
          releaseOnEdges: true,
          forceToAxis: true
        }}
      >
        {sortedLegends.map((card) => (
          <SwiperSlide className={`${styles.slide}`} key={card.title + card.card.type}>
            <Card cardData={card} />
          </SwiperSlide>
        ))}
      </Swiper>
    </div>
  )
}

export default QuestsSection
