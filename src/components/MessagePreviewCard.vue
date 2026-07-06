<script setup lang="ts">
import { computed, onMounted, ref } from 'vue'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import TypingStickman from './TypingStickman.vue'
import { CHANNEL_ICON } from '@/lib/channelIcons'
import type { Channel } from '@/types'

const props = defineProps<{
  channel: Channel | ''
  title: string
  preview: string
  isValid: boolean
  hasContent: boolean
  typing: boolean
  showStatus: boolean
}>()

const emit = defineEmits<{ focusInvalid: []; focusChannel: [] }>()

const muted = defineModel<boolean>('muted', { required: true })

/** The business sending the message (this is what the customer receives). */
const SENDER = 'Omnichat Store'

/** Send time shown on the bubble — the current wall-clock time (HH:MM). */
const sentAt = ref('')
onMounted(() => {
  const d = new Date()
  sentAt.value = `${String(d.getHours()).padStart(2, '0')}:${String(d.getMinutes()).padStart(2, '0')}`
})

type ChannelStyle = {
  bar: string
  bubble: string
  bubbleText: string
  wall: string
  /** Where the sender avatar sits next to the message. */
  avatar: 'header' | 'beside'
  /** How the sender name renders above the bubble. */
  name: 'brand' | 'muted' | 'none'
  /** How a typing indicator shows while the author edits. */
  typing: 'subtitle' | 'typewriter' | 'none'
  /** Where the per-message timestamp sits (Messenger shows none). */
  time: 'inside' | 'beside' | 'none'
}

/** Stylised (not pixel-accurate) per-channel look, matched to each app's real chat. */
const CHANNEL_THEME: Record<Channel, ChannelStyle> = {
  WhatsApp: { bar: '#075e54', bubble: '#ffffff', bubbleText: '#111827', wall: '#e5ddd5', avatar: 'header', name: 'brand', typing: 'subtitle', time: 'inside' },
  LINE: { bar: '#06c755', bubble: '#ffffff', bubbleText: '#111827', wall: '#8ca6c8', avatar: 'beside', name: 'muted', typing: 'none', time: 'beside' },
  Messenger: { bar: '#0084ff', bubble: '#e4e6eb', bubbleText: '#111827', wall: '#ffffff', avatar: 'beside', name: 'none', typing: 'typewriter', time: 'none' },
}
const NEUTRAL: ChannelStyle = { bar: '#6b7280', bubble: '#ffffff', bubbleText: '#111827', wall: '#e5e7eb', avatar: 'header', name: 'none', typing: 'none', time: 'none' }

const theme = computed(() => (props.channel ? CHANNEL_THEME[props.channel] : NEUTRAL))
const channelIcon = computed(() => (props.channel ? CHANNEL_ICON[props.channel] : null))
// While composing, Messenger shows a blinking caret; the timestamp only appears
// once the message has settled (typing stopped).
const showCaret = computed(() => props.typing && theme.value.typing === 'typewriter')
const showTime = computed(() => !props.typing)
</script>

