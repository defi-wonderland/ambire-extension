import React, { FC, useCallback } from 'react'
import { Pressable } from 'react-native'
import CheckIcon2 from '@common/assets/svg/CheckIcon2'
import OpenIcon from '@common/assets/svg/OpenIcon'
import Text from '@common/components/Text'
import useTheme from '@common/hooks/useTheme'
import useToast from '@common/hooks/useToast'
import spacings from '@common/styles/spacings'
import flexbox from '@common/styles/utils/flexbox'
import { openInTab } from '@web/extension-services/background/webapi/tab'
import BackgroundShapes from '../BackgroundShapes'

type CompletedProps = {
  title: string
  titleSecondary: string
  openExplorerText: string
  explorerLink?: string
}

const Completed: FC<CompletedProps> = ({
  title,
  titleSecondary,
  openExplorerText,
  explorerLink
}) => {
  const { addToast } = useToast()
  const { theme } = useTheme()

  const handleOpenExplorer = useCallback(async () => {
    if (!explorerLink) return
    try {
      await openInTab({ url: explorerLink })
    } catch {
      addToast('Error opening explorer', { type: 'error' })
    }
  }, [addToast, explorerLink])

  return (
    <>
      <BackgroundShapes
        style={{
          position: 'absolute',
          top: 0,
          left: 0,
          right: 0,
          bottom: 0,
          width: '100%',
          height: '100%',
          zIndex: -1
        }}
      />
      <CheckIcon2 style={spacings.mb3Xl} />
      <Text fontSize={20} weight="medium" style={spacings.mbTy} testID="txn-status">
        {title}
      </Text>
      <Text weight="medium" appearance="secondaryText" style={spacings.mb2Xl}>
        {titleSecondary}
      </Text>
      {!!explorerLink && (
        <Pressable
          onPress={handleOpenExplorer}
          style={[flexbox.directionRow, flexbox.alignCenter, flexbox.justifyCenter]}
        >
          <OpenIcon color={theme.primary} width={16} height={16} style={spacings.mrTy} />
          <Text
            weight="medium"
            style={{
              textDecorationLine: 'underline',
              textDecorationColor: theme.primary,
              textDecorationStyle: 'solid'
            }}
            appearance="primary"
          >
            {openExplorerText}
          </Text>
        </Pressable>
      )}
    </>
  )
}

export default Completed
