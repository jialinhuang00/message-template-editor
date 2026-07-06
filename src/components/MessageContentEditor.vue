<script setup lang="ts">
import { computed, nextTick, ref } from 'vue'
import { Label } from '@/components/ui/label'
import { Textarea } from '@/components/ui/textarea'
import VariableInsertToolbar from './VariableInsertToolbar.vue'
import { MAX_CONTENT_LENGTH } from '@/lib/validation'
import { LOCALES } from '@/i18n'
import type { Language } from '@/types'

const props = defineProps<{ language: Language }>()
const content = defineModel<string>({ required: true })

const textareaRef = ref<InstanceType<typeof Textarea> | null>(null)
const overLimit = computed(() => content.value.length > MAX_CONTENT_LENGTH)
const example = computed(() => LOCALES[props.language].example)

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
  const end = el?.selectionEnd ?? value.length
  const start = el?.selectionStart ?? value.length

  // Separate the token from a preceding word with a space, but not at the start
  // of the line or when whitespace is already there.
  const before = value.slice(0, start)
  const insert = (before && !/\s$/.test(before) ? ' ' : '') + token

  content.value = before + insert + value.slice(end)
  setCaret(start + insert.length)
}

/** Tab on empty content accepts the example instead of moving focus (iykyk). */
function onKeydown(e: KeyboardEvent) {
  if (e.key === 'Tab' && !e.shiftKey && content.value.length === 0) {
    e.preventDefault()
    content.value = example.value
    setCaret(example.value.length)
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
      <Label for="content">Message Content <span class="text-destructive">*</span></Label>
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
      :placeholder="example"
      @keydown="onKeydown"
    />
    <p class="flex items-center gap-1 text-xs text-muted-foreground">
      Tip: press
      <kbd
        class="rounded border border-border bg-muted px-1.5 py-0.5 font-mono text-[11px] font-medium text-foreground shadow-sm"
        >Tab</kbd
      >
      in the empty box to load an example.
    </p>
  </div>
</template>
