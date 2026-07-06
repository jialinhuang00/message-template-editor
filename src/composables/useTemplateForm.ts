import { computed, nextTick, reactive, ref, toRef, watch } from 'vue'
import { buildPayload } from '@/lib/payload'
import { submitTemplate } from '@/lib/submit'
import { useTemplateLibrary } from '@/composables/useTemplateLibrary'
import { validateTemplate } from '@/lib/validation'
import type { StoredTemplate, SubmitPayload, TemplateForm, ValidationError } from '@/types'

/** Orchestrates the editor: form state, live validation, and the submit round-trip. */
export function useTemplateForm() {
  const form = reactive<TemplateForm>({
    name: '',
    channel: 'LINE',
    language: 'en',
    title: '',
    content: '',
  })

  const errors = computed<ValidationError[]>(() => validateTemplate(form))
  const isValid = computed(() => errors.value.length === 0)

  const submitted = ref<SubmitPayload | null>(null)

  const { templates, saveTemplate } = useTemplateLibrary()

  // Set when the form was loaded from a saved template, so re-submitting overwrites
  // that entry instead of appending a duplicate. Null for a brand-new template.
  const currentId = ref<string | null>(null)

  // Suppresses the dirty/submitted watch during programmatic loads and resets, so
  // populating or clearing the form doesn't mark it dirty or drop the payload panel.
  const skipWatch = ref(false)

  // Only surface errors once the user has engaged: blaming an untouched form is hostile.
  // Any edit after a submit also drops the (now stale) payload, so the validation
  // panel takes the slot back.
  const dirty = ref(false)
  watch(
    form,
    () => {
      if (skipWatch.value) return
      dirty.value = true
      submitted.value = null
    },
    { deep: true },
  )

  /** Load a saved template into the form without tripping the dirty watch. */
  function loadTemplate(t: StoredTemplate) {
    skipWatch.value = true
    form.name = t.name
    form.channel = t.channel
    form.language = t.language
    form.title = t.title ?? ''
    form.content = t.content
    currentId.value = t.id
    dirty.value = false
    submitted.value = null
    nextTick(() => (skipWatch.value = false))
  }

  /** Reset to a blank form for the next entry; keeps `submitted` so the panel stays. */
  function resetForm() {
    skipWatch.value = true
    form.name = ''
    form.channel = 'LINE'
    form.language = 'en'
    form.title = ''
    form.content = ''
    currentId.value = null
    dirty.value = false
    nextTick(() => (skipWatch.value = false))
  }

  const isSubmitting = ref(false)
  const submitError = ref<string | null>(null)

  async function submit() {
    dirty.value = true
    submitted.value = null
    submitError.value = null
    if (!isValid.value) return

    isSubmitting.value = true
    try {
      submitted.value = await submitTemplate(buildPayload(form))
      saveTemplate(submitted.value, currentId.value)
      resetForm()
    } catch (e) {
      submitError.value = e instanceof Error ? e.message : 'Submission failed'
    } finally {
      isSubmitting.value = false
    }
  }

  return {
    form,
    content: toRef(form, 'content'),
    language: toRef(form, 'language'),
    errors,
    isValid,
    dirty,
    submitted,
    isSubmitting,
    submitError,
    submit,
    templates,
    loadTemplate,
  }
}
