/* eslint-disable react/no-unused-prop-types */
import 'intro.js/introjs.css'
import './style.css'

import { Steps } from 'intro.js-react'
import React, {
  createContext,
  ReactNode,
  useCallback,
  useEffect,
  useMemo,
  useRef,
  useState
} from 'react'
import { useTranslation } from 'react-i18next'
import { View } from 'react-native'
import { BrowserRouter } from 'react-router-dom'

import Badge from '@common/components/Badge'
import Text from '@common/components/Text'
import { ThemeProvider } from '@common/contexts/themeContext'
import spacings from '@common/styles/spacings'
import flexbox from '@common/styles/utils/flexbox'

export const SmartAccountIntroId = 'smart-account-badge'
export const BasicAccountIntroId = 'basic-account-badge'

const AccountPickerIntroStepsContext = createContext<{
  showIntroSteps: boolean
  setShowIntroSteps: (show: boolean) => void
}>({
  showIntroSteps: false,
  setShowIntroSteps: () => {}
})

const Step = ({
  title,
  text,
  titleRightChildren
}: {
  title: string
  text: string
  titleRightChildren?: ReactNode
}) => {
  const { t } = useTranslation()

  // Steps are injected outside of the react tree so we need to wrap them in
  // the React contexts they need to access. @TODO: A better solution would be to some to use inject intro.js into the App tree
  return (
    <BrowserRouter>
      <ThemeProvider>
        <View
          style={[
            flexbox.directionRow,
            flexbox.alignCenter,
            flexbox.justifySpaceBetween,
            spacings.mbSm
          ]}
        >
          <Text fontSize={16} weight="medium">
            {t(title)}
          </Text>
          {titleRightChildren}
        </View>
        <Text style={spacings.mbTy} fontSize={12} appearance="secondaryText">
          {t(text)}
        </Text>
      </ThemeProvider>
    </BrowserRouter>
  )
}

const STEPS = [
  {
    element: `#${SmartAccountIntroId}`,
    position: 'top',
    intro: (
      <Step
        title="Smart Account"
        text="Smart Accounts unlock the full potential of Ethereum and EVM networks, offering advanced features like paying gas fees in stablecoins, simulating transaction outcomes, and batching multiple actions into a single transaction."
        // WARNING: Don't use display badge tooltips, it will crash the extension because
        // there is no portal host in the intro.js context
        titleRightChildren={<Badge type="success" text="Smart Account" />}
      />
    )
  },
  {
    element: `#${BasicAccountIntroId}`,
    position: 'top',
    intro: (
      <Step
        title="Basic Account"
        text="We refer to EOAs (Externally Owned Accounts) as Basic Accounts. These native accounts on Ethereum and EVM networks offer limited functionality compared to Smart Accounts."
        // WARNING: Don't use display badge tooltips, it will crash the extension because
        // there is no portal host in the intro.js context
        titleRightChildren={<Badge type="warning" text="Basic Account" />}
      />
    )
  }
]

const AccountPickerIntroStepsProvider: React.FC<{
  children: ReactNode | ReactNode[]
  forceCompleted?: boolean
}> = ({ children, forceCompleted }) => {
  const [introCompleted, setIntroCompleted] = useState(false)
  const [showIntroSteps, setShowIntroSteps] = useState(false)
  const introJsRef = useRef<any>(null)
  const { t } = useTranslation()

  const onExit = () => {
    setShowIntroSteps(false)
  }

  const onComplete = () => {
    setIntroCompleted(true)
  }

  const onShowIntroSteps = useCallback(
    (show: boolean) => {
      if (!introCompleted) setShowIntroSteps(show)
    },
    [introCompleted]
  )

  useEffect(() => {
    if (forceCompleted && !introCompleted) {
      setIntroCompleted(true)
    }
  }, [forceCompleted, introCompleted])

  useEffect(() => {
    setShowIntroSteps(false)
    return () => {
      setShowIntroSteps(false)
    }
  }, [])

  useEffect(() => {
    const observer = new MutationObserver(() => {
      window.dispatchEvent(new Event('resize'))
    })

    const el = document.getElementById('account-picker-page-list')
    if (el) observer.observe(el, { childList: true, subtree: true })
    return () => {
      observer.disconnect()
    }
  }, [])

  return (
    <AccountPickerIntroStepsContext.Provider
      value={useMemo(
        () => ({
          showIntroSteps,
          setShowIntroSteps: onShowIntroSteps
        }),
        [showIntroSteps, onShowIntroSteps]
      )}
    >
      {!introCompleted && (
        <Steps
          enabled={showIntroSteps}
          steps={STEPS}
          initialStep={0}
          onExit={onExit}
          ref={introJsRef}
          onComplete={onComplete}
          options={{
            doneLabel: t('Got it'),
            hidePrev: true,
            exitOnEsc: false,
            exitOnOverlayClick: false,
            highlightClass: 'intro-backdrop'
          }}
        />
      )}
      {children}
    </AccountPickerIntroStepsContext.Provider>
  )
}

export { AccountPickerIntroStepsProvider, AccountPickerIntroStepsContext }
