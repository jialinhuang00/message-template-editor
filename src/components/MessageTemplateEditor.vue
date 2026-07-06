<script setup lang="ts">
import { computed, ref } from 'vue'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import TemplateBasicForm from './TemplateBasicForm.vue'
import MessageContentEditor from './MessageContentEditor.vue'
import MessagePreviewCard from './MessagePreviewCard.vue'
import ValidationErrorList from './ValidationErrorList.vue'
import PayloadPreview from './PayloadPreview.vue'
import { useTemplateForm } from '@/composables/useTemplateForm'
import { useVariablePreview } from '@/composables/useVariablePreview'

const { form, content, language, errors, isValid, submitted, isSubmitting, submitError, submit } =
  useTemplateForm()
const { preview } = useVariablePreview(content, language)

const hasContent = computed(() => form.content.trim().length > 0)

const editorRef = ref<InstanceType<typeof MessageContentEditor> | null>(null)
function selectContentRange(range: { start: number; end: number }) {
  editorRef.value?.selectRange(range.start, range.end)
}

/** Jump to the first field that fails validation (fields share their name with their id). */
function focusFirstInvalid() {
  const first = errors.value[0]
  if (!first) return
  const el = document.getElementById(first.field)
  el?.focus()
  el?.scrollIntoView({ block: 'center', behavior: 'smooth' })
}
</script>

<template>
  <div class="space-y-6">
    <header class="flex flex-wrap items-start justify-between gap-4">
      <div>
        <h1 class="text-2xl font-semibold">Message Template Editor</h1>
        <p class="text-sm text-muted-foreground">
          Create and preview a message template before submission.
        </p>
      </div>
      <Button :disabled="isSubmitting" @click="submit">
        {{ isSubmitting ? 'Submitting…' : 'Submit Template' }}
      </Button>
    </header>

    <div class="grid items-start gap-6 md:grid-cols-[1.15fr_0.85fr]">
      <!-- Editor -->
      <Card>
        <CardContent class="space-y-6 pt-6">
          <TemplateBasicForm
            v-model:name="form.name"
            v-model:channel="form.channel"
            v-model:language="form.language"
            v-model:title="form.title"
          />
          <MessageContentEditor ref="editorRef" v-model="form.content" :language="form.language" />
        </CardContent>
      </Card>

      <!-- Preview + validation + payload (sticky) -->
      <div class="space-y-6 md:sticky md:top-4">
        <MessagePreviewCard
          :channel="form.channel"
          :title="form.title"
          :preview="preview"
          :is-valid="isValid"
          :has-content="hasContent"
          @focus-invalid="focusFirstInvalid"
        />

        <Card>
          <CardHeader>
            <CardTitle>
              Validation
              <span v-if="errors.length" class="ml-1 text-sm font-normal text-destructive">
                · {{ errors.length }} {{ errors.length > 1 ? 'issues' : 'issue' }}
              </span>
            </CardTitle>
          </CardHeader>
          <CardContent>
            <ValidationErrorList v-if="errors.length" :errors="errors" @select="selectContentRange" />
            <p v-else class="text-sm font-medium text-green-700 dark:text-green-400">
              All checks pass — ready to submit.
            </p>
          </CardContent>
        </Card>

        <p v-if="submitError" class="text-sm text-destructive">{{ submitError }}</p>
        <PayloadPreview :payload="submitted" />
      </div>
    </div>
  </div>
</template>
