<script setup lang="ts">
import { computed } from 'vue'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import type { Channel } from '@/types'

const props = defineProps<{
  channel: Channel | ''
  title: string
  preview: string
  isValid: boolean
  hasContent: boolean
}>()

const emit = defineEmits<{ focusInvalid: [] }>()

/** Stylised (not pixel-accurate) per-channel colours, so the preview reads as that app. */
const CHANNEL_THEME: Record<Channel, { bar: string; bubble: string; bubbleText: string; wall: string }> = {
  WhatsApp: { bar: '#075e54', bubble: '#dcf8c6', bubbleText: '#111827', wall: '#e5ddd5' },
  LINE: { bar: '#06c755', bubble: '#ffffff', bubbleText: '#111827', wall: '#8ca6c8' },
  Messenger: { bar: '#0084ff', bubble: '#e4e6eb', bubbleText: '#111827', wall: '#eef0f3' },
}
const NEUTRAL = { bar: '#6b7280', bubble: '#ffffff', bubbleText: '#111827', wall: '#e5e7eb' }

const theme = computed(() => (props.channel ? CHANNEL_THEME[props.channel] : NEUTRAL))
const initial = computed(() => (props.channel ? props.channel[0] : '?'))
</script>

<template>
  <Card>
    <CardHeader>
      <div class="flex items-center justify-between">
        <CardTitle>Preview</CardTitle>
        <span
          v-if="isValid"
          class="rounded-full bg-green-100 px-2 py-0.5 text-xs font-medium text-green-700 dark:bg-green-950 dark:text-green-400"
        >
          Valid
        </span>
        <button
          v-else
          type="button"
          class="rounded-full bg-destructive/10 px-2 py-0.5 text-xs font-medium text-destructive hover:bg-destructive/20"
          title="Jump to the first field that needs fixing"
          @click="emit('focusInvalid')"
        >
          Invalid
        </button>
      </div>
    </CardHeader>

    <CardContent>
      <div class="overflow-hidden rounded-xl" :style="{ backgroundColor: theme.wall }">
        <div
          class="flex items-center gap-2 px-3 py-2 text-sm font-semibold text-white"
          :style="{ backgroundColor: theme.bar }"
        >
          <span class="grid h-7 w-7 place-items-center rounded-full bg-white/25 text-xs">
            {{ initial }}
          </span>
          {{ channel || 'No channel selected' }}
        </div>

        <div class="flex min-h-[180px] flex-col p-3">
          <div
            v-if="hasContent"
            class="max-w-[85%] rounded-lg px-3 py-2 text-sm shadow-sm"
            :style="{ backgroundColor: theme.bubble, color: theme.bubbleText }"
          >
            <span v-if="title" class="mb-1 block font-bold">{{ title }}</span>
            <span class="whitespace-pre-wrap break-words">{{ preview }}</span>
          </div>
          <p v-else class="m-auto text-sm text-black/45 italic">
            Your message preview will appear here.
          </p>
        </div>
      </div>
    </CardContent>
  </Card>
</template>
