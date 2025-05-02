import { CARD_PREDEFINED_ID } from './cards'

const PREDEFINED_ACTION_LABEL_MAP: {
  [key: string]: string
} = {
  [CARD_PREDEFINED_ID.wheelOfFortune]: 'Spin The Wheel',
  [CARD_PREDEFINED_ID.inviteAccount]: 'Invite Address',
  [CARD_PREDEFINED_ID.linkX]: 'Link X or Farcaster',
  [CARD_PREDEFINED_ID.linkAccount]: 'Link Account'
}

export { PREDEFINED_ACTION_LABEL_MAP }
