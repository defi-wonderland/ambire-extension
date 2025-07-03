import React, { useMemo } from 'react'
import { useTranslation } from 'react-i18next'

import LockWithTimerIcon from '@common/assets/svg/LockWithTimerIcon'
import ControlOption from '@common/components/ControlOption'
import Select from '@common/components/Select'
import useTheme from '@common/hooks/useTheme'
import spacings from '@common/styles/spacings'
import {
  AUTO_LOCK_TIMES,
  getAutoLockLabel
} from '@web/extension-services/background/controllers/auto-lock'
import useAutoLockStateController from '@web/hooks/useAutoLockStateController'
import useBackgroundService from '@web/hooks/useBackgroundService'

const AUTO_LOCK_OPTIONS = [
  {
    value: AUTO_LOCK_TIMES.never,
    label: getAutoLockLabel(AUTO_LOCK_TIMES.never)
  },
  {
    value: AUTO_LOCK_TIMES._7days,
    label: getAutoLockLabel(AUTO_LOCK_TIMES._7days)
  },
  {
    value: AUTO_LOCK_TIMES._1day,
    label: getAutoLockLabel(AUTO_LOCK_TIMES._1day)
  },
  {
    value: AUTO_LOCK_TIMES._8hours,
    label: getAutoLockLabel(AUTO_LOCK_TIMES._8hours)
  },
  {
    value: AUTO_LOCK_TIMES._1hour,
    label: getAutoLockLabel(AUTO_LOCK_TIMES._1hour)
  },
  {
    value: AUTO_LOCK_TIMES._10minutes,
    label: getAutoLockLabel(AUTO_LOCK_TIMES._10minutes)
  }
]

const AutoLockDeviceControlOption = () => {
  const { dispatch } = useBackgroundService()
  const { t } = useTranslation()
  const { theme } = useTheme()
  const { autoLockTime } = useAutoLockStateController()

  const selectedOption = useMemo(() => {
    return AUTO_LOCK_OPTIONS.find((option) => option.value === autoLockTime) || AUTO_LOCK_OPTIONS[0]
  }, [autoLockTime])

  return (
    <ControlOption
      style={spacings.mbTy}
      title={t('Auto-lock device')}
      description={t('Set a timer, after which the Kohaku Wallet will be automatically locked.')}
      // readMoreLink="https://help.ambire.com/hc/en-us/articles/15915341165852"
      renderIcon={<LockWithTimerIcon color={theme.primaryText} />}
    >
      <Select
        setValue={(option) => {
          dispatch({
            type: 'AUTO_LOCK_CONTROLLER_SET_AUTO_LOCK_TIME',
            params: option.value as AUTO_LOCK_TIMES
          })
        }}
        withSearch={false}
        options={AUTO_LOCK_OPTIONS}
        value={selectedOption}
        containerStyle={{
          width: 120,
          ...spacings.mb0
        }}
        size="sm"
      />
    </ControlOption>
  )
}

export default React.memo(AutoLockDeviceControlOption)
