<script setup lang="ts">
import type { ValidationError } from '@/types'

defineProps<{ errors: ValidationError[] }>()
const emit = defineEmits<{ select: [error: ValidationError] }>()
</script>

<template>
  <ul v-if="errors.length" class="list-disc space-y-2 pl-5 text-sm text-destructive">
    <li v-for="(error, i) in errors" :key="`${error.field}-${i}`">
      <button
        type="button"
        class="hint block w-full cursor-pointer rounded px-1 text-left hover:bg-destructive/5 hover:underline"
        @click="emit('select', error)"
      >
        <span>{{ error.message }}</span>
        <code
          v-if="error.snippet"
          class="mt-1 block w-fit max-w-full overflow-x-auto rounded bg-muted px-2 py-1 font-mono text-xs whitespace-pre text-foreground"
          >{{ error.snippet }}</code
        >
      </button>
    </li>
  </ul>
</template>

<style scoped>
/* A brief pulse on appearance hints the item is clickable, then settles. */
@keyframes clickHint {
  0%,
  100% {
    background-color: transparent;
  }
  45% {
    background-color: rgba(220, 38, 38, 0.12);
  }
}
.hint {
  animation: clickHint 0.9s ease-in-out 2;
}
@media (prefers-reduced-motion: reduce) {
  .hint {
    animation: none;
  }
}
</style>
