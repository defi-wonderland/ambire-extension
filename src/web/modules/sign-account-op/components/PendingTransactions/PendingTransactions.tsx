import { keccak256, toUtf8Bytes } from 'ethers'
import React, { FC, useEffect } from 'react'
import { useTranslation } from 'react-i18next'
import { View } from 'react-native'

import { Hex } from '@ambire-common/interfaces/hex'
import { Network } from '@ambire-common/interfaces/network'
import { humanizeAccountOp } from '@ambire-common/libs/humanizer'
import { IrCall } from '@ambire-common/libs/humanizer/interfaces'
import { stringify } from '@ambire-common/libs/richJson/richJson'
import NetworkBadge from '@common/components/NetworkBadge'
import spacings from '@common/styles/spacings'
import flexbox from '@common/styles/utils/flexbox'
import DelegationHumanization from '@web/components/DelegationHumanization'
import useSignAccountOpControllerState from '@web/hooks/useSignAccountOpControllerState'
import SectionHeading from '@web/modules/sign-account-op/components/SectionHeading'
import TransactionSummary from '@web/modules/sign-account-op/components/TransactionSummary'

import PendingTransactionsSkeleton from './PendingTransactionsSkeleton'

interface Props {
  network?: Network
  setDelegation?: boolean
  delegatedContract?: Hex | null
}

const PendingTransactions: FC<Props> = ({ network, setDelegation, delegatedContract }) => {
  const { t } = useTranslation()
  const { accountOp } = useSignAccountOpControllerState() || {}
  const oldAccountOpRelevantInfoHash = React.useRef<string>('')
  const [callsToVisualize, setCallsToVisualize] = React.useState<IrCall[]>([])

  useEffect(() => {
    if (!accountOp) return
    const actualDependencyArrayAsString = stringify([
      accountOp.calls,
      accountOp.chainId,
      accountOp.accountAddr
    ])
    const newAccountOpRelevantInfoHash = keccak256(toUtf8Bytes(actualDependencyArrayAsString))

    const hasAccountOpChangedSincePrevRender =
      oldAccountOpRelevantInfoHash.current !== newAccountOpRelevantInfoHash

    if (!hasAccountOpChangedSincePrevRender) return

    setCallsToVisualize(humanizeAccountOp(accountOp, {}))

    oldAccountOpRelevantInfoHash.current = newAccountOpRelevantInfoHash
  }, [accountOp])

  return (
    <View style={spacings.mbLg}>
      <View
        style={[
          flexbox.directionRow,
          flexbox.alignCenter,
          flexbox.justifySpaceBetween,
          spacings.mbSm
        ]}
      >
        <SectionHeading withMb={false}>{t('Overview')}</SectionHeading>
        <NetworkBadge chainId={network?.chainId} withOnPrefix />
      </View>
      {setDelegation !== undefined ? (
        <DelegationHumanization
          setDelegation={setDelegation}
          delegatedContract={delegatedContract}
        />
      ) : network && callsToVisualize.length ? (
        callsToVisualize.map((call, i) => (
          <TransactionSummary
            key={call.id}
            style={i !== callsToVisualize.length - 1 ? spacings.mbTy : {}}
            call={call}
            chainId={network.chainId}
            index={i}
          />
        ))
      ) : (
        <PendingTransactionsSkeleton />
      )}
    </View>
  )
}

export default PendingTransactions
