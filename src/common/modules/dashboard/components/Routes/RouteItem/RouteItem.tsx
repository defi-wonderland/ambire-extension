import React, { FC } from 'react'
import { Animated, Pressable, View } from 'react-native'

import Text from '@common/components/Text'
import { useTranslation } from '@common/config/localization'
import useNavigation from '@common/hooks/useNavigation'
import useTheme from '@common/hooks/useTheme'
import useToast from '@common/hooks/useToast'
import {
  NEUTRAL_BACKGROUND,
  NEUTRAL_BACKGROUND_HOVERED
} from '@common/modules/dashboard/screens/styles'
import spacings from '@common/styles/spacings'
import { BORDER_RADIUS_PRIMARY } from '@common/styles/utils/common'
import flexbox from '@common/styles/utils/flexbox'
import { createTab } from '@web/extension-services/background/webapi/tab'
import { useMultiHover } from '@web/hooks/useHover'

interface Props {
  routeItem: {
    icon: any
    label: string
    route?: string
    isExternal: boolean
    disabled?: boolean
    onPress?: () => void
    testID?: string
    scale: number
    scaleOnHover: number
  }
  index: number
  routeItemsLength: number
}

const ITEM_HEIGHT = 44

const RouteItem: FC<Props> = ({ routeItem, index, routeItemsLength }) => {
  const { theme } = useTheme()
  const { t } = useTranslation()
  const { navigate } = useNavigation()
  const { addToast } = useToast()
  const [bindAccountBtnAnim, accountBtnAnimStyle, isAccountBtnHovered] = useMultiHover({
    values: [
      {
        property: 'opacity',
        from: 0.9,
        to: 1
      },
      {
        property: 'scaleX',
        from: routeItem.scale,
        to: routeItem.scaleOnHover
      }
    ]
  })

  return (
    <Pressable
      key={routeItem.label}
      style={[flexbox.alignCenter, index !== routeItemsLength - 1 && spacings.mr]}
      disabled={routeItem.disabled}
      onPress={async () => {
        if (routeItem?.onPress) {
          routeItem.onPress()
          return
        }

        if (routeItem.isExternal) {
          try {
            await createTab(routeItem.route)
          } catch {
            addToast(t('Failed to open new tab.'), { type: 'error' })
          }
          return
        }
        if (!routeItem.route) return

        navigate(routeItem.route)
      }}
      {...bindAccountBtnAnim}
    >
      <View
        testID={routeItem.testID}
        style={{
          height: ITEM_HEIGHT,
          paddingHorizontal: 9, // this way it gets equal to ITEM_HEIGHT (when square), and flexible otherwise
          borderRadius: BORDER_RADIUS_PRIMARY,
          backgroundColor: isAccountBtnHovered ? NEUTRAL_BACKGROUND_HOVERED : NEUTRAL_BACKGROUND,
          ...flexbox.center,
          // opacity: routeItem.disabled ? 0.4 : 1,
          ...spacings.mbTy
        }}
      >
        <Animated.View
          style={{
            opacity: routeItem.disabled ? 0.4 : accountBtnAnimStyle.opacity,
            transform: [{ scale: accountBtnAnimStyle.scaleX as number }]
          }}
        >
          <routeItem.icon color={theme.primaryBackground} height={ITEM_HEIGHT} />
        </Animated.View>
      </View>
      <Text
        color={theme.primaryBackground}
        weight="regular"
        fontSize={12}
        style={routeItem.disabled && { opacity: 0.4 }}
      >
        {routeItem.label}
      </Text>
    </Pressable>
  )
}

export default React.memo(RouteItem)
