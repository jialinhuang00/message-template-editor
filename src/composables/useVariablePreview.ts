import { computed, type Ref } from 'vue'
import { MOCK_VALUES } from '@/lib/mock'
import { VARIABLE_TOKEN, isSupportedVariable } from '@/lib/variables'
import type { Language } from '@/types'

/**
 * Renders the live preview: supported `{{ variables }}` become mock values for the
 * chosen language. Unknown tokens are left as-is (validation surfaces them separately).
 */
export function useVariablePreview(content: Ref<string>, language: Ref<Language>) {
  const preview = computed(() =>
    content.value.replace(VARIABLE_TOKEN, (match, name: string) =>
      isSupportedVariable(name) ? MOCK_VALUES[language.value][name] : match,
    ),
  )

  return { preview }
}
