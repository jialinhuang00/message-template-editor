export const CHANNELS = ['LINE', 'WhatsApp', 'Messenger'] as const
export type Channel = (typeof CHANNELS)[number]

export const LANGUAGES = ['zh-TW', 'en', 'ja'] as const
export type Language = (typeof LANGUAGES)[number]

export const SUPPORTED_VARIABLES = ['customer_name', 'order_id', 'shop_name'] as const
export type SupportedVariable = (typeof SUPPORTED_VARIABLES)[number]

/** The editable template. `channel` starts empty so "required" has a falsy state. */
export interface TemplateForm {
  name: string
  channel: Channel | ''
  language: Language
  title: string
  content: string
}

export type ValidationField = 'name' | 'channel' | 'content'

export interface ValidationError {
  field: ValidationField
  message: string
  /** The offending text, shown in a code block. */
  snippet?: string
  /** Location in `content` the error refers to, so the UI can select it on click. */
  range?: { start: number; end: number }
}

/**
 * Shape POSTed to a backend on submit. Content stays raw (keeps `{{ }}`) because
 * variable substitution belongs on the send side, per recipient, not at authoring time.
 */
export interface SubmitPayload {
  name: string
  channel: Channel
  language: Language
  title?: string
  content: string
  variables: string[]
  meta: {
    contentLength: number
    createdAt: string
  }
}
