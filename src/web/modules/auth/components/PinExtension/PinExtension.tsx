import React, { useMemo } from 'react'
import { Image, View } from 'react-native'

import ExtensionsIcon from '@common/assets/svg/ExtensionsIcon'
import GreenPointingArrowIcon from '@common/assets/svg/GreenPointingArrowIcon'
import PinIcon from '@common/assets/svg/PinIcon'
import SettingsIcon from '@common/assets/svg/SettingsIcon'
import Text from '@common/components/Text'
import { useTranslation } from '@common/config/localization'
import useTheme from '@common/hooks/useTheme'
import spacings from '@common/styles/spacings'
import flexbox from '@common/styles/utils/flexbox'
import AmbireIcon from '@web/assets/images/xicon@128.png'
import { engine } from '@web/constants/browserapi'
import useWalletStateController from '@web/hooks/useWalletStateController'

import getStyles from './styles'

const PinExtension = () => {
  const { t } = useTranslation()
  const { isPinned } = useWalletStateController()
  const { styles } = useTheme(getStyles)

  const notPinnedRightOffset = useMemo(() => (engine === 'gecko' ? 46 : 96), [])

  const pinnedRightOffset = useMemo(() => (engine === 'gecko' ? 60 : 110), [])

  return (
    <View
      style={[
        styles.pinExtensionContainer,
        { right: isPinned ? pinnedRightOffset : notPinnedRightOffset }
      ]}
    >
      <Image source={AmbireIcon as any} style={{ width: 80, height: 80 }} />
      {!isPinned ? (
        <View style={spacings.ph}>
          <Text fontSize={16} weight="semiBold" style={spacings.mbMi}>
            {t('Pin the Ambire extension')}
          </Text>
          <View style={[flexbox.directionRow, flexbox.alignCenter]}>
            <Text appearance="secondaryText" weight="medium">
              {t('click')}
            </Text>
            <ExtensionsIcon style={spacings.phTy} width={21} height={21} />
            <Text appearance="secondaryText" weight="medium">
              {t('and then')}
            </Text>
            {engine === 'gecko' ? (
              <SettingsIcon style={{ marginHorizontal: 6 }} />
            ) : (
              <PinIcon style={spacings.phMi} />
            )}
          </View>
        </View>
      ) : (
        <View style={spacings.ph}>
          <Text fontSize={16} weight="medium" appearance="secondaryText">
            {t('Open the Ambire extension here')}
          </Text>
        </View>
      )}
      <GreenPointingArrowIcon width={22} translateY={-8} style={spacings.mrXl} />
    </View>
  )
}

export default React.memo(PinExtension)
