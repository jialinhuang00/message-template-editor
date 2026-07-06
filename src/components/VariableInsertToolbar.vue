<script setup lang="ts">
import { Button } from '@/components/ui/button'
import { SUPPORTED_VARIABLES } from '@/types'

const emit = defineEmits<{ insert: [name: string] }>()

const tokenLabel = (name: string) => `{{ ${name} }}`
</script>

<template>
  <div class="flex flex-wrap gap-2">
    <Button
      v-for="name in SUPPORTED_VARIABLES"
      :key="name"
      type="button"
      variant="secondary"
      size="sm"
      class="font-mono"
      @click="emit('insert', name)"
    >
      {{ tokenLabel(name) }}
    </Button>
  </div>
</template>
