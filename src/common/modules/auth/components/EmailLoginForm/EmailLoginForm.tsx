import React, { useCallback, useEffect, useState } from 'react'
import { Controller, useForm } from 'react-hook-form'
import { Trans } from 'react-i18next'
import { Keyboard } from 'react-native'

import { isEmail } from '@ambire-common/services/validations'
import Button from '@common/components/Button'
import Checkbox from '@common/components/Checkbox'
import Input from '@common/components/Input'
import Text from '@common/components/Text'
import { isWeb } from '@common/config/env'
import { useTranslation } from '@common/config/localization'
import useNavigation from '@common/hooks/useNavigation'
import useTheme from '@common/hooks/useTheme'
import EmailAnimation from '@common/modules/auth/components/EmailAnimation'
import useStepper from '@common/modules/auth/hooks/useOnboardingNavigation'
import { ROUTES } from '@common/modules/router/constants/common'
import colors from '@common/styles/colors'
import { SPACING_MD } from '@common/styles/spacings'
// import spacings from '@common/styles/spacings'
import { THEME_TYPES } from '@common/styles/themeConfig'
import flexbox from '@common/styles/utils/flexbox'
import text from '@common/styles/utils/text'
import { delayPromise } from '@common/utils/promises'

const EmailLoginForm: React.FC<any> = ({
  isPasswordConfirmStep,
  setIsPasswordConfirmStep,
  currentFlow
}) => {
  const { t } = useTranslation()
  const [enableKeyRecovery, onEnableKeyRecoveryChange] = useState(false)
  const { navigate } = useNavigation()
  const { themeType } = useTheme()
  const {
    control,
    handleSubmit,
    watch,
    setValue,
    formState: { errors, isSubmitting, isValid }
  } = useForm({
    mode: 'all',
    defaultValues: {
      email: ''
    }
  })

  const { stepperState } = useStepper()
  // TODO: v2
  const requiresEmailConfFor = !!stepperState?.currentStep
  const pendingLoginAccount = false

  const handleFormSubmit = useCallback(() => {
    !isWeb && Keyboard.dismiss()
    handleSubmit(async ({ email }) => {
      // wait state update before Wallet calcs because
      // when Wallet method is called on devices with slow CPU the UI freezes
      await delayPromise(100)

      // TODO: v2
      setIsPasswordConfirmStep(true)
    })()
  }, [handleSubmit, setIsPasswordConfirmStep])

  const handleCancelLoginAttempts = useCallback(() => {
    // TODO: v2
  }, [])

  // FIXME: Refactor when later on this gets wired-up
  useEffect(() => {
    const delay = 4
    if (isPasswordConfirmStep) {
      setTimeout(() => {
        navigate(ROUTES.keyStoreSetup)
      }, delay * 1000)
    }
  }, [isPasswordConfirmStep, navigate, currentFlow])

  return (
    <>
      {isPasswordConfirmStep ? (
        <>
          <EmailAnimation />
          <Text
            fontSize={14}
            weight="regular"
            style={[text.center, { marginBottom: SPACING_MD * 2 }]}
          >
            {t(
              'We sent an email to {{email}}, please check your inbox and click Authorize New Device.',
              { email: 'email@gmail.com' }
            )}
          </Text>
        </>
      ) : (
        ''
      )}
      {!isPasswordConfirmStep ? (
        <>
          <Controller
            control={control}
            rules={{ validate: isEmail, required: true }}
            render={({ field: { onChange, onBlur, value } }) => (
              <Input
                label={t('Please insert your email')}
                onBlur={onBlur}
                placeholder={t('Email Address')}
                onChangeText={onChange}
                // TODO: v2
                // onSubmitEditing={handleSubmit(handleLogin)}
                value={value}
                autoFocus={isWeb}
                isValid={!errors.email && value.length > 0}
                validLabel={pendingLoginAccount ? t('Email address confirmed') : ''}
                error={errors.email && (t('Please fill in a valid email.') as string)}
                // containerStyle={requiresPassword ? spacings.mbTy : null}
              />
            )}
            name="email"
          />
          <Checkbox
            value={enableKeyRecovery}
            onValueChange={() => onEnableKeyRecoveryChange((prev) => !prev)}
            label={
              <Trans>
                Enable <strong>local</strong> key store recovery with email
              </Trans>
            }
          />

          <Button
            textStyle={{ fontSize: 14 }}
            // disabled={
            //   (!!requiresEmailConfFor && !pendingLoginAccount) ||
            //   isSubmitting ||
            //   !watch('email', '')
            // }
            disabled={!isValid}
            type="primary"
            text={
              // eslint-disable-next-line no-nested-ternary
              isSubmitting ? t('Loading...') : !pendingLoginAccount ? t('Continue') : t('Log In')
            }
            onPress={handleFormSubmit}
          />
        </>
      ) : (
        <>
          <Text
            fontSize={14}
            style={{ ...flexbox.alignSelfCenter, marginBottom: 60 }}
            appearance="primary"
          >
            {t('Waiting for Email Confirmation')}
          </Text>

          <Text
            underline
            fontSize={14}
            style={[flexbox.alignSelfCenter]}
            color={themeType === THEME_TYPES.LIGHT ? colors.howl : undefined}
            onPress={handleCancelLoginAttempts}
          >
            {t('Cancel Login Attempt')}
          </Text>
        </>
      )}
    </>
  )
}

export default EmailLoginForm
