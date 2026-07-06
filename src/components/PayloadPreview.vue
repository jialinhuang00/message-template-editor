<script setup lang="ts">
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import type { SubmitPayload } from '@/types'

defineProps<{ payload: SubmitPayload | null }>()
</script>

<template>
  <Card v-if="payload">
    <CardHeader>
      <CardTitle>Submitted Payload</CardTitle>
    </CardHeader>
    <CardContent>
      <pre
        class="overflow-x-auto rounded bg-muted p-3 text-xs"
      >{{ JSON.stringify(payload, null, 2) }}</pre>
    </CardContent>
  </Card>
</template>
