import React, { FC } from 'react'
import { useTranslation } from 'react-i18next'
import { View } from 'react-native'

import RightArrowIcon from '@common/assets/svg/RightArrowIcon'
import BottomSheet from '@common/components/BottomSheet'
import Button from '@common/components/Button'
import Text from '@common/components/Text'
import colors from '@common/styles/colors'
import spacings, { SPACING_3XL } from '@common/styles/spacings'
import flexbox from '@common/styles/utils/flexbox'
import text from '@common/styles/utils/text'
import KeyStoreLogo from '@web/modules/keystore/components/KeyStoreLogo'

interface Props {
  modalRef: any
  onPress: () => void
}

const PasswordSetModal: FC<Props> = ({ modalRef, onPress }) => {
  const { t } = useTranslation()

  return (
    <BottomSheet
      backgroundColor="primaryBackground"
      id="password-set-modal"
      sheetRef={modalRef}
      autoWidth
      shouldBeClosableOnDrag={false}
      style={{ paddingHorizontal: SPACING_3XL * 2, ...spacings.pv4Xl }}
    >
      <Text weight="medium" fontSize={20} style={[text.center, spacings.mbXl]}>
        {t('Extension password')}
      </Text>
      <KeyStoreLogo width={112} height={112} style={[flexbox.alignSelfCenter, spacings.mbXl]} />
      <Text fontSize={16} style={[spacings.mb2Xl, text.center]}>
        {t('Your extension password is set!')}
      </Text>
      <Button
        text={t('Continue')}
        hasBottomSpacing={false}
        style={{ minWidth: 232 }}
        onPress={onPress}
      >
        <View style={spacings.pl}>
          <RightArrowIcon color={colors.titan} />
        </View>
      </Button>
    </BottomSheet>
  )
}

export default PasswordSetModal
