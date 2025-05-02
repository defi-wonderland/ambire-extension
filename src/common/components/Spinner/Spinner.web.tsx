import LottieView from 'lottie-react'
import React from 'react'

import SpinnerAnimation from './spinner-animation.json'
import WhiteSpinnerAnimation from './spinner-white-animation.json'

const Spinner = ({
  style,
  variant = 'gradient'
}: {
  style: any
  variant?: 'gradient' | 'white'
}) => {
  return (
    <LottieView
      animationData={variant === 'gradient' ? SpinnerAnimation : WhiteSpinnerAnimation}
      style={{ width: 40, height: 40, ...style }}
      autoPlay
      loop
    />
  )
}

export default Spinner
