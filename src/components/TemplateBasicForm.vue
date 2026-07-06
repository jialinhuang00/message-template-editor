<script setup lang="ts">
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select'
import { CHANNELS, LANGUAGES, type Channel, type Language } from '@/types'
import { CHANNEL_ICON } from '@/lib/channelIcons'

const name = defineModel<string>('name', { required: true })
const channel = defineModel<Channel | ''>('channel', { required: true })
const language = defineModel<Language>('language', { required: true })
const title = defineModel<string>('title', { required: true })

const LANGUAGE_LABEL: Record<Language, string> = {
  'zh-TW': '繁體中文',
  en: 'English',
  ja: '日本語',
}

const CHANNEL_COLOR: Record<Channel, string> = {
  WhatsApp: '#25D366',
  LINE: '#06C755',
  Messenger: '#0084FF',
}
</script>

<template>
  <div class="space-y-4">
    <div class="space-y-2">
      <Label for="name">Template Name <span class="text-destructive">*</span></Label>
      <Input id="name" v-model="name" placeholder="Order ready notification" />
    </div>

    <div class="grid grid-cols-2 gap-4">
      <div class="space-y-2">
        <Label>Channel <span class="text-destructive">*</span></Label>
        <div id="channel" tabindex="-1" class="flex gap-1 outline-none">
          <button
            v-for="c in CHANNELS"
            :key="c"
            type="button"
            :title="c"
            :aria-label="c"
            class="rounded-md p-1 transition-all"
            :class="channel === c ? 'opacity-100' : 'text-muted-foreground opacity-40 hover:opacity-70'"
            :style="channel === c ? { color: CHANNEL_COLOR[c] } : {}"
            @click="channel = c"
          >
            <component :is="CHANNEL_ICON[c]" class="h-5 w-5" />
          </button>
        </div>
      </div>

      <div class="space-y-2">
        <Label for="language">Language</Label>
        <Select v-model="language">
          <SelectTrigger id="language" class="w-full">
            <SelectValue />
          </SelectTrigger>
          <SelectContent>
            <SelectItem v-for="l in LANGUAGES" :key="l" :value="l">
              {{ LANGUAGE_LABEL[l] }}
            </SelectItem>
          </SelectContent>
        </Select>
      </div>
    </div>

    <div class="space-y-2">
      <Label for="title">Message Title</Label>
      <Input id="title" v-model="title" placeholder="Optional" />
    </div>
  </div>
</template>
