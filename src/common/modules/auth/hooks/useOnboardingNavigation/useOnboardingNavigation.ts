import { useContext } from 'react'

import { OnboardingNavigationContext } from '@common/modules/auth/contexts/onboardingNavigationContext'

export default function useOnboardingNavigation() {
  const context = useContext(OnboardingNavigationContext)

  if (!context) {
    throw new Error('useOnboardingNavigation must be used within an OnboardingNavigationProvider')
  }

  return context
}
