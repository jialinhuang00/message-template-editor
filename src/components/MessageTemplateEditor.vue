<script setup lang="ts">
import { computed, ref, watch } from 'vue'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import TemplateBasicForm from './TemplateBasicForm.vue'
import MessageContentEditor from './MessageContentEditor.vue'
import MessagePreviewCard from './MessagePreviewCard.vue'
import ValidationErrorList from './ValidationErrorList.vue'
import PayloadPreview from './PayloadPreview.vue'
import { useTemplateForm } from '@/composables/useTemplateForm'
import { useVariablePreview } from '@/composables/useVariablePreview'
import { useChatSounds } from '@/composables/useChatSounds'

const { form, content, language, errors, isValid, dirty, submitted, isSubmitting, submitError, submit } =
  useTemplateForm()
const { preview } = useVariablePreview(content, language)
const { muted, messageSent } = useChatSounds()

const hasContent = computed(() => form.content.trim().length > 0)

// Show a "composing" animation while the author is actively editing the content,
// then settle shortly after they pause.
const isTyping = ref(false)
let typingTimer: ReturnType<typeof setTimeout> | undefined
watch(
  () => form.content,
  () => {
    isTyping.value = true
    clearTimeout(typingTimer)
    typingTimer = setTimeout(() => {
      isTyping.value = false
      // 700ms after the last keystroke the message "sends": the caret drops, the
      // timestamp appears, and one send sound plays — consistent across channels.
      if (form.content.trim()) messageSent()
    }, 700)
  },
)

const editorRef = ref<InstanceType<typeof MessageContentEditor> | null>(null)

function focusField(id: string) {
  const el = document.getElementById(id)
  el?.focus()
  el?.scrollIntoView({ block: 'center', behavior: 'smooth' })
}

/** Clicking an error jumps to its field; brace errors also select the offending text. */
function onSelectError(error: (typeof errors.value)[number]) {
  if (error.field === 'content' && error.range) {
    editorRef.value?.selectRange(error.range.start, error.range.end)
    return
  }
  focusField(error.field)
}

/** Jump to the first field that fails validation (fields share their name with their id). */
function focusFirstInvalid() {
  if (errors.value[0]) focusField(errors.value[0].field)
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
      <Card class="min-w-0">
        <CardContent class="space-y-6 pt-6">
          <TemplateBasicForm
            v-model:name="form.name"
            v-model:channel="form.channel"
            v-model:language="form.language"
            v-model:title="form.title"
          />
          <MessageContentEditor
            ref="editorRef"
            v-model="form.content"
            :language="form.language"
          />
        </CardContent>
      </Card>

      <!-- Preview + validation + payload (sticky) -->
      <div class="min-w-0 space-y-6 md:sticky md:top-4">
        <MessagePreviewCard
          :channel="form.channel"
          :title="form.title"
          :preview="preview"
          :language="form.language"
          :is-valid="isValid"
          :has-content="hasContent"
          :typing="isTyping"
          :show-status="dirty"
          v-model:muted="muted"
          @focus-invalid="focusFirstInvalid"
          @focus-channel="focusField('channel')"
        />

        <!-- A successful submit implies validation passed, so the payload takes
             the validation slot; editing again clears it and validation returns. -->
        <PayloadPreview v-if="submitted" :payload="submitted" />
        <Card v-else>
          <CardHeader>
            <CardTitle>
              Validation
              <span v-if="dirty && errors.length" class="ml-1 text-sm font-normal text-destructive">
                · {{ errors.length }} {{ errors.length > 1 ? 'issues' : 'issue' }}
              </span>
            </CardTitle>
          </CardHeader>
          <CardContent>
            <p v-if="!dirty" class="text-sm text-muted-foreground">
              Fill in the form to validate.
            </p>
            <ValidationErrorList
              v-else-if="errors.length"
              :errors="errors"
              @select="onSelectError"
            />
            <p v-else class="text-sm font-medium text-green-700 dark:text-green-400">
              All checks pass — ready to submit.
            </p>
          </CardContent>
        </Card>

        <p v-if="submitError" class="text-sm text-destructive">{{ submitError }}</p>
      </div>
    </div>
  </div>
</template>
