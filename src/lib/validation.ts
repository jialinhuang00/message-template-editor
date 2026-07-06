import type { Channel, TemplateForm, ValidationError } from '@/types'
import { VARIABLE_TOKEN, extractVariableNames, isSupportedVariable } from '@/lib/variables'

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

  // Invalid syntax: strip well-formed tokens, any leftover brace is malformed
  // (e.g. `{{ customer_name }` or `{ customer_name }}`).
  if (/[{}]/.test(content.replace(VARIABLE_TOKEN, ''))) {
    errors.push({ field: 'content', message: 'Invalid variable syntax' })
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