<template>
  <Card>
    <CardHeader>
      <div class="flex items-center justify-between">
        <CardTitle>Preview</CardTitle>
        <div class="flex items-center gap-2">
          <button
            type="button"
            class="text-muted-foreground transition-colors hover:text-foreground"
            :title="muted ? 'Unmute preview sounds' : 'Mute preview sounds'"
            :aria-label="muted ? 'Unmute preview sounds' : 'Mute preview sounds'"
            @click="muted = !muted"
          >
            <svg
              xmlns="http://www.w3.org/2000/svg"
              viewBox="0 0 24 24"
              fill="none"
              stroke="currentColor"
              stroke-width="2"
              stroke-linecap="round"
              stroke-linejoin="round"
              class="h-4 w-4"
            >
              <path d="M11 5 6 9H2v6h4l5 4V5z" />
              <template v-if="muted">
                <line x1="23" y1="9" x2="17" y2="15" />
                <line x1="17" y1="9" x2="23" y2="15" />
              </template>
              <template v-else>
                <path d="M15.54 8.46a5 5 0 0 1 0 7.07" />
                <path d="M19.07 4.93a10 10 0 0 1 0 14.14" />
              </template>
            </svg>
          </button>
          <span
            v-if="!showStatus"
          class="rounded-full bg-muted px-2 py-0.5 text-xs font-medium text-muted-foreground"
        >
          Draft
        </span>
        <span
          v-else-if="isValid"
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
      </div>
    </CardHeader>

    <CardContent>
      <div
        class="overflow-hidden rounded-xl shadow-md ring-1 ring-black/10 transition-colors duration-300"
        :style="{ backgroundColor: theme.wall }"
      >
        <!-- top bar -->
        <div
          v-if="channel"
          class="flex items-center gap-2 px-3 py-2 text-white transition-colors duration-300"
          :style="{ backgroundColor: theme.bar }"
        >
          <span class="grid h-8 w-8 shrink-0 place-items-center rounded-full bg-white/25">
            <component :is="channelIcon" class="h-4 w-4" />
          </span>
          <div class="leading-tight">
            <div class="text-sm font-semibold">{{ SENDER }}</div>
            <div class="text-[11px] text-white/70">
              {{ typing && theme.typing === 'subtitle' ? 'typing…' : channel }}
            </div>
          </div>
        </div>
        <button
          v-else
          type="button"
          class="flex w-full items-center gap-2 px-3 py-2 text-left text-white transition-colors duration-300 hover:brightness-95"
          :style="{ backgroundColor: theme.bar }"
          @click="emit('focusChannel')"
        >
          <span class="grid h-8 w-8 shrink-0 place-items-center rounded-full bg-white/25 text-sm font-semibold">?</span>
          <div class="leading-tight">
            <div class="text-sm font-semibold">No channel selected</div>
            <div class="text-[11px] text-white/70">Click to choose</div>
          </div>
        </button>

        <!-- message -->
        <div class="flex min-h-[180px] flex-col gap-2 p-3">
          <!-- One persistent bubble: the text span is the same element throughout
               and updates live as the author types. Only the trailing caret and the
               timestamp toggle, so settling never re-mounts or re-flashes content. -->
          <Transition name="msg">
            <div v-if="hasContent" class="flex items-start gap-2">
              <span
                v-if="theme.avatar === 'beside'"
                class="grid h-8 w-8 shrink-0 place-items-center rounded-full text-white shadow-sm"
                :style="{ backgroundColor: theme.bar }"
              >
                <component :is="channelIcon" class="h-4 w-4" />
              </span>
              <div class="max-w-[80%]">
                <div
                  v-if="theme.name === 'brand'"
                  class="mb-0.5 ml-1 text-xs font-semibold"
                  :style="{ color: theme.bar }"
                >
                  {{ SENDER }}
                </div>
                <div v-else-if="theme.name === 'muted'" class="mb-0.5 ml-1 text-[11px] text-black/45">
                  {{ SENDER }}
                </div>
                <div class="flex items-end gap-1">
                  <div
                    class="rounded-lg px-3 py-2 text-sm shadow-sm transition-colors duration-300"
                    :style="{ backgroundColor: theme.bubble, color: theme.bubbleText }"
                  >
                    <span v-if="title" class="mb-1 block font-bold">{{ title }}</span>
                    <TypingStickman :text="preview" :caret="showCaret" />
                    <span
                      v-if="showTime && theme.time === 'inside'"
                      class="mt-1 block text-right text-[10px] text-black/40"
                    >
                      {{ sentAt }}
                    </span>
                  </div>
                  <span
                    v-if="showTime && theme.time === 'beside'"
                    class="shrink-0 pb-0.5 text-[10px] text-white/85"
                  >
                    {{ sentAt }}
                  </span>
                </div>
              </div>
            </div>
          </Transition>

          <p v-if="!hasContent" class="m-auto text-sm text-black/45 italic">
            Your message preview will appear here.
          </p>
        </div>
      </div>
    </CardContent>
  </Card>
</template>

<style scoped>
.msg-enter-active {
  transition:
    opacity 0.25s ease,
    transform 0.25s ease;
}
.msg-enter-from {
  opacity: 0;
  transform: translateY(6px) scale(0.98);
}
</style>
