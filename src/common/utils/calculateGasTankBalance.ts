import { formatUnits } from 'ethers'

import { Account } from '@ambire-common/interfaces/account'
import { SelectedAccountPortfolio } from '@ambire-common/interfaces/selectedAccount'
import { GasTankTokenResult } from '@ambire-common/libs/portfolio'

const calculateTokenBalance = (token: GasTankTokenResult, type: keyof GasTankTokenResult) => {
  const amount = token[type]
  const { decimals, priceIn } = token
  const balance = parseFloat(formatUnits(amount, decimals))
  const price =
    priceIn.find(({ baseCurrency }: { baseCurrency: string }) => baseCurrency === 'usd')?.price || 0

  return balance * price
}

export const calculateGasTankBalance = (
  portfolio: SelectedAccountPortfolio,
  account: Account | null,
  hasGasTank: boolean,
  key: 'usd' | 'cashback' | 'saved'
) => {
  const gasTankResult = portfolio?.latest?.gasTank?.result

  if (
    !account?.addr ||
    !gasTankResult ||
    !('gasTankTokens' in gasTankResult) ||
    !Array.isArray(gasTankResult.gasTankTokens) ||
    gasTankResult.gasTankTokens.length === 0 ||
    !hasGasTank
  ) {
    return 0
  }

  const token = gasTankResult.gasTankTokens[0]

  return key === 'usd' ? Number(gasTankResult.total?.[key]) || 0 : calculateTokenBalance(token, key)
}
