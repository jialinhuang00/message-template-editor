import type { Channel, TemplateForm, ValidationError } from '@/types'
import { isSupportedVariable } from '@/lib/variables'

export const MAX_CONTENT_LENGTH = 500

/**
 * Channel-specific content rules. Each returns an error message or `null`.
 * Add a channel key to extend validation without touching the core flow.
 */
const CHANNEL_RULES: Partial<Record<Channel, ((content: string) => string | null)[]>> = {
  WhatsApp: [
    (content) =>
      / {6,}/.test(content)
        ? 'WhatsApp message cannot contain more than 5 consecutive spaces'
        : null,
  ],
}

/** How many characters of context to show on each side of an offending snippet. */
const CONTEXT_PAD = 3

/** The offending text plus a little surrounding context, with `…` where it is clipped. */
function contextSnippet(content: string, start: number, end: number): string {
  const from = Math.max(0, start - CONTEXT_PAD)
  const to = Math.min(content.length, end + CONTEXT_PAD)
  const prefix = from > 0 ? '…' : ''
  const suffix = to < content.length ? '…' : ''
  return `${prefix}${content.slice(from, to)}${suffix}`
}

/** A brace cluster: a `{...}` run, or a dangling run of `{` or `}`. */
const BRACE_CLUSTER = /\{+[^{}]*\}+|\{+|\}+/g
/** Exactly `{{ identifier }}` — a well-formed token. */
const VALID_TOKEN = /^\{\{\s*(\w+)\s*\}\}$/
/** Balanced `{{ ... }}` whose inner text is not a bare identifier. */
const DOUBLE_BRACED = /^\{\{\s*(.*?)\s*\}\}$/

/** Turn one brace cluster into an error message, or null if it is a valid token. */
function classifyCluster(raw: string): string | null {
  const token = raw.match(VALID_TOKEN)
  if (token) {
    const name = token[1]
    return isSupportedVariable(name) ? null : `Unknown variable: ${name}`
  }

  const braced = raw.match(DOUBLE_BRACED)
  if (braced) {
    return `Invalid variable name: ${braced[1] || '(empty)'}`
  }

  return 'Invalid variable syntax'
}

/**
 * Every brace-cluster problem in the content, each with the offending snippet and a
 * range so the UI can select it. One cluster yields at most one error, e.g.
 * `Hi {{ customer_name }, order { order_id }} {{ x.y }}` gives three distinct reasons.
 */
function variableErrors(content: string): ValidationError[] {
  const errors: ValidationError[] = []
  for (const m of content.matchAll(BRACE_CLUSTER)) {
    const message = classifyCluster(m[0])
    if (message) {
      errors.push({
        field: 'content',
        message,
        snippet: contextSnippet(content, m.index, m.index + m[0].length),
        range: { start: m.index, end: m.index + m[0].length },
      })
    }
  }
  return errors
}

/**
 * Validate a template against every rule, accumulating all errors (never bails early)
 * so the UI can show the full list at once. Pure: no side effects, no reactivity.
 */
export function validateTemplate(form: TemplateForm): ValidationError[] {
  const errors: ValidationError[] = []
  const { name, channel, content } = form

  if (!name.trim()) errors.push({ field: 'name', message: 'Template name is required' })
  if (!channel) errors.push({ field: 'channel', message: 'Channel is required' })
  if (!content.trim()) errors.push({ field: 'content', message: 'Message content is required' })

  if (content.length > MAX_CONTENT_LENGTH) {
    errors.push({
      field: 'content',
      message: `Message content cannot exceed ${MAX_CONTENT_LENGTH} characters`,
    })
  }

  errors.push(...variableErrors(content))

  // Channel-specific rules.
  if (channel) {
    for (const rule of CHANNEL_RULES[channel] ?? []) {
      const message = rule(content)
      if (message) errors.push({ field: 'content', message })
    }
  }

  return errors
}

export function isValid(form: TemplateForm): boolean {
  return validateTemplate(form).length === 0
}
