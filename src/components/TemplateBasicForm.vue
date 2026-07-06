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
        <div id="channel" tabindex="-1" class="grid grid-cols-3 gap-2 outline-none">
          <button
            v-for="c in CHANNELS"
            :key="c"
            type="button"
            class="flex flex-col items-center justify-center gap-1 rounded-md border px-1 py-2 text-xs transition-colors"
            :class="
              channel === c
                ? 'border-primary bg-accent font-medium text-accent-foreground'
                : 'border-border text-muted-foreground hover:bg-accent/50'
            "
            @click="channel = c"
          >
            <component :is="CHANNEL_ICON[c]" class="h-4 w-4" />
            {{ c }}
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
