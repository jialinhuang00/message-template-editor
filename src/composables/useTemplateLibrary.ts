import { ref, watch } from 'vue'
import type { StoredTemplate, SubmitPayload } from '@/types'

const STORAGE_KEY = 'mte:templates'

/** Load once at module init; a bad or missing entry falls back to an empty library. */
function load(): StoredTemplate[] {
  try {
    const raw = localStorage.getItem(STORAGE_KEY)
    return raw ? (JSON.parse(raw) as StoredTemplate[]) : []
  } catch {
    return []
  }
}

// Module-scope singleton: the container and any selector share one list.
const templates = ref<StoredTemplate[]>(load())

watch(
  templates,
  () => localStorage.setItem(STORAGE_KEY, JSON.stringify(templates.value)),
  { deep: true },
)

/**
 * Save a submitted payload. With a known id it overwrites that entry in place;
 * otherwise it appends a fresh one. Returns the id it was stored under.
 */
function saveTemplate(payload: SubmitPayload, id: string | null): string {
  if (id) {
    const i = templates.value.findIndex((t) => t.id === id)
    if (i !== -1) {
      templates.value[i] = { ...payload, id }
      return id
    }
  }
  const newId = crypto.randomUUID()
  templates.value.push({ ...payload, id: newId })
  return newId
}

export function useTemplateLibrary() {
  return { templates, saveTemplate }
}
