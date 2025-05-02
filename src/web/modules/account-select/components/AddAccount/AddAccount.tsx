import React, { useCallback, useState } from 'react'
import { useTranslation } from 'react-i18next'
import { Pressable, View } from 'react-native'
import { useModalize } from 'react-native-modalize'

import AddCircularIcon from '@common/assets/svg/AddCircularIcon'
import AddFromCurrentRecoveryPhraseIcon from '@common/assets/svg/AddFromCurrentRecoveryPhraseIcon'
import HWIcon from '@common/assets/svg/HWIcon'
import ImportJsonIcon from '@common/assets/svg/ImportJsonIcon'
import LatticeMiniIcon from '@common/assets/svg/LatticeMiniIcon'
import LedgerMiniIcon from '@common/assets/svg/LedgerMiniIcon'
import PrivateKeyIcon from '@common/assets/svg/PrivateKeyIcon'
import SeedPhraseIcon from '@common/assets/svg/SeedPhraseIcon'
import TrezorMiniIcon from '@common/assets/svg/TrezorMiniIcon'
import ViewOnlyIcon from '@common/assets/svg/ViewOnlyIcon'
import BottomSheet from '@common/components/BottomSheet'
import Option from '@common/components/Option'
import { PanelBackButton, PanelTitle } from '@common/components/Panel/Panel'
import Text from '@common/components/Text'
import useTheme from '@common/hooks/useTheme'
import useOnboardingNavigation from '@common/modules/auth/hooks/useOnboardingNavigation'
import { WEB_ROUTES } from '@common/modules/router/constants/common'
import spacings from '@common/styles/spacings'
import flexbox from '@common/styles/utils/flexbox'
import text from '@common/styles/utils/text'
import useBackgroundService from '@web/hooks/useBackgroundService'
import useKeystoreControllerState from '@web/hooks/useKeystoreControllerState'
import SavedSeedPhrases from '@web/modules/account-select/components/SavedSeedPhrases'

import getStyles from './styles'

const AddAccount = ({ handleClose }: { handleClose: () => void }) => {
  const { t } = useTranslation()
  const { styles } = useTheme(getStyles)
  const { dispatch } = useBackgroundService()
  const [isHwOptionExpanded, setIsHwOptionExpanded] = useState(false)
  const { goToNextRoute, setTriggeredHwWalletFlow } = useOnboardingNavigation()
  const toggleHwOptions = useCallback(() => {
    setIsHwOptionExpanded((p) => !p)
  }, [])
  const { seeds } = useKeystoreControllerState()

  const { ref: sheetRef, open: openBottomSheet, close: closeBottomSheet } = useModalize()

  return (
    <>
      <View style={spacings.ptSm}>
        <View style={[flexbox.directionRow, flexbox.alignCenter, spacings.mbLg]}>
          <PanelBackButton onPress={handleClose} style={spacings.mr} />
          <PanelTitle title={t('Add an account')} style={text.left} />
        </View>
        <View style={styles.optionsWrapper}>
          <Option
            text={t('Add from current recovery phrase')}
            disabled={!seeds.length}
            icon={AddFromCurrentRecoveryPhraseIcon}
            onPress={openBottomSheet as any}
            iconProps={{ width: 32, height: 32 }}
            testID="add-from-current-recovery-phrase"
          />
          <Option
            text={t('Create new recovery phrase')}
            icon={AddCircularIcon}
            onPress={() => goToNextRoute(WEB_ROUTES.createSeedPhrasePrepare)}
            testID="create-new-recovery-phrase"
          />
        </View>
        <View style={styles.optionsWrapper}>
          <Option
            text={t('Import recovery phrase')}
            icon={SeedPhraseIcon}
            iconProps={{ width: 30, height: 30 }}
            onPress={() => goToNextRoute(WEB_ROUTES.importSeedPhrase)}
            testID="import-recovery-phrase"
          />
          <Option
            text={t('Import private key')}
            icon={PrivateKeyIcon}
            iconProps={{ width: 30, height: 30 }}
            onPress={() => goToNextRoute(WEB_ROUTES.importPrivateKey)}
            testID="import-private-key"
          />
          <Option
            text={t('Import JSON backup file')}
            icon={ImportJsonIcon}
            iconProps={{ width: 30, height: 30 }}
            onPress={() => goToNextRoute(WEB_ROUTES.importSmartAccountJson)}
            testID="import-json-backup-file"
          />
        </View>
        <View style={styles.optionsWrapper}>
          <Option
            text={t('Connect a hardware wallet')}
            icon={HWIcon}
            iconProps={{ width: 30, height: 30 }}
            onPress={toggleHwOptions}
            testID="connect-hardware-wallet"
            status={isHwOptionExpanded ? 'expanded' : 'collapsed'}
          >
            {isHwOptionExpanded && (
              <View style={styles.hwOptionsContainer}>
                <View style={styles.hwOptionWrapper}>
                  <Pressable
                    style={({ hovered }: any) => [
                      styles.hwOption,
                      hovered && styles.hwOptionHovered
                    ]}
                    onPress={() => {
                      setTriggeredHwWalletFlow('trezor')
                      dispatch({ type: 'MAIN_CONTROLLER_ACCOUNT_PICKER_INIT_TREZOR' })
                    }}
                  >
                    <TrezorMiniIcon width={44} height={44} />
                    <Text fontSize={14} weight="medium" style={spacings.mtMi} numberOfLines={1}>
                      Trezor
                    </Text>
                  </Pressable>
                </View>
                <View style={styles.hwOptionWrapper}>
                  <Pressable
                    style={({ hovered }: any) => [
                      styles.hwOption,
                      hovered && styles.hwOptionHovered
                    ]}
                    onPress={() => goToNextRoute(WEB_ROUTES.ledgerConnect)}
                  >
                    <LedgerMiniIcon width={44} height={44} />
                    <Text fontSize={14} weight="medium" style={spacings.mtMi} numberOfLines={1}>
                      Ledger
                    </Text>
                  </Pressable>
                </View>
                <View style={styles.hwOptionWrapper}>
                  <Pressable
                    style={({ hovered }: any) => [
                      styles.hwOption,
                      hovered && styles.hwOptionHovered
                    ]}
                    onPress={() => {
                      setTriggeredHwWalletFlow('lattice')
                      dispatch({ type: 'MAIN_CONTROLLER_ACCOUNT_PICKER_INIT_LATTICE' })
                    }}
                  >
                    <LatticeMiniIcon width={44} height={44} />
                    <Text fontSize={14} weight="medium" style={spacings.mtMi} numberOfLines={1}>
                      GridPlus
                    </Text>
                  </Pressable>
                </View>
              </View>
            )}
          </Option>
        </View>
        <View>
          <Option
            text={t('Watch an address')}
            icon={ViewOnlyIcon}
            iconProps={{ width: 30, height: 30, strokeWidth: '2.75' }}
            onPress={() => goToNextRoute(WEB_ROUTES.viewOnlyAccountAdder)}
            testID="connect-hardware-wallet"
          />
        </View>
      </View>
      <BottomSheet
        id="seed-phrases-bottom-sheet"
        sheetRef={sheetRef}
        adjustToContentHeight={false}
        containerInnerWrapperStyles={{ flex: 1 }}
        isScrollEnabled={false}
        closeBottomSheet={closeBottomSheet}
      >
        <SavedSeedPhrases handleClose={closeBottomSheet as any} />
      </BottomSheet>
    </>
  )
}

export default React.memo(AddAccount)
