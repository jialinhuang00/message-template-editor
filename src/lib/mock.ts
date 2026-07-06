import type { Language, SupportedVariable } from '@/types'

/**
 * Mock values used to render the live preview, keyed by language so the preview
 * localizes (e.g. `ja` shows a Japanese name). A real app fills these per recipient.
 * `en` keeps the assignment's canonical values so the documented example reproduces.
 */
export const MOCK_VALUES: Record<Language, Record<SupportedVariable, string>> = {
  'zh-TW': {
    customer_name: '小明',
    order_id: 'A123456',
    shop_name: 'Omnichat 示範商店',
  },
  en: {
    customer_name: 'Alex',
    order_id: 'A123456',
    shop_name: 'Omnichat Demo Store',
  },
  ja: {
    customer_name: 'アレックス',
    order_id: 'A123456',
    shop_name: 'オムニチャット デモストア',
  },
}
