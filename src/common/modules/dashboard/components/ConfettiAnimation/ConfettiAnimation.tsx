import './styles.css'

import LottieView, { LottieComponentProps } from 'lottie-react'
import React from 'react'

import alternativeAnimation from './alternativeAnimation.json'
import animation from './animation.json'

const ConfettiAnimation = ({
  width,
  height,
  style = {},
  type = 'primary',
  ...rest
}: {
  width: number
  height: number
  style?: React.CSSProperties
  type?: 'primary' | 'secondary'
} & Omit<LottieComponentProps, 'animationData'>) => {
  return (
    <LottieView
      {...rest}
      animationData={type === 'primary' ? animation : alternativeAnimation}
      style={{
        width,
        height,
        position: 'absolute',
        pointerEvents: 'none',
        alignSelf: 'center',
        ...style
      }}
      loop
    />
  )
}

export default React.memo(ConfettiAnimation)
