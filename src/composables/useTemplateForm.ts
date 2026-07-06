import { computed, reactive, ref, toRef, watch } from 'vue'
import { buildPayload } from '@/lib/payload'
import { submitTemplate } from '@/lib/submit'
import { validateTemplate } from '@/lib/validation'
import type { SubmitPayload, TemplateForm, ValidationError } from '@/types'

/** Orchestrates the editor: form state, live validation, and the submit round-trip. */
export function useTemplateForm() {
  const form = reactive<TemplateForm>({
    name: '',
    channel: '',
    language: 'en',
    title: '',
    content: '',
  })

  const errors = computed<ValidationError[]>(() => validateTemplate(form))
  const isValid = computed(() => errors.value.length === 0)

  // Only surface errors once the user has engaged: blaming an untouched form is hostile.
  const dirty = ref(false)
  watch(form, () => (dirty.value = true), { deep: true })

  const submitted = ref<SubmitPayload | null>(null)
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
  }
}
