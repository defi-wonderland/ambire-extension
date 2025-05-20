import React, { FC } from 'react'
import Svg, { Defs, G, Path } from 'react-native-svg'

import { LegendsSvgProps } from '@legends/types/svg'

const LockIcon: FC<LegendsSvgProps> = ({ width = 55, height = 68, ...rest }) => {
  return (
    <Svg width={width} height={height} viewBox="0 0 55 68" fill="none" {...rest}>
      <G filter="url(#filter0_d_3555_2361)">
        <Path
          d="M45.0205 29.5764C46.1018 30.7868 46.7387 32.2631 46.9092 33.8834H42.447C41.342 33.9354 38.7856 33.9354 36.4472 33.8834L29.3048 33.9354C25.2416 33.9354 23.4358 33.9354 18.5535 33.8834L8.08594 33.9354C8.33856 30.7778 10.6374 28.086 13.7071 27.296L13.7127 14.3969C15.3387 -2.51875 40.78 -1.82453 41.342 15.2367L41.3471 27.2686C41.3696 27.3347 42.2856 27.6157 42.447 27.6857C43.4204 28.1056 44.3211 28.7937 45.0205 29.5764ZM36.4472 27.6857V14.6214C35.4221 4.27347 19.6569 4.22812 18.5513 14.5654V27.6857H36.4472Z"
          fill="#E13A7B"
        />
        <G filter="url(#filter1_d_3555_2361)">
          <Path
            d="M45.836 29.6025C46.9677 30.8118 47.6342 32.2867 47.8126 33.9055L47.8155 51.0788C47.4817 54.799 44.2875 57.7199 40.3673 57.9307L14.6353 57.9279C10.777 57.7484 7.51685 54.7945 7.18713 51.1314L7.18359 33.9575C7.44796 30.8028 9.85377 28.1135 13.0662 27.3243L24.6648 27.2969C24.6648 27.2969 26.5546 27.2969 29.3894 27.2969L40.3673 27.3243C40.3909 27.3903 42.3979 27.3243 42.3979 27.3243C42.3979 27.3243 44.1 27.7474 45.836 29.6025Z"
            fill="#E13A7B"
          />
        </G>
        <Path
          d="M26.3191 34.778C30.7931 33.4427 33.4047 39.464 29.4821 41.816L29.4726 48.4414C29.2779 51.0363 25.7638 51.0061 25.5303 48.4973L25.5331 41.8445C22.6553 40.1985 23.102 35.7381 26.3191 34.778Z"
          fill="#191A1F"
        />
      </G>
      <Defs>
        <filter
          id="filter0_d_3555_2361"
          x="0"
          y="0"
          width="55"
          height="68"
          filterUnits="userSpaceOnUse"
          colorInterpolationFilters="sRGB"
        >
          <feFlood floodOpacity="0" result="BackgroundImageFix" />
          <feColorMatrix
            in="SourceAlpha"
            type="matrix"
            values="0 0 0 0 0 0 0 0 0 0 0 0 0 0 0 0 0 0 127 0"
            result="hardAlpha"
          />
          <feOffset dy="4" />
          <feGaussianBlur stdDeviation="2" />
          <feComposite in2="hardAlpha" operator="out" />
          <feColorMatrix type="matrix" values="0 0 0 0 0 0 0 0 0 0 0 0 0 0 0 0 0 0 0.25 0" />
          <feBlend mode="normal" in2="BackgroundImageFix" result="effect1_dropShadow_3555_2361" />
          <feBlend
            mode="normal"
            in="SourceGraphic"
            in2="effect1_dropShadow_3555_2361"
            result="shape"
          />
        </filter>
        <filter
          id="filter1_d_3555_2361"
          x="3.18359"
          y="19.2969"
          width="48.6328"
          height="38.6339"
          filterUnits="userSpaceOnUse"
          colorInterpolationFilters="sRGB"
        >
          <feFlood floodOpacity="0" result="BackgroundImageFix" />
          <feColorMatrix
            in="SourceAlpha"
            type="matrix"
            values="0 0 0 0 0 0 0 0 0 0 0 0 0 0 0 0 0 0 127 0"
            result="hardAlpha"
          />
          <feOffset dy="-4" />
          <feGaussianBlur stdDeviation="2" />
          <feComposite in2="hardAlpha" operator="out" />
          <feColorMatrix type="matrix" values="0 0 0 0 0 0 0 0 0 0 0 0 0 0 0 0 0 0 0.25 0" />
          <feBlend mode="normal" in2="BackgroundImageFix" result="effect1_dropShadow_3555_2361" />
          <feBlend
            mode="normal"
            in="SourceGraphic"
            in2="effect1_dropShadow_3555_2361"
            result="shape"
          />
        </filter>
      </Defs>
    </Svg>
  )
}

export default LockIcon
