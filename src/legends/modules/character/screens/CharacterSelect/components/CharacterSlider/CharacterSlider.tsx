// import Swiper and modules styles
import 'swiper/css'
import 'swiper/css/virtual'
import 'swiper/css/effect-coverflow'
import 'swiper/css/free-mode'

import React, { useMemo, useRef, useState } from 'react'
import { Navigation } from 'swiper/modules'
import { Swiper, SwiperSlide } from 'swiper/react'

import { Character, CHARACTERS } from '../../constants/characters'
import styles from './CharacterSlider.module.scss'
import Left from './Left'
import Right from './Right'

type ReactCharacter = Character & { reactKey: number }

const doubleCharacters = (characters: Character[]): ReactCharacter[] => {
  return [
    ...characters.map((char) => ({ ...char, reactKey: char.id })),
    ...characters.map((char) => ({ ...char, reactKey: char.id + 1000 }))
  ]
}

const CharacterSlider = ({
  initialCharacterId,
  onCharacterChange
}: {
  initialCharacterId: number
  onCharacterChange: (characterId: number) => void
}) => {
  const [currentIndex, setCurrentIndex] = useState(
    CHARACTERS.findIndex((character) => character.id === initialCharacterId)
  )

  const sliderRef = useRef(null)
  const characters = useMemo(() => doubleCharacters(CHARACTERS), [])

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

  const getClass = (index: number) => {
    if (index === currentIndex) return styles.selected
    if (
      index === (currentIndex + 1) % characters.length ||
      (currentIndex === characters.length - 1 && index === 0)
    )
      return `${styles.adjacent} ${styles.right}`
    if (
      index === (currentIndex - 1 + characters.length) % characters.length ||
      (currentIndex === 0 && index === characters.length - 1)
    )
      return `${styles.adjacent} ${styles.left}`
    return styles.smaller
  }

  return (
    <div className={styles.wrapper}>
      <div className={styles.content}>
        <button type="button" className={styles.button} onClick={handlePrevious}>
          <Left />
        </button>
        <Swiper
          ref={sliderRef}
          slidesPerView="auto"
          spaceBetween={0}
          loop
          centeredSlides
          navigation
          initialSlide={currentIndex}
          modules={[Navigation]}
          onRealIndexChange={(swiper) => {
            setCurrentIndex(swiper.realIndex)

            const characterIndex = swiper.realIndex % CHARACTERS.length
            const characterId = CHARACTERS[characterIndex].id
            onCharacterChange(characterId)
          }}
        >
          {characters.map((character, index) => (
            <SwiperSlide className={`${styles.slide} ${getClass(index)}`} key={character.reactKey}>
              <img src={character.image} alt={character.name} className={styles.image} />
              <span className={styles.extraBorder} />
            </SwiperSlide>
          ))}
        </Swiper>
        <button type="button" className={styles.button} onClick={handleNext}>
          <Right />
        </button>
      </div>

      <h2 className={styles.name}>{characters[currentIndex].name}</h2>
      <p className={styles.description}>{characters[currentIndex].description}</p>
    </div>
  )
}

export default CharacterSlider
