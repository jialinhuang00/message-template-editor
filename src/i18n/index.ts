import type { Language } from '@/types'
import type { Locale } from './types'
import { en } from './locales/en'
import { ja } from './locales/ja'
import { zhTW } from './locales/zh-TW'

export type { Locale } from './types'

/** All preview-facing strings, keyed by the template's target language. */
export const LOCALES: Record<Language, Locale> = {
  en,
  ja,
  'zh-TW': zhTW,
}
