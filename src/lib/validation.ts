import type { Channel, TemplateForm, ValidationError } from '@/types'
import { VARIABLE_TOKEN, extractVariableNames, isSupportedVariable } from '@/lib/variables'

export const MAX_CONTENT_LENGTH = 500

/** How many characters of surrounding context to show around a malformed region. */
const SYNTAX_CONTEXT_PAD = 8

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

/** Character ranges covered by well-formed `{{ variable }}` tokens. */
function tokenRanges(content: string): [number, number][] {
  return [...content.matchAll(VARIABLE_TOKEN)].map((m) => [m.index, m.index + m[0].length])
}

/**
 * Locate malformed brace regions: braces not part of a well-formed token, grouped into
 * regions and split wherever a well-formed token sits between them. So
 * `{{ order_id }. {{ customer_name }}{ customer_name }` yields two regions:
 * `{{ order_id }` and `{ customer_name }`.
 */
function malformedRanges(content: string): { start: number; end: number }[] {
  const ranges = tokenRanges(content)
  const inToken = (i: number) => ranges.some(([s, e]) => i >= s && i < e)
  const tokenBetween = (a: number, b: number) => ranges.some(([s, e]) => s > a && e <= b)

  const strays: number[] = []
  for (let i = 0; i < content.length; i++) {
    const ch = content[i]
    if ((ch === '{' || ch === '}') && !inToken(i)) strays.push(i)
  }

  const regions: { start: number; end: number }[] = []
  let group: number[] = []
  const flush = () => {
    if (group.length) regions.push({ start: group[0], end: group[group.length - 1] + 1 })
    group = []
  }

  for (const idx of strays) {
    if (group.length && tokenBetween(group[group.length - 1], idx)) flush()
    group.push(idx)
  }
  flush()

  return regions
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

  // Unknown variables: well-formed tokens whose name is not supported.
  for (const varName of extractVariableNames(content)) {
    if (!isSupportedVariable(varName)) {
      errors.push({ field: 'content', message: `Unknown variable: ${varName}` })
    }
  }

  // Invalid syntax: one error per malformed region, with a located context snippet
  // (e.g. `{{ customer_name }` or `{ customer_name }}`).
  for (const { start, end } of malformedRanges(content)) {
    const from = Math.max(0, start - SYNTAX_CONTEXT_PAD)
    const to = Math.min(content.length, end + SYNTAX_CONTEXT_PAD)
    const snippet = content.slice(from, to).trim()
    errors.push({
      field: 'content',
      message: `Invalid variable syntax near "${snippet}"`,
      range: { start, end },
    })
  }

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
