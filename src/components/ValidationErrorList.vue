<script setup lang="ts">
import type { ValidationError } from '@/types'

defineProps<{ errors: ValidationError[] }>()
</script>

<template>
  <ul v-if="errors.length" class="space-y-1">
    <li
      v-for="(error, i) in errors"
      :key="`${error.field}-${i}`"
      class="text-sm text-destructive"
    >
      {{ error.message }}
    </li>
  </ul>
</template>
