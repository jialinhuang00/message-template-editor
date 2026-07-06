import type { SupportedVariable } from '@/types'

/**
 * Everything the preview localizes by the template's target language. The editor UI
 * itself stays in English; only what the recipient would see is translated here.
 */
export type Locale = {
  /** Mock values substituted into the live preview. */
  mock: Record<SupportedVariable, string>
  /** Placeholder + Tab-to-fill example message. */
  example: string
  /** Read-receipt wording. WhatsApp shows ticks instead, so it ignores these. */
  receipt: {
    read: string
    seen: string
  }
}
