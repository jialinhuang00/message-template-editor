import type { Locale } from '../types'

/** English keeps the canonical mock values so the documented example reproduces. */
export const en: Locale = {
  mock: {
    customer_name: 'Alex',
    order_id: 'A123456',
    shop_name: 'Omnichat Demo Store',
  },
  example: 'Hi {{ customer_name }}, your order {{ order_id }} is ready.',
  receipt: {
    read: 'Read',
    seen: 'Seen',
  },
}
