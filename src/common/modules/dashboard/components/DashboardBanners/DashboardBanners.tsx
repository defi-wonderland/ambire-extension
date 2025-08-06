import React from 'react'
import { View } from 'react-native'

import { Banner } from '@ambire-common/interfaces/banner'
import DashboardBanner from '@common/modules/dashboard/components/DashboardBanners/DashboardBanner/DashboardBanner'
import MarketingBanner from '@common/modules/dashboard/components/DashboardBanners/MarketingBanner/MarketingBanner'
import useBanners from '@common/modules/dashboard/hooks/useBanners'

const RELAYER_BANNER_TYPES = ['updates', 'rewards', 'new', 'vote', 'tips', 'alert'] as const

function isMarketingBanner(banner: Banner) {
  return (
    !!banner &&
    !!banner.type &&
    RELAYER_BANNER_TYPES.includes(banner.type as typeof RELAYER_BANNER_TYPES[number])
  )
}

const DashboardBanners = () => {
  const allBanners = useBanners()

  return (
    <View>
      {allBanners.map((banner) =>
        isMarketingBanner(banner) ? (
          <MarketingBanner key={banner.id} banner={banner} />
        ) : (
          <DashboardBanner key={banner.id} banner={banner} />
        )
      )}
    </View>
  )
}

export default React.memo(DashboardBanners)
