<script setup lang="ts">
import { computed, nextTick, ref } from 'vue'
import { Label } from '@/components/ui/label'
import { Textarea } from '@/components/ui/textarea'
import VariableInsertToolbar from './VariableInsertToolbar.vue'
import { MAX_CONTENT_LENGTH } from '@/lib/validation'

const content = defineModel<string>({ required: true })

const textareaRef = ref<InstanceType<typeof Textarea> | null>(null)
const overLimit = computed(() => content.value.length > MAX_CONTENT_LENGTH)

/** Insert a token at the caret (or replacing the selection), then restore the caret. */
function insertVariable(name: string) {
  const token = `{{ ${name} }}`
  const el = textareaRef.value?.$el as HTMLTextAreaElement | undefined
  const value = content.value

  if (!el) {
    content.value = value + token
    return
  }

  const start = el.selectionStart ?? value.length
  const end = el.selectionEnd ?? value.length
  content.value = value.slice(0, start) + token + value.slice(end)

  nextTick(() => {
    const caret = start + token.length
    el.focus()
    el.setSelectionRange(caret, caret)
  })
}
</script>

<template>
  <div class="space-y-2">
    <div class="flex items-center justify-between">
      <Label for="content">Message Content</Label>
      <span class="text-xs" :class="overLimit ? 'text-destructive' : 'text-muted-foreground'">
        {{ content.length }} / {{ MAX_CONTENT_LENGTH }}
      </span>
    </div>

    <VariableInsertToolbar @insert="insertVariable" />

    <Textarea
      id="content"
      ref="textareaRef"
      v-model="content"
      rows="6"
      class="font-mono"
      placeholder="Hi {{ customer_name }}, your order {{ order_id }} is ready."
    />
  </div>
</template>
