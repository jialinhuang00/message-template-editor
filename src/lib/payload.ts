import { extractVariableNames } from '@/lib/variables'
import type { Channel, SubmitPayload, TemplateForm } from '@/types'

/**
 * Builds the payload for a submitted template. Assumes the form has passed validation,
 * so `channel` is set. Content stays raw; `variables` lists the distinct ones used.
 */
export function buildPayload(form: TemplateForm): SubmitPayload {
  const variables = [...new Set(extractVariableNames(form.content))]

  return {
    name: form.name.trim(),
    channel: form.channel as Channel,
    language: form.language,
    title: form.title.trim() || undefined,
    content: form.content,
    variables,
    meta: {
      contentLength: form.content.length,
      createdAt: new Date().toISOString(),
    },
  }
}
