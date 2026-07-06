import type { Component } from 'vue'
import IconWhatsapp from '~icons/simple-icons/whatsapp'
import IconLine from '~icons/simple-icons/line'
import IconMessenger from '~icons/simple-icons/messenger'
import type { Channel } from '@/types'

/** Brand icon for each channel (simple-icons via unplugin-icons). */
export const CHANNEL_ICON: Record<Channel, Component> = {
  WhatsApp: IconWhatsapp,
  LINE: IconLine,
  Messenger: IconMessenger,
}
