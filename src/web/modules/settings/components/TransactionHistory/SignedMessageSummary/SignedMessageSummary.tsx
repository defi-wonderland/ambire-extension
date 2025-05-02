import React, { useMemo } from 'react'
import { ScrollView, View, ViewStyle } from 'react-native'

import { SignedMessage } from '@ambire-common/controllers/activity/types'
import { stringify } from '@ambire-common/libs/richJson/richJson'
import { ENTRY_POINT_AUTHORIZATION_REQUEST_ID } from '@ambire-common/libs/userOperation/userOperation'
import ManifestFallbackIcon from '@common/assets/svg/ManifestFallbackIcon'
import ExpandableCard from '@common/components/ExpandableCard'
import { visualizeContent } from '@common/components/HumanizedVisualization/HumanizedVisualization'
import Text from '@common/components/Text'
import Tooltip from '@common/components/Tooltip'
import { useTranslation } from '@common/config/localization'
import useTheme from '@common/hooks/useTheme'
import spacings from '@common/styles/spacings'
import flexbox from '@common/styles/utils/flexbox'
import ManifestImage from '@web/components/ManifestImage'

import getStyles from './styles'

interface Props {
  signedMessage: SignedMessage
  style?: ViewStyle
}

const getParsedSignedMessageContent = (content: SignedMessage['content']) => {
  if (content.kind === 'message') {
    return visualizeContent(content.kind, content.message)
  }
  if (content.kind === 'authorization-7702') {
    return JSON.stringify(
      {
        chainId: content.chainId.toString(),
        nonce: content.nonce.toString(),
        implementation: content.contractAddr.toString(),
        resultHash: visualizeContent(content.kind, content.message)
      },
      null,
      4
    )
  }

  return stringify(content, { pretty: true })
}

const SignedMessageSummary = ({ signedMessage, style }: Props) => {
  const { styles } = useTheme(getStyles)
  const { t } = useTranslation()

  const dAppName = useMemo(() => {
    if (signedMessage.fromActionId === ENTRY_POINT_AUTHORIZATION_REQUEST_ID) {
      return 'Entry Point Authorization'
    }
    if (signedMessage.content.kind === 'authorization-7702') {
      return 'EIP-7702 Authorization'
    }

    return signedMessage.dapp?.name || 'Unknown App'
  }, [signedMessage.dapp?.name, signedMessage.fromActionId, signedMessage.content.kind])

  const dAppNameTooltipId = useMemo(() => {
    // Filter out spaces and special characters
    const encodedDAppName = dAppName
      .replace(/[^a-zA-Z0-9]/g, '')
      .replace(/\s+/g, '')
      .toLowerCase()

    return `${encodedDAppName}-tooltip`
  }, [dAppName])

  return (
    <ExpandableCard
      arrowPosition="right"
      style={style}
      content={
        <View style={[flexbox.directionRow, flexbox.alignCenter, flexbox.flex1]}>
          <View style={[flexbox.alignCenter, flexbox.directionRow, flexbox.flex1, spacings.prTy]}>
            {signedMessage.fromActionId !== ENTRY_POINT_AUTHORIZATION_REQUEST_ID &&
              signedMessage.content.kind !== 'authorization-7702' && (
                <ManifestImage
                  uri={signedMessage?.dapp?.icon || ''}
                  size={32}
                  fallback={() => <ManifestFallbackIcon />}
                  containerStyle={spacings.mrTy}
                />
              )}
            <Text
              fontSize={16}
              weight="semiBold"
              numberOfLines={2}
              dataSet={{
                tooltipId: dAppNameTooltipId
              }}
            >
              {dAppName}
            </Text>
            <Tooltip content={dAppName} id={dAppNameTooltipId} />
          </View>
          <View style={flexbox.flex1}>
            {new Date(signedMessage.timestamp).toString() !== 'Invalid Date' && (
              <Text fontSize={14} appearance="secondaryText">
                {`${new Date(signedMessage.timestamp).toLocaleDateString()} (${new Date(
                  signedMessage.timestamp
                ).toLocaleTimeString()})`}
              </Text>
            )}
          </View>
          <View style={flexbox.flex1}>
            <Text fontSize={14} appearance="secondaryText">
              {signedMessage.content.kind === 'message' && 'Message'}
              {signedMessage.content.kind === 'typedMessage' && 'Typed Data'}
              {signedMessage.content.kind === 'authorization-7702' && 'EIP-7702'}
            </Text>
          </View>
        </View>
      }
      expandedContent={
        <ScrollView contentContainerStyle={styles.rawMessage}>
          <Text
            appearance="secondaryText"
            fontSize={14}
            weight="regular"
            style={styles.rawMessageTitle}
          >
            {t('Raw message')}:
          </Text>
          <Text selectable appearance="secondaryText" fontSize={14} weight="regular">
            {getParsedSignedMessageContent(signedMessage.content)}
          </Text>
        </ScrollView>
      }
    />
  )
}

export default React.memo(SignedMessageSummary)
