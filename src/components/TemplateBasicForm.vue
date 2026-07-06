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

const name = defineModel<string>('name', { required: true })
const channel = defineModel<Channel | ''>('channel', { required: true })
const language = defineModel<Language>('language', { required: true })
const title = defineModel<string>('title', { required: true })
</script>

<template>
  <div class="space-y-4">
    <div class="space-y-2">
      <Label for="name">Template Name <span class="text-destructive">*</span></Label>
      <Input id="name" v-model="name" placeholder="Order ready notification" />
    </div>

    <div class="grid grid-cols-2 gap-4">
      <div class="space-y-2">
        <Label for="channel">Channel <span class="text-destructive">*</span></Label>
        <Select v-model="channel">
          <SelectTrigger id="channel" class="w-full">
            <SelectValue placeholder="Select a channel" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem v-for="c in CHANNELS" :key="c" :value="c">{{ c }}</SelectItem>
          </SelectContent>
        </Select>
      </div>

      <div class="space-y-2">
        <Label for="language">Language</Label>
        <Select v-model="language">
          <SelectTrigger id="language" class="w-full">
            <SelectValue />
          </SelectTrigger>
          <SelectContent>
            <SelectItem v-for="l in LANGUAGES" :key="l" :value="l">{{ l }}</SelectItem>
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
