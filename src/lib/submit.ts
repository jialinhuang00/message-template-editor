import type { SubmitPayload } from '@/types'

/**
 * Stand-in for a backend call. No real network: resolves with the echoed payload
 * after a short delay so the UI can show a submitting state. A real client would
 * POST this and could reject, which `useTemplateForm` already handles.
 */
export function submitTemplate(payload: SubmitPayload): Promise<SubmitPayload> {
  return new Promise((resolve) => {
    setTimeout(() => resolve(payload), 400)
  })
}
