import React from 'react'
import Svg, { Defs, G, Path } from 'react-native-svg'

import { LegendsSvgProps } from '@legends/types/svg'

const HourGlassIcon: React.FC<LegendsSvgProps> = ({ width = 36, height = 32, ...rest }) => {
  return (
    <Svg width={width} height={height} viewBox="0 0 36 32" fill="none" {...rest}>
      <Path
        d="M24 8C24 8.78793 23.8448 9.56815 23.5433 10.2961C23.2417 11.0241 22.7998 11.6855 22.2426 12.2426C21.6855 12.7998 21.0241 13.2417 20.2961 13.5433C19.5681 13.8448 18.7879 14 18 14C17.2121 14 16.4319 13.8448 15.7039 13.5433C14.9759 13.2417 14.3145 12.7998 13.7574 12.2426C13.2002 11.6855 12.7583 11.0241 12.4567 10.2961C12.1552 9.56815 12 8.78793 12 8L24 8Z"
        fill="#E13A7B"
      />
      <Path
        d="M9 29C9 27.8181 9.23279 26.6478 9.68508 25.5558C10.1374 24.4639 10.8003 23.4718 11.636 22.636C12.4718 21.8003 13.4639 21.1374 14.5559 20.6851C15.6478 20.2328 16.8181 20 18 20C19.1819 20 20.3522 20.2328 21.4442 20.6851C22.5361 21.1374 23.5282 21.8003 24.364 22.636C25.1997 23.4718 25.8626 24.4639 26.3149 25.5559C26.7672 26.6478 27 27.8181 27 29L9 29Z"
        fill="#E13A7B"
      />
      <G filter="url(#filter0_d_3694_2408)">
        <Path
          d="M4 29C4 27.8954 4.89543 27 6 27H30C31.1046 27 32 27.8954 32 29V32H4V29Z"
          fill="#E13A7B"
        />
      </G>
      <Path d="M4 3C4 4.10457 4.89543 5 6 5H30C31.1046 5 32 4.10457 32 3V0H4V3Z" fill="#E13A7B" />
      <Path
        d="M10.0635 2.25C9.23048 3.63865 8.75 5.26319 8.75 7C8.75 9.56068 9.7873 11.874 11.4707 13.5518L13.4248 15.5L11.4707 17.4482C9.7873 19.126 8.75 21.4393 8.75 24C8.75 26.1739 9.50248 28.1712 10.7578 29.75H7.75684C6.8001 28.0497 6.25 26.0901 6.25 24C6.25 20.748 7.57102 17.8045 9.70605 15.6768L9.88379 15.5L9.70605 15.3232C7.57102 13.1955 6.25 10.252 6.25 7C6.25 5.30858 6.61143 3.70285 7.25488 2.25H10.0635ZM28.7451 2.25C29.3886 3.70285 29.75 5.30858 29.75 7C29.75 10.2522 28.4283 13.1955 26.293 15.3232L26.1152 15.5L26.293 15.6768C28.4283 17.8045 29.75 20.7478 29.75 24C29.75 26.0901 29.1999 28.0497 28.2432 29.75H25.2422C26.4975 28.1712 27.25 26.1739 27.25 24C27.25 21.5994 26.3386 19.4159 24.8369 17.7695L24.5293 17.4482L22.5732 15.5L24.5293 13.5518L24.8369 13.2305C26.3386 11.5841 27.25 9.40061 27.25 7C27.25 5.26319 26.7695 3.63865 25.9365 2.25H28.7451Z"
        fill="#E13A7B"
      />
      <Defs>
        <filter
          id="filter0_d_3694_2408"
          x="0"
          y="19"
          width="36"
          height="13"
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
          <feBlend mode="normal" in2="BackgroundImageFix" result="effect1_dropShadow_3694_2408" />
          <feBlend
            mode="normal"
            in="SourceGraphic"
            in2="effect1_dropShadow_3694_2408"
            result="shape"
          />
        </filter>
      </Defs>
    </Svg>
  )
}

export default HourGlassIcon
