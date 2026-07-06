import type { Language } from '@/types'

/** Example message templates per language, used as the content placeholder and Tab-fill. */
export const EXAMPLE_BY_LANGUAGE: Record<Language, string> = {
  'zh-TW': '嗨 {{ customer_name }},你的訂單 {{ order_id }} 已經準備好了。',
  en: 'Hi {{ customer_name }}, your order {{ order_id }} is ready.',
  ja: '{{ customer_name }}さん、ご注文 {{ order_id }} の準備ができました。',
}
