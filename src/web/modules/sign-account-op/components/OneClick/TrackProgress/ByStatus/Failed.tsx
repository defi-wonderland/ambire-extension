import React, { FC } from 'react'
import { View } from 'react-native'
import spacings from '@common/styles/spacings'
import flexbox from '@common/styles/utils/flexbox'
import AlertVertical from '@common/components/AlertVertical'

type FailedProps = {
  title: string
  errorMessage: string
}

const Failed: FC<FailedProps> = ({ title, errorMessage }) => {
  return (
    <View style={[flexbox.directionRow, flexbox.alignCenter, flexbox.justifyCenter, spacings.mbLg]}>
      <AlertVertical title={title} text={errorMessage} />
    </View>
  )
}

export default Failed
