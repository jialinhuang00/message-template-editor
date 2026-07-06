<script setup lang="ts">
import { computed, nextTick, ref } from 'vue'
import { Label } from '@/components/ui/label'
import { Textarea } from '@/components/ui/textarea'
import VariableInsertToolbar from './VariableInsertToolbar.vue'
import { MAX_CONTENT_LENGTH } from '@/lib/validation'

const EXAMPLE_CONTENT = 'Hi {{ customer_name }}, your order {{ order_id }} is ready.'

const content = defineModel<string>({ required: true })

const textareaRef = ref<InstanceType<typeof Textarea> | null>(null)
const overLimit = computed(() => content.value.length > MAX_CONTENT_LENGTH)

function textareaEl(): HTMLTextAreaElement | undefined {
  return textareaRef.value?.$el as HTMLTextAreaElement | undefined
}

function setCaret(position: number) {
  nextTick(() => {
    const el = textareaEl()
    el?.focus()
    el?.setSelectionRange(position, position)
  })
}

/** Insert a token at the caret (or replacing the selection), then restore the caret. */
function insertVariable(name: string) {
  const token = `{{ ${name} }}`
  const el = textareaEl()
  const value = content.value

  if (!el) {
    content.value = value + token
    return
  }

  const start = el.selectionStart ?? value.length
  const end = el.selectionEnd ?? value.length
  content.value = value.slice(0, start) + token + value.slice(end)
  setCaret(start + token.length)
}

/** Tab on empty content accepts the example instead of moving focus (iykyk). */
function onKeydown(e: KeyboardEvent) {
  if (e.key === 'Tab' && !e.shiftKey && content.value.length === 0) {
    e.preventDefault()
    content.value = EXAMPLE_CONTENT
    setCaret(EXAMPLE_CONTENT.length)
  }
}

/** Focus the textarea and select a character range (driven by clickable errors). */
function selectRange(start: number, end: number) {
  const el = textareaEl()
  if (!el) return
  el.focus()
  el.setSelectionRange(start, end)
}

defineExpose({ selectRange })
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
      :placeholder="EXAMPLE_CONTENT"
      @keydown="onKeydown"
    />
    <p class="text-xs text-muted-foreground">Tip: press Tab in the empty box to load an example.</p>
  </div>
</template>
