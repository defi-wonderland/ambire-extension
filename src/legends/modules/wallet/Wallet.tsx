import React from 'react'

import Page from '@legends/components/Page'
import Actions from '@legends/modules/wallet/components/Actions'
import Home from '@legends/modules/wallet/components/Home'

const Wallet = () => {
  return (
    <Page containerSize="full">
      <Home />
      <Actions />
    </Page>
  )
}

export default Wallet
