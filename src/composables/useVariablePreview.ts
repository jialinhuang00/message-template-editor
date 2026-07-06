import { computed, type Ref } from 'vue'
import { LOCALES } from '@/i18n'
import { VARIABLE_TOKEN, isSupportedVariable } from '@/lib/variables'
import type { Language } from '@/types'

/**
 * Renders the live preview: supported `{{ variables }}` become mock values for the
 * chosen language. Unknown tokens are left as-is (validation surfaces them separately).
 */
export function useVariablePreview(content: Ref<string>, language: Ref<Language>) {
  const preview = computed(() =>
    content.value.replace(VARIABLE_TOKEN, (match, name: string) =>
      isSupportedVariable(name) ? LOCALES[language.value].mock[name] : match,
    ),
  )

  return { preview }
}
