import { getAddress, ZeroAddress } from 'ethers'
import React, { FC, useMemo } from 'react'

import { HumanizerMetaAddress } from '@ambire-common/libs/humanizer/interfaces'
import { Props as TextProps } from '@common/components/Text'
import { useTranslation } from '@common/config/localization'
import { isExtension } from '@web/constants/browserapi'
import useAccountsControllerState from '@web/hooks/useAccountsControllerState'
import useAddressBookControllerState from '@web/hooks/useAddressBookControllerState'
import useSelectedAccountControllerState from '@web/hooks/useSelectedAccountControllerState'

import BaseAddress from '../BaseAddress'
import { BenzinDomainsAddress, DomainsAddress } from '../DomainsAddress'

interface Props extends TextProps {
  address: string
  // example of highestPriorityAlias: a name coming from the humanizer's metadata
  highestPriorityAlias?: string
  humanizerInfo?: HumanizerMetaAddress
  hideLinks?: boolean
}

const HumanizerAddressInner: FC<Props> = ({
  humanizerInfo,
  address,
  highestPriorityAlias,
  hideLinks = false,
  ...rest
}) => {
  const { portfolio } = useSelectedAccountControllerState()
  const accountsState = useAccountsControllerState()
  const { t } = useTranslation()
  const { contacts = [] } = useAddressBookControllerState()
  const checksummedAddress = useMemo(() => getAddress(address), [address])

  const account = useMemo(() => {
    if (!accountsState?.accounts) return undefined
    return accountsState.accounts.find((a) => a.addr === checksummedAddress)
  }, [accountsState?.accounts, checksummedAddress])
  const tokenInPortfolio = useMemo(() => {
    if (!portfolio?.tokens) return undefined
    return portfolio.tokens.find((token) => token.address.toLowerCase() === address.toLowerCase())
  }, [portfolio?.tokens, address])

  const hardcodedTokenSymbol = useMemo(() => humanizerInfo?.token?.symbol, [humanizerInfo])
  const hardcodedName = useMemo(() => humanizerInfo?.name, [humanizerInfo?.name])

  let tokenLabel = ''

  if (tokenInPortfolio) {
    tokenLabel = `Token ${tokenInPortfolio?.symbol} Contract`
  } else if (hardcodedTokenSymbol) {
    tokenLabel = t(`Token ${hardcodedTokenSymbol} Contract`)
  }

  const contact = contacts.find((c) => c.address.toLowerCase() === address.toLowerCase())
  const zeroAddressLabel = address === ZeroAddress && 'Zero Address'
  // highestPriorityAlias and account labels are of higher priority than domains
  if (
    highestPriorityAlias ||
    zeroAddressLabel ||
    contact?.name ||
    account?.preferences?.label ||
    hardcodedName ||
    tokenLabel
  )
    return (
      <BaseAddress address={checksummedAddress} hideLinks={hideLinks} {...rest}>
        {highestPriorityAlias ||
          zeroAddressLabel ||
          contact?.name ||
          account?.preferences?.label ||
          hardcodedName ||
          tokenLabel}
      </BaseAddress>
    )

  if (!isExtension) return <BenzinDomainsAddress address={checksummedAddress} {...rest} />

  return <DomainsAddress address={checksummedAddress} {...rest} />
}

export default React.memo(HumanizerAddressInner)
