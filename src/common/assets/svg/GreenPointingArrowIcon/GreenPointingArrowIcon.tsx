import React from 'react'
import Svg, { Path, SvgProps } from 'react-native-svg'

const GreenPointingArrowIcon: React.FC<SvgProps> = ({ width = 26, height = 77, ...rest }) => (
  <Svg width={width} height={height} viewBox="0 0 26.145 76.711" {...rest}>
    <Path
      d="M1407.874,86.8a84.242,84.242,0,0,1-5.082,10.566l-6.313,10.968,7.088-2.157a190.324,190.324,0,0,1-1.934,28.569,211.953,211.953,0,0,1-6.888,28.766l13.21-6.47,12.935,6.47a201.32,201.32,0,0,1-6.716-28.3,201.559,201.559,0,0,1-1.922-29.033l7.639,2.157-6.663-11.024A85.53,85.53,0,0,1,1407.874,86.8Z"
      transform="translate(-1394.744 -86.805)"
      fill="#008055"
    />
  </Svg>
)

export default React.memo(GreenPointingArrowIcon)
