<script setup lang="ts">
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import type { Channel } from '@/types'

defineProps<{
  channel: Channel | ''
  title: string
  preview: string
  isValid: boolean
  hasContent: boolean
}>()
</script>

<template>
  <Card>
    <CardHeader>
      <div class="flex items-center justify-between">
        <CardTitle>Preview</CardTitle>
        <span
          class="rounded-full px-2 py-0.5 text-xs font-medium"
          :class="
            isValid
              ? 'bg-green-100 text-green-700 dark:bg-green-950 dark:text-green-400'
              : 'bg-destructive/10 text-destructive'
          "
        >
          {{ isValid ? 'Valid' : 'Invalid' }}
        </span>
      </div>
    </CardHeader>

    <CardContent class="space-y-3">
      <div class="flex flex-wrap gap-2 text-xs text-muted-foreground">
        <span class="rounded bg-muted px-2 py-0.5">{{ channel || 'No channel' }}</span>
      </div>

      <p v-if="title" class="font-semibold">{{ title }}</p>

      <p v-if="hasContent" class="text-sm whitespace-pre-wrap break-words">{{ preview }}</p>
      <p v-else class="text-sm text-muted-foreground italic">
        Your message preview will appear here.
      </p>
    </CardContent>
  </Card>
</template>
