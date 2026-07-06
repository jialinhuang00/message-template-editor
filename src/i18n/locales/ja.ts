import type { Locale } from '../types'

export const ja: Locale = {
  mock: {
    customer_name: 'アレックス',
    order_id: 'A123456',
    shop_name: 'オムニチャット デモストア',
  },
  example: '{{ customer_name }}さん、ご注文 {{ order_id }} の準備ができました。',
  receipt: {
    read: '既読',
    seen: '既読',
  },
}
