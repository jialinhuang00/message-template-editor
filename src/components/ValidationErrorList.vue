<script setup lang="ts">
import type { ValidationError } from '@/types'

defineProps<{ errors: ValidationError[] }>()
const emit = defineEmits<{ select: [range: { start: number; end: number }] }>()
</script>

<template>
  <ul v-if="errors.length" class="list-disc space-y-2 pl-5 text-sm text-destructive">
    <li v-for="(error, i) in errors" :key="`${error.field}-${i}`">
      <button
        v-if="error.range"
        type="button"
        class="block w-full text-left hover:underline"
        @click="emit('select', error.range)"
      >
        <span>{{ error.message }}</span>
        <code
          v-if="error.snippet"
          class="mt-1 block w-fit max-w-full overflow-x-auto rounded bg-muted px-2 py-1 font-mono text-xs whitespace-pre text-foreground"
          >{{ error.snippet }}</code
        >
      </button>
      <span v-else>{{ error.message }}</span>
    </li>
  </ul>
</template>
