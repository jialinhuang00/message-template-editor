import type { Locale } from '../types'

export const zhTW: Locale = {
  mock: {
    customer_name: '小明',
    order_id: 'A123456',
    shop_name: 'Omnichat 示範商店',
  },
  example: '嗨 {{ customer_name }},你的訂單 {{ order_id }} 已經準備好了。',
  receipt: {
    read: '已讀',
    seen: '已看過',
  },
}
