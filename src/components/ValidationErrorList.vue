<script setup lang="ts">
import type { ValidationError } from '@/types'

defineProps<{ errors: ValidationError[] }>()
const emit = defineEmits<{ select: [range: { start: number; end: number }] }>()
</script>

<template>
  <ul v-if="errors.length" class="space-y-1">
    <li v-for="(error, i) in errors" :key="`${error.field}-${i}`" class="text-sm text-destructive">
      <button
        v-if="error.range"
        type="button"
        class="text-left underline decoration-dotted underline-offset-2 hover:decoration-solid"
        @click="emit('select', error.range)"
      >
        {{ error.message }}
      </button>
      <span v-else>{{ error.message }}</span>
    </li>
  </ul>
</template>
