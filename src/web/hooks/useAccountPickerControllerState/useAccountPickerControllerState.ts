import { useContext } from 'react'

import { AccountPickerControllerStateContext } from '@web/contexts/accountPickerControllerStateContext'

export default function useAccountPickerControllerState() {
  const context = useContext(AccountPickerControllerStateContext)

  if (!context) {
    throw new Error(
      'useAccountPickerController must be used within a AccountPickerControllerProvider'
    )
  }

  return context
}
