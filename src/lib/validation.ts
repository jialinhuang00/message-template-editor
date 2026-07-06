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

/**
 * The offending text plus a little surrounding context, with `…` where it is clipped.
 * Context stops at any adjacent brace so the snippet never bleeds into a neighbouring
 * token — otherwise `{{ customer_name } {{ order_id }}` would show `{{ customer_name } {{…`
 * and read as if the error spanned two tokens.
 */
function contextSnippet(content: string, start: number, end: number): string {
  let from = start
  for (let i = 0; i < CONTEXT_PAD && from > 0 && !isBrace(content[from - 1]); i++) from--
  let to = end
  for (let i = 0; i < CONTEXT_PAD && to < content.length && !isBrace(content[to]); i++) to++
  const prefix = from > 0 ? '…' : ''
  const suffix = to < content.length ? '…' : ''
  return `${prefix}${content.slice(from, to)}${suffix}`
}

function isBrace(ch: string): boolean {
  return ch === '{' || ch === '}'
}

/** A brace cluster: a `{...}` run, or a dangling run of `{` or `}`. */
const BRACE_CLUSTER = /\{+[^{}]*\}+|\{+|\}+/g

/**
 * Turn one brace cluster into an error, or null if it is a valid token.
 * `withContext` is true only when the message alone does not identify the offender
 * (generic syntax errors), so the UI shows a locating snippet just for those.
 *
 * Brace count is checked first: anything other than exactly `{{ … }}` is a syntax
 * problem, which takes priority over whatever the inner text looks like — so
 * `{{{ customer_name }}}` reads as bad syntax, not a variable named `{ customer_name`.
 */
function classifyCluster(raw: string): { message: string; withContext: boolean } | null {
  const open = raw.match(/^\{+/)?.[0].length ?? 0
  const close = raw.match(/\}+$/)?.[0].length ?? 0
  if (open !== 2 || close !== 2) {
    return { message: 'Invalid variable syntax', withContext: true }
  }

  const name = raw.slice(open, raw.length - close).trim()
  if (/^\w+$/.test(name)) {
    if (isSupportedVariable(name)) return null
    return { message: `Unknown variable: ${name}`, withContext: false }
  }

  return { message: `Invalid variable name: ${name || '(empty)'}`, withContext: false }
}

/**
 * Every brace-cluster problem in the content, each with the offending snippet and a
 * range so the UI can select it. One cluster yields at most one error, e.g.
 * `Hi {{ customer_name }, order { order_id }} {{ x.y }}` gives three distinct reasons.
 */
function variableErrors(content: string): ValidationError[] {
  const errors: ValidationError[] = []
  for (const m of content.matchAll(BRACE_CLUSTER)) {
    const result = classifyCluster(m[0])
    if (result) {
      const range = { start: m.index, end: m.index + m[0].length }
      errors.push({
        field: 'content',
        message: result.message,
        snippet: result.withContext ? contextSnippet(content, range.start, range.end) : undefined,
        range,
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
